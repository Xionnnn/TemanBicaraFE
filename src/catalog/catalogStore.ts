// Catalog rules and SQLite access for one account's database.
// Only type imports here, so the Node tests can load this file directly.
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Catalog, CatalogAsset, CatalogDictionary, WordRequest } from './types';

export type CatalogErrorCode =
  | 'missing_image'
  | 'missing_label'
  | 'duplicate_word'
  | 'missing_dictionary'
  | 'missing_asset'
  | 'invalid_request'
  | 'legacy_schema';

export class CatalogError extends Error {
  code: CatalogErrorCode;

  constructor(code: CatalogErrorCode) {
    super(`Catalog error: ${code}`);
    this.name = 'CatalogError';
    this.code = code;
  }
}

export type StarterCatalog = {
  // Kamus every account starts with. Their IDs are fixed so dummy cards can follow them.
  dictionaries: readonly { id: string; name: string; color: string }[];
  // Dummy cards per starter kamus ID, shown after saved cards and never stored.
  dummyCards: Readonly<Record<string, readonly CatalogAsset[]>>;
};

/** File operations limited to the active account's custom-images folder. */
export type CustomImageFiles = {
  copyIn(sourceUri: string, relativePath: string): Promise<void>;
  remove(relativePath: string): void;
};

// ---- Word rules -------------------------------------------------------------

/** Two words match when they are equal after trimming, ignoring letter case. */
export function wordKey(label: string): string {
  return label.trim().toLowerCase();
}

/** The card in this kamus that already uses the word, if any. */
export function findWordInDictionary(
  cards: readonly CatalogAsset[],
  label: string,
): CatalogAsset | undefined {
  const key = wordKey(label);
  return key ? cards.find((card) => wordKey(card.name) === key) : undefined;
}

/**
 * Saved assets that are not in this kamus yet and contain the typed text.
 * An exact match comes first. Empty text lists every such asset.
 */
export function findWordSuggestions(
  assets: readonly CatalogAsset[],
  cards: readonly CatalogAsset[],
  typed: string,
): CatalogAsset[] {
  const inDictionary = new Set(cards.map((card) => card.id));
  const key = wordKey(typed);
  return assets
    .filter((asset) => !inDictionary.has(asset.id) && wordKey(asset.name).includes(key))
    .sort((a, b) => Number(wordKey(b.name) === key) - Number(wordKey(a.name) === key)
      || a.name.localeCompare(b.name));
}

// ---- Image paths ------------------------------------------------------------

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CUSTOM_IMAGE_PATH = /^custom-images\/[0-9a-f-]{36}\.[a-z0-9]{1,5}$/;
const EXTENSIONS = new Set(['.jpg', '.png', '.webp', '.gif', '.heic', '.heif', '.bmp']);
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/bmp': '.bmp',
};

/** File extension for a picked image, from its file name or MIME type. */
export function imageExtension(uri: string, mimeType?: string | null): string {
  const name = uri.split(/[?#]/)[0].split('/').pop() ?? '';
  const dot = name.lastIndexOf('.');
  const fromName = dot >= 0 ? name.slice(dot).toLowerCase().replace('.jpeg', '.jpg') : '';
  if (EXTENSIONS.has(fromName)) return fromName;
  return MIME_EXTENSIONS[(mimeType ?? '').toLowerCase()] ?? '.jpg';
}

/** Stored path of a custom image, relative to the account's profile directory. */
export function customImagePath(assetId: string, extension: string): string {
  const safeExtension = EXTENSIONS.has(extension) ? extension : '.jpg';
  return `custom-images/${assetId.toLowerCase()}${safeExtension}`;
}

export function isCustomImagePath(path: string): boolean {
  return CUSTOM_IMAGE_PATH.test(path);
}

// ---- Loading ----------------------------------------------------------------

type DictionaryRow = {
  id: string;
  dictionary_name: string;
  dictionary_color: string;
  display_order: number;
};
type AssetRow = {
  id: string;
  asset_name: string;
  default_name: string;
  path: string;
  source_type: 'builtin' | 'custom';
};
type LinkRow = { assetsid: string; dictionariesid: string };

// Columns of the latest Hot ERD that this feature reads or writes.
const REQUIRED_COLUMNS: Record<string, readonly string[]> = {
  assets: ['id', 'asset_name', 'default_name', 'created_at', 'updated_at', 'path', 'source_type'],
  dictionaries: ['id', 'dictionary_name', 'created_at', 'updated_at', 'display_order', 'dictionary_color'],
  assets_dictionaries: ['assetsid', 'dictionariesid', 'display_order'],
};

/** Databases created before the October 27 schema update cannot be used yet. */
async function assertCurrentSchema(db: SQLiteDatabase): Promise<void> {
  for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
    // `table` comes from the constant above, never from input.
    const rows = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
    const present = new Set(rows.map((row) => row.name));
    if (!columns.every((column) => present.has(column))) throw new CatalogError('legacy_schema');
  }
}

/** Adds the starter kamus once, while the account has no kamus at all. */
async function ensureStarterDictionaries(
  db: SQLiteDatabase,
  starter: StarterCatalog,
  now: () => string,
): Promise<void> {
  const countQuery = 'SELECT COUNT(*) AS count FROM dictionaries';
  if (((await db.getFirstAsync<{ count: number }>(countQuery))?.count ?? 0) > 0) return;

  await db.withExclusiveTransactionAsync(async (txn) => {
    if (((await txn.getFirstAsync<{ count: number }>(countQuery))?.count ?? 0) > 0) return;
    const timestamp = now();
    for (const [index, dictionary] of starter.dictionaries.entries()) {
      await txn.runAsync(
        `INSERT INTO dictionaries
         (id, dictionary_name, created_at, updated_at, display_order, dictionary_color)
         VALUES (?, ?, ?, ?, ?, ?)`,
        dictionary.id, dictionary.name, timestamp, timestamp, index, dictionary.color,
      );
    }
  });
}

export async function loadCatalog(
  db: SQLiteDatabase,
  starter: StarterCatalog,
  resolveImageUri: (path: string) => string | undefined,
  now: () => string,
): Promise<Catalog> {
  await assertCurrentSchema(db);
  await ensureStarterDictionaries(db, starter, now);

  const dictionaryRows = await db.getAllAsync<DictionaryRow>(
    `SELECT id, dictionary_name, dictionary_color, display_order
     FROM dictionaries ORDER BY display_order, created_at, id`,
  );
  const assetRows = await db.getAllAsync<AssetRow>(
    `SELECT id, asset_name, default_name, path, source_type
     FROM assets ORDER BY created_at DESC, id`,
  );
  const linkRows = await db.getAllAsync<LinkRow>(
    `SELECT assetsid, dictionariesid
     FROM assets_dictionaries ORDER BY dictionariesid, display_order, assetsid`,
  );

  const assets: CatalogAsset[] = assetRows.map((row) => ({
    id: row.id,
    name: row.asset_name,
    defaultName: row.default_name,
    sourceType: row.source_type,
    path: row.path,
    imageUri: row.source_type === 'custom' && isCustomImagePath(row.path)
      ? resolveImageUri(row.path) : undefined,
  }));
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));

  const dictionaries: CatalogDictionary[] = dictionaryRows.map((row) => ({
    id: row.id,
    name: row.dictionary_name,
    color: row.dictionary_color,
    displayOrder: row.display_order,
  }));
  const assetsByDictionary: Catalog['assetsByDictionary'] = {};
  for (const dictionary of dictionaries) assetsByDictionary[dictionary.id] = [];
  for (const link of linkRows) {
    const asset = assetsById.get(link.assetsid);
    if (asset) assetsByDictionary[link.dictionariesid]?.push(asset);
  }
  for (const dictionary of dictionaries) {
    assetsByDictionary[dictionary.id].push(...(starter.dummyCards[dictionary.id] ?? []));
  }

  return { dictionaries, assetsByDictionary, assets };
}

// ---- Saving -----------------------------------------------------------------

/** Rejects a word that this kamus already shows, as a saved or a dummy card. */
async function assertWordFree(
  db: SQLiteDatabase,
  starter: StarterCatalog,
  dictionaryId: string,
  label: string,
): Promise<void> {
  const dictionary = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM dictionaries WHERE id = ?', dictionaryId,
  );
  if (!dictionary) throw new CatalogError('missing_dictionary');

  const rows = await db.getAllAsync<{ asset_name: string }>(
    `SELECT a.asset_name FROM assets_dictionaries AS ad
     JOIN assets AS a ON a.id = ad.assetsid
     WHERE ad.dictionariesid = ?`,
    dictionaryId,
  );
  const names = [
    ...rows.map((row) => row.asset_name),
    ...(starter.dummyCards[dictionaryId] ?? []).map((card) => card.name),
  ];
  const key = wordKey(label);
  if (names.some((name) => wordKey(name) === key)) throw new CatalogError('duplicate_word');
}

/** Puts the asset first in the kamus and moves the other cards down one place. */
async function linkFirst(db: SQLiteDatabase, assetId: string, dictionaryId: string): Promise<void> {
  await db.runAsync(
    'UPDATE assets_dictionaries SET display_order = display_order + 1 WHERE dictionariesid = ?',
    dictionaryId,
  );
  await db.runAsync(
    'INSERT INTO assets_dictionaries (assetsid, dictionariesid, display_order) VALUES (?, ?, 0)',
    assetId, dictionaryId,
  );
}

/** Deletes an image copied by a failed attempt, unless an asset row uses it. */
async function removeUnsavedImage(
  db: SQLiteDatabase,
  files: CustomImageFiles,
  assetId: string,
  path: string,
): Promise<void> {
  try {
    const saved = await db.getFirstAsync<{ id: string }>('SELECT id FROM assets WHERE id = ?', assetId);
    if (!saved) files.remove(path);
  } catch {
    // If the database cannot confirm, keep the file. An unused file is safer than a missing one.
  }
}

async function createWord(
  db: SQLiteDatabase,
  files: CustomImageFiles,
  starter: StarterCatalog,
  request: Extract<WordRequest, { kind: 'new' }>,
  now: () => string,
): Promise<{ label: string }> {
  const label = request.label.trim();
  if (!label) throw new CatalogError('missing_label');
  if (!request.image) throw new CatalogError('missing_image');
  if (!UUID.test(request.assetId)) throw new CatalogError('invalid_request');

  // The form keeps one ID across retries. If an earlier attempt committed, it is already saved.
  const saved = await db.getFirstAsync<{ asset_name: string }>(
    'SELECT asset_name FROM assets WHERE id = ?', request.assetId,
  );
  if (saved) return { label: saved.asset_name };

  await assertWordFree(db, starter, request.dictionaryId, label);

  // The path uses the new asset ID, so it cannot belong to another asset.
  const path = customImagePath(request.assetId, request.image.extension);
  await files.copyIn(request.image.uri, path);
  try {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await assertWordFree(txn, starter, request.dictionaryId, label);
      const timestamp = now();
      await txn.runAsync(
        `INSERT INTO assets
         (id, asset_name, default_name, created_at, updated_at, path, source_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        request.assetId, label, '', timestamp, timestamp, path, 'custom',
      );
      await linkFirst(txn, request.assetId, request.dictionaryId);
    });
  } catch (error) {
    await removeUnsavedImage(db, files, request.assetId, path);
    throw error;
  }
  return { label };
}

async function linkExistingWord(
  db: SQLiteDatabase,
  starter: StarterCatalog,
  request: Extract<WordRequest, { kind: 'existing' }>,
): Promise<{ label: string }> {
  let label = '';
  await db.withExclusiveTransactionAsync(async (txn) => {
    const asset = await txn.getFirstAsync<{ asset_name: string }>(
      'SELECT asset_name FROM assets WHERE id = ?', request.assetId,
    );
    if (!asset) throw new CatalogError('missing_asset');
    label = asset.asset_name;
    // Also covers an asset that is already linked, since its own name is in the kamus.
    await assertWordFree(txn, starter, request.dictionaryId, asset.asset_name);
    await linkFirst(txn, request.assetId, request.dictionaryId);
  });
  return { label };
}

/**
 * Saves a new custom word, or links an existing one, as the first card of a kamus.
 * A new word's image is copied first; if the database write fails, that copy is removed.
 */
export function addWordToDictionary(
  db: SQLiteDatabase,
  files: CustomImageFiles,
  starter: StarterCatalog,
  request: WordRequest,
  now: () => string,
): Promise<{ label: string }> {
  return request.kind === 'existing'
    ? linkExistingWord(db, starter, request)
    : createWord(db, files, starter, request, now);
}
