const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { test } = require('node:test');
const { INITIAL_SCHEMA } = require('../src/database/schema.ts');
const {
  CatalogError, addWordToDictionary, findWordInDictionary, findWordSuggestions,
  imageExtension, loadCatalog,
} = require('../src/catalog/catalogStore.ts');

const KAMUS_A = 'a0806ad0-8270-479b-8e17-59a1c94e8109';
const KAMUS_B = 'a2292faf-d036-4133-aea8-25fa2044ae5b';
const ID_1 = '11111111-1111-4111-8111-111111111111';
const ID_2 = '22222222-2222-4222-8222-222222222222';
const ID_3 = '33333333-3333-4333-8333-333333333333';
const starter = {
  dictionaries: [
    { id: KAMUS_A, name: 'Kebutuhan', color: '#E0F2FE' },
    { id: KAMUS_B, name: 'Aktivitas', color: '#FEF3C7' },
  ],
  dummyCards: {
    [KAMUS_A]: [{ id: 'card-makan', name: 'Makan', defaultName: 'Makan', sourceType: 'builtin', path: 'card-makan.png', dummy: true }],
    [KAMUS_B]: [],
  },
};
const picked = { uri: 'file:///cache/ImagePicker/picked.jpg', extension: '.jpg' };
let clock = 0;
const now = () => new Date(Date.UTC(2026, 10, 11, 0, 0, clock++)).toISOString();

// The subset of the expo-sqlite async API that catalogStore uses, over node:sqlite.
function adapt(sqlite, failOn) {
  const db = {
    async getAllAsync(sql, ...params) { return sqlite.prepare(sql).all(...params); },
    async getFirstAsync(sql, ...params) { return sqlite.prepare(sql).get(...params) ?? null; },
    async runAsync(sql, ...params) {
      if (failOn?.(sql)) throw new Error('simulated database failure');
      return sqlite.prepare(sql).run(...params);
    },
    async withExclusiveTransactionAsync(task) {
      sqlite.exec('BEGIN EXCLUSIVE');
      try { await task(db); sqlite.exec('COMMIT'); } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return db;
}

function openSqlite(t, file = ':memory:') {
  const sqlite = new DatabaseSync(file);
  t.after(() => { if (sqlite.isOpen) sqlite.close(); });
  sqlite.exec('PRAGMA foreign_keys = ON');
  if (sqlite.prepare('PRAGMA user_version').get().user_version === 0) {
    sqlite.exec(INITIAL_SCHEMA);
    sqlite.exec('PRAGMA user_version = 1');
  }
  return sqlite;
}

function fakeFiles() {
  const stored = new Map();
  return {
    stored,
    failCopy: false,
    async copyIn(sourceUri, relativePath) {
      if (this.failCopy) throw new Error('simulated copy failure');
      stored.set(relativePath, sourceUri);
    },
    remove(relativePath) { stored.delete(relativePath); },
  };
}

const load = (db) => loadCatalog(db, starter, (p) => `file:///profile/${p}`, now);
const newWord = (assetId, label, dictionaryId = KAMUS_A, image = picked) =>
  ({ kind: 'new', assetId, dictionaryId, label, image });
const names = (catalog, id) => catalog.assetsByDictionary[id].map((asset) => asset.name);

test('starter kamus are saved once per account database', async (t) => {
  const sqlite = openSqlite(t);
  const db = adapt(sqlite);
  const first = await load(db);
  await load(db);
  assert.deepEqual(first.dictionaries.map((d) => [d.id, d.name, d.color, d.displayOrder]), [
    [KAMUS_A, 'Kebutuhan', '#E0F2FE', 0],
    [KAMUS_B, 'Aktivitas', '#FEF3C7', 1],
  ]);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM dictionaries').get().count, 2);
  assert.deepEqual(names(first, KAMUS_A), ['Makan']);
  assert.equal(first.assets.length, 0, 'dummy cards are not stored');
});

test('a new word is stored as a custom asset at the front of the kamus', async (t) => {
  const sqlite = openSqlite(t);
  const db = adapt(sqlite);
  const files = fakeFiles();
  await load(db);
  await addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum'), now);
  const result = await addWordToDictionary(db, files, starter, newWord(ID_2, '  Jus Jeruk!  '), now);
  assert.deepEqual(result, { label: 'Jus Jeruk!' });

  const row = sqlite.prepare('SELECT * FROM assets WHERE id = ?').get(ID_2);
  assert.equal(row.asset_name, 'Jus Jeruk!');
  assert.equal(row.default_name, '');
  assert.equal(row.source_type, 'custom');
  assert.equal(row.path, `custom-images/${ID_2}.jpg`);
  assert.equal(row.created_at, row.updated_at);
  assert.match(row.created_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
  assert.equal(files.stored.get(`custom-images/${ID_2}.jpg`), picked.uri);

  const links = sqlite.prepare(
    'SELECT assetsid, display_order FROM assets_dictionaries WHERE dictionariesid = ? ORDER BY display_order',
  ).all(KAMUS_A);
  assert.deepEqual(links.map((link) => [link.assetsid, link.display_order]), [[ID_2, 0], [ID_1, 1]]);

  const catalog = await load(db);
  assert.deepEqual(names(catalog, KAMUS_A), ['Jus Jeruk!', 'Minum', 'Makan']);
  assert.equal(catalog.assetsByDictionary[KAMUS_A][0].imageUri, `file:///profile/custom-images/${ID_2}.jpg`);
});

test('a word needs an image and a non-blank label; nothing is written otherwise', async (t) => {
  const sqlite = openSqlite(t);
  const db = adapt(sqlite);
  const files = fakeFiles();
  await load(db);
  await assert.rejects(addWordToDictionary(db, files, starter, newWord(ID_1, '   '), now),
    (error) => error instanceof CatalogError && error.code === 'missing_label');
  await assert.rejects(addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum', KAMUS_A, null), now),
    (error) => error.code === 'missing_image');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM assets').get().count, 0);
  assert.equal(files.stored.size, 0);
});

test('the same word cannot appear twice in one kamus, but may in another', async (t) => {
  const sqlite = openSqlite(t);
  const db = adapt(sqlite);
  const files = fakeFiles();
  await load(db);
  await addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum'), now);
  await assert.rejects(addWordToDictionary(db, files, starter, newWord(ID_2, ' minum '), now),
    (error) => error.code === 'duplicate_word');
  await assert.rejects(addWordToDictionary(db, files, starter, newWord(ID_2, 'MAKAN'), now),
    (error) => error.code === 'duplicate_word', 'dummy cards shown in the kamus count too');
  assert.equal(files.stored.size, 1, 'a rejected word copies no image');
  await addWordToDictionary(db, files, starter, newWord(ID_2, 'Minum', KAMUS_B), now);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM assets').get().count, 2);
});

test('linking an existing word adds no asset and puts it first', async (t) => {
  const sqlite = openSqlite(t);
  const db = adapt(sqlite);
  const files = fakeFiles();
  await load(db);
  await addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum', KAMUS_A), now);
  await addWordToDictionary(db, files, starter, newWord(ID_2, 'Main', KAMUS_B), now);
  const result = await addWordToDictionary(db, files, starter,
    { kind: 'existing', assetId: ID_1, dictionaryId: KAMUS_B }, now);
  assert.deepEqual(result, { label: 'Minum' });
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM assets').get().count, 2);
  assert.equal(files.stored.size, 2);
  assert.deepEqual(names(await load(db), KAMUS_B), ['Minum', 'Main']);
  await assert.rejects(addWordToDictionary(db, files, starter,
    { kind: 'existing', assetId: ID_1, dictionaryId: KAMUS_B }, now), (error) => error.code === 'duplicate_word');
  await assert.rejects(addWordToDictionary(db, files, starter,
    { kind: 'existing', assetId: ID_3, dictionaryId: KAMUS_B }, now), (error) => error.code === 'missing_asset');
});

test('a failed database write removes the copied image, and a retry with the same ID works', async (t) => {
  const sqlite = openSqlite(t);
  let failLinks = true;
  const db = adapt(sqlite, (sql) => failLinks && sql.startsWith('INSERT INTO assets_dictionaries'));
  const files = fakeFiles();
  await load(db);
  await addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum'), now).catch(() => undefined);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM assets').get().count, 0);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM assets_dictionaries').get().count, 0);
  assert.equal(files.stored.size, 0, 'no orphan image');

  failLinks = false;
  await addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum'), now);
  // A further retry after a successful save does not create a second asset.
  await addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum'), now);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM assets').get().count, 1);
  assert.deepEqual([...files.stored.keys()], [`custom-images/${ID_1}.jpg`]);
});

test('a failed image copy writes nothing to the database', async (t) => {
  const sqlite = openSqlite(t);
  const db = adapt(sqlite);
  const files = fakeFiles();
  files.failCopy = true;
  await load(db);
  await assert.rejects(addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum'), now), /copy failure/);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM assets').get().count, 0);
});

test('words stay in their own account and survive reopening the database file', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'temanbicara-catalog-'));
  const fileA = path.join(dir, 'account-a.db');
  const sqliteA = openSqlite(t, fileA);
  const sqliteB = openSqlite(t, path.join(dir, 'account-b.db'));
  const files = fakeFiles();
  await load(adapt(sqliteA));
  await load(adapt(sqliteB));
  await addWordToDictionary(adapt(sqliteA), files, starter, newWord(ID_1, 'Minum'), now);

  assert.deepEqual(names(await load(adapt(sqliteB)), KAMUS_A), ['Makan']);
  sqliteA.close();
  const reopened = openSqlite(t, fileA);
  // Registered last: hooks run in order, so every database is closed before removal.
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const catalog = await load(adapt(reopened));
  assert.deepEqual(names(catalog, KAMUS_A), ['Minum', 'Makan']);
  assert.equal(reopened.prepare('SELECT COUNT(*) AS count FROM dictionaries').get().count, 2);
});

test('a database with the older version 1 structure is reported, not changed', async (t) => {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  sqlite.exec(`
    CREATE TABLE assets (id TEXT PRIMARY KEY, asset_name TEXT, label TEXT, created_at TEXT,
      updated_at TEXT, path TEXT, source_type TEXT);
    CREATE TABLE dictionaries (id TEXT PRIMARY KEY, dictionary_name TEXT, created_at TEXT,
      updated_at TEXT, display_order INTEGER);
    CREATE TABLE assets_dictionaries (assetsid TEXT, dictionariesid TEXT, position INTEGER);
  `);
  await assert.rejects(load(adapt(sqlite)), (error) => error.code === 'legacy_schema');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM dictionaries').get().count, 0);
});

test('word matching and suggestions', () => {
  const saved = [
    { id: 'a', name: 'Minum Air', sourceType: 'custom' },
    { id: 'b', name: 'minum', sourceType: 'custom' },
    { id: 'c', name: 'Main', sourceType: 'custom' },
  ];
  assert.equal(findWordInDictionary(saved, '  MINUM ').id, 'b');
  assert.equal(findWordInDictionary(saved, ''), undefined);
  assert.deepEqual(findWordSuggestions(saved, [], 'minum').map((a) => a.id), ['b', 'a']);
  assert.deepEqual(findWordSuggestions(saved, [saved[1]], 'minum').map((a) => a.id), ['a']);
  assert.deepEqual(findWordSuggestions(saved, [], '').map((a) => a.id), ['c', 'b', 'a']);
  assert.equal(imageExtension('file:///cache/x.JPEG'), '.jpg');
  assert.equal(imageExtension('file:///cache/x', 'image/png'), '.png');
  assert.equal(imageExtension('content://media/123'), '.jpg');
});
