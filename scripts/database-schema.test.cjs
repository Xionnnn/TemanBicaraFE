const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { test } = require('node:test');
const { INITIAL_SCHEMA } = require('../src/database/schema.ts');

function createDatabase(t) {
  const database = new DatabaseSync(':memory:');
  t.after(() => database.close());
  database.exec('PRAGMA foreign_keys = ON');
  database.exec(INITIAL_SCHEMA);
  return database;
}

const timestamp = '2026-10-20T00:00:00.000Z';

function insertSession(database) {
  database.prepare(
    'INSERT INTO sessions (id, user_id, started_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
  ).run('session-a', 'user-a', timestamp, timestamp, timestamp);
}

function insertAsset(database) {
  database.prepare(
    `INSERT INTO assets
     (id, asset_name, default_name, created_at, updated_at, path, source_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run('asset-a', 'water', 'Minum', timestamp, timestamp, 'custom-images/a.jpg', 'custom');
}

test('an event requires an existing session and a unique stable ID', (t) => {
  const database = createDatabase(t);
  const insert = database.prepare(
    `INSERT INTO event_logs
     (id, event_type, payload, created_at, updated_at, sessionid)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const event = ['event-a', 'asset_selected', '{"version":1}', timestamp, timestamp, 'session-a'];
  assert.throws(() => insert.run(...event), /FOREIGN KEY/);
  insertSession(database);
  insert.run(...event);
  assert.throws(() => insert.run(...event), /UNIQUE/);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM event_logs').get().count, 1);
  assert.equal(database.prepare('SELECT ended_at FROM sessions').get().ended_at, null);
  assert.equal(database.prepare('SELECT received_at FROM event_logs').get().received_at, null);
  database.prepare('UPDATE event_logs SET received_at = ? WHERE id = ?').run(
    '2026-10-21T00:00:00.000Z', 'event-a',
  );
  const storedEvent = database.prepare('SELECT * FROM event_logs').get();
  assert.equal(storedEvent.received_at, '2026-10-21T00:00:00.000Z');
  assert.equal(storedEvent.created_at, timestamp);
  assert.equal(storedEvent.updated_at, timestamp);
});

test('events reject malformed JSON and unsupported event types', (t) => {
  const database = createDatabase(t);
  insertSession(database);
  const insert = database.prepare(
    `INSERT INTO event_logs
     (id, event_type, payload, created_at, updated_at, sessionid)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  assert.throws(
    () => insert.run('event-a', 'asset_selected', '{invalid', timestamp, timestamp, 'session-a'),
    /CHECK/,
  );
  assert.throws(
    () => insert.run('event-b', 'unknown', '{}', timestamp, timestamp, 'session-a'),
    /CHECK/,
  );
});

test('assets retain a default name without a separate settings table', (t) => {
  const database = createDatabase(t);
  insertAsset(database);
  database.prepare('UPDATE assets SET asset_name = ? WHERE id = ?').run('Air', 'asset-a');
  assert.equal(database.prepare('SELECT default_name FROM assets').get().default_name, 'Minum');
  assert.throws(() => database.exec('UPDATE assets SET default_name = NULL'), /NOT NULL/);
  assert.equal(database.prepare("SELECT name FROM sqlite_master WHERE name = 'asset_settings'").get(), undefined);
});

test('dictionaries can be empty and share assets without duplicate memberships', (t) => {
  const database = createDatabase(t);
  insertAsset(database);
  const insertDictionary = database.prepare(
    `INSERT INTO dictionaries
     (id, dictionary_name, created_at, updated_at, display_order, dictionary_color)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  insertDictionary.run('dictionary-a', 'Makan', timestamp, timestamp, 0, '#008000');
  insertDictionary.run('dictionary-b', 'Rumah', timestamp, timestamp, 1, '#0000FF');
  assert.throws(() => insertDictionary.run('dictionary-c', 'Tanpa warna', timestamp, timestamp, 2, null), /NOT NULL/);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM assets_dictionaries').get().count, 0);
  const insertLink = database.prepare(
    'INSERT INTO assets_dictionaries (assetsid, dictionariesid, display_order) VALUES (?, ?, ?)',
  );
  insertLink.run('asset-a', 'dictionary-a', 0);
  insertLink.run('asset-a', 'dictionary-b', 2);
  assert.throws(() => insertLink.run('asset-a', 'dictionary-a', 1), /UNIQUE/);
  assert.throws(() => insertLink.run('missing', 'dictionary-a', 1), /FOREIGN KEY/);
  assert.throws(() => database.exec('UPDATE assets_dictionaries SET display_order = -1'), /CHECK/);
  assert.throws(() => database.exec("DELETE FROM assets WHERE id = 'asset-a'"), /FOREIGN KEY/);
});

test('the fresh schema has exactly the tables and columns in the Hot ERD', (t) => {
  const database = createDatabase(t);
  const expected = {
    sessions: ['id', 'user_id', 'started_at', 'ended_at', 'created_at', 'updated_at'],
    event_logs: ['id', 'event_type', 'payload', 'created_at', 'updated_at', 'received_at', 'sessionid'],
    assets: ['id', 'asset_name', 'default_name', 'created_at', 'updated_at', 'path', 'source_type'],
    dictionaries: ['id', 'dictionary_name', 'created_at', 'updated_at', 'display_order', 'dictionary_color'],
    assets_dictionaries: ['assetsid', 'dictionariesid', 'display_order'],
  };
  const tables = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all();
  assert.deepEqual(tables.map((row) => row.name), Object.keys(expected).sort());
  for (const [table, columns] of Object.entries(expected)) {
    const actual = database.prepare(`PRAGMA table_info(${table})`).all();
    assert.deepEqual(actual.map((column) => column.name).sort(), [...columns].sort());
  }
});
