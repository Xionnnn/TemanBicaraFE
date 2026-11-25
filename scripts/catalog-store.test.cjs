const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { test } = require('node:test');
const { INITIAL_SCHEMA } = require('../src/database/schema.ts');
const {
  CatalogError, addWordToDictionary, dictionaryNamesByAsset, findWordInDictionary, findWordSuggestions,
  imageExtension, loadCatalog,
} = require('../src/catalog/catalogStore.ts');
const {
  EMPTY_WORD_FORM, hasPicture, isImageLocked, previewUri, wordFormReducer, wordRequest,
} = require('../src/catalog/wordForm.ts');

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
const existingWord = (assetId, dictionaryId = KAMUS_B) => ({ kind: 'existing', assetId, dictionaryId });
const names = (catalog, id) => catalog.assetsByDictionary[id].map((asset) => asset.name);
const count = (sqlite, table) => sqlite.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
const links = (sqlite, dictionaryId) => sqlite.prepare(
  'SELECT assetsid, display_order FROM assets_dictionaries WHERE dictionariesid = ? ORDER BY display_order',
).all(dictionaryId).map((link) => [link.assetsid, link.display_order]);

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

test('saving a selected saved word adds only a membership, first in the kamus', async (t) => {
  const sqlite = openSqlite(t);
  const db = adapt(sqlite);
  const files = fakeFiles();
  await load(db);
  await addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum', KAMUS_A), now);
  await addWordToDictionary(db, files, starter, newWord(ID_2, 'Main', KAMUS_B), now);
  await addWordToDictionary(db, files, starter, newWord(ID_3, 'Tidur', KAMUS_A), now);
  const sourceBefore = sqlite.prepare('SELECT * FROM assets WHERE id = ?').get(ID_1);
  const kamusABefore = links(sqlite, KAMUS_A);
  const filesBefore = new Map(files.stored);

  const result = await addWordToDictionary(db, files, starter, existingWord(ID_1), now);
  assert.deepEqual(result, { label: 'Minum' });

  assert.equal(count(sqlite, 'assets'), 3, 'no asset row added');
  assert.deepEqual(files.stored, filesBefore, 'no image copied or removed');
  assert.deepEqual(links(sqlite, KAMUS_B), [[ID_1, 0], [ID_2, 1]], 'same asset ID, others shifted');
  assert.deepEqual(links(sqlite, KAMUS_A), kamusABefore, 'other kamus ordering unchanged');
  assert.deepEqual(sqlite.prepare('SELECT * FROM assets WHERE id = ?').get(ID_1), sourceBefore);

  const catalog = await load(db);
  assert.deepEqual(names(catalog, KAMUS_B), ['Minum', 'Main']);
  const kamusNames = dictionaryNamesByAsset(catalog);
  assert.deepEqual(kamusNames.get(ID_1), ['Kebutuhan', 'Aktivitas']);
  assert.equal(kamusNames.has('card-makan'), false, 'dummy cards are not saved assets');
});

test('a selected saved word is rejected when the kamus already shows that word', async (t) => {
  const sqlite = openSqlite(t);
  const db = adapt(sqlite);
  const files = fakeFiles();
  await load(db);
  await addWordToDictionary(db, files, starter, newWord(ID_1, 'Makan Siang', KAMUS_B), now);
  // Another kamus may hold the same word as a separate asset.
  await addWordToDictionary(db, files, starter, newWord(ID_2, ' makan siang ', KAMUS_A), now);
  await assert.rejects(addWordToDictionary(db, files, starter, existingWord(ID_2, KAMUS_B), now),
    (error) => error.code === 'duplicate_word');
  await assert.rejects(addWordToDictionary(db, files, starter, existingWord(ID_1, KAMUS_B), now),
    (error) => error.code === 'duplicate_word', 'an asset already in this kamus');

  // A dummy card counts too: kamus A shows a dummy "Makan".
  await addWordToDictionary(db, files, starter, newWord(ID_3, 'Makan', KAMUS_B), now);
  await assert.rejects(addWordToDictionary(db, files, starter, existingWord(ID_3, KAMUS_A), now),
    (error) => error.code === 'duplicate_word');

  assert.deepEqual(links(sqlite, KAMUS_A), [[ID_2, 0]]);
  assert.deepEqual(links(sqlite, KAMUS_B), [[ID_3, 0], [ID_1, 1]]);
  await assert.rejects(addWordToDictionary(db, files, starter,
    existingWord('44444444-4444-4444-8444-444444444444'), now), (error) => error.code === 'missing_asset');
});

test('a failed membership save changes nothing and can be retried', async (t) => {
  const sqlite = openSqlite(t);
  let failLinks = false;
  const db = adapt(sqlite, (sql) => failLinks && sql.startsWith('INSERT INTO assets_dictionaries'));
  const files = fakeFiles();
  await load(db);
  await addWordToDictionary(db, files, starter, newWord(ID_1, 'Minum', KAMUS_A), now);
  await addWordToDictionary(db, files, starter, newWord(ID_2, 'Main', KAMUS_B), now);

  failLinks = true;
  await assert.rejects(addWordToDictionary(db, files, starter, existingWord(ID_1), now), /simulated/);
  assert.deepEqual(links(sqlite, KAMUS_B), [[ID_2, 0]], 'the order shift was rolled back');
  assert.equal(files.stored.size, 2, 'source image kept');

  failLinks = false;
  await addWordToDictionary(db, files, starter, existingWord(ID_1), now);
  assert.deepEqual(links(sqlite, KAMUS_B), [[ID_1, 0], [ID_2, 1]]);
  assert.equal(count(sqlite, 'assets'), 2);
});

test('a saved word from another account cannot be added', async (t) => {
  const sqliteA = openSqlite(t);
  const sqliteB = openSqlite(t);
  const filesA = fakeFiles();
  const filesB = fakeFiles();
  await load(adapt(sqliteA));
  await load(adapt(sqliteB));
  await addWordToDictionary(adapt(sqliteA), filesA, starter, newWord(ID_1, 'Minum', KAMUS_A), now);

  await assert.rejects(addWordToDictionary(adapt(sqliteB), filesB, starter, existingWord(ID_1), now),
    (error) => error.code === 'missing_asset');
  assert.equal(count(sqliteB, 'assets_dictionaries'), 0);
  assert.equal(filesB.stored.size, 0);
  assert.deepEqual(links(sqliteA, KAMUS_B), []);
});

test('form: choosing a saved word fills it and locks the picture', () => {
  const minum = { id: ID_1, name: 'Minum', imageUri: 'file:///profile/custom-images/1.jpg' };
  const main = { id: ID_2, name: 'Main', imageUri: 'file:///profile/custom-images/2.jpg' };
  let form = wordFormReducer(EMPTY_WORD_FORM, { type: 'pickImage', image: picked });
  form = wordFormReducer(form, { type: 'select', asset: minum });
  assert.deepEqual(form, { label: 'Minum', image: null, selected: minum });
  assert.equal(isImageLocked(form), true);
  assert.equal(previewUri(form), minum.imageUri);
  assert.equal(wordFormReducer(form, { type: 'pickImage', image: picked }), form, 'picker ignored');
  assert.deepEqual(wordRequest(form, ID_3, KAMUS_B), { kind: 'existing', assetId: ID_1, dictionaryId: KAMUS_B });

  form = wordFormReducer(form, { type: 'select', asset: main });
  assert.deepEqual(form, { label: 'Main', image: null, selected: main });
  assert.equal(isImageLocked(form), true);
  assert.equal(previewUri(form), main.imageUri);
});

test('form: editing or clearing the name returns to a new word', () => {
  const minum = { id: ID_1, name: 'Minum', imageUri: 'file:///profile/custom-images/1.jpg' };
  const selected = wordFormReducer(EMPTY_WORD_FORM, { type: 'select', asset: minum });

  let form = wordFormReducer(selected, { type: 'editLabel', label: 'Minu' });
  assert.deepEqual(form, { label: 'Minu', image: null, selected: null });
  assert.equal(isImageLocked(form), false);
  assert.equal(previewUri(form), undefined);
  assert.equal(hasPicture(form), false);

  form = wordFormReducer(form, { type: 'editLabel', label: 'Minum' });
  assert.equal(form.selected, null, 'typing the old name again does not select it');
  assert.equal(previewUri(form), undefined);

  assert.deepEqual(wordFormReducer(selected, { type: 'editLabel', label: '' }),
    { label: '', image: null, selected: null });

  form = wordFormReducer(form, { type: 'pickImage', image: picked });
  assert.deepEqual(wordRequest(form, ID_3, KAMUS_B),
    { kind: 'new', assetId: ID_3, dictionaryId: KAMUS_B, label: 'Minum', image: picked });
  assert.equal(minum.imageUri, 'file:///profile/custom-images/1.jpg', 'source asset object untouched');
});

test('form: a manually picked image survives name edits', () => {
  let form = wordFormReducer(EMPTY_WORD_FORM, { type: 'pickImage', image: picked });
  form = wordFormReducer(form, { type: 'editLabel', label: 'Jus' });
  form = wordFormReducer(form, { type: 'editLabel', label: '' });
  assert.deepEqual(form, { label: '', image: picked, selected: null });
  assert.equal(previewUri(form), picked.uri);
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
    { id: 'd', name: 'Minum', sourceType: 'custom' },
  ];
  assert.equal(findWordInDictionary(saved, '  MINUM ').id, 'b');
  assert.equal(findWordInDictionary(saved, ''), undefined);
  assert.deepEqual(findWordSuggestions(saved, [], 'minum').map((a) => a.id), ['b', 'd', 'a'],
    'assets with the same name are all listed');
  // The kamus holds a different asset named "Minum": both saved "minum" assets are hidden.
  const otherMinum = { id: 'x', name: ' MINUM ', sourceType: 'custom' };
  assert.deepEqual(findWordSuggestions(saved, [otherMinum], 'minum').map((a) => a.id), ['a']);
  assert.deepEqual(findWordSuggestions(saved, [], '').map((a) => a.id), ['c', 'b', 'd', 'a']);
  const dummy = { id: 'card-main', name: 'Main', dummy: true };
  assert.deepEqual(findWordSuggestions(saved, [dummy], 'ma').map((a) => a.id), []);
  assert.equal(imageExtension('file:///cache/x.JPEG'), '.jpg');
  assert.equal(imageExtension('file:///cache/x', 'image/png'), '.png');
  assert.equal(imageExtension('content://media/123'), '.jpg');
});
