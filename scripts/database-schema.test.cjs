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
     (id, asset_name, label, created_at, updated_at, path, source_type)
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

test('an asset can have no settings or exactly one row of nullable overrides', (t) => {
  const database = createDatabase(t);
  insertAsset(database);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM asset_settings').get().count, 0);
  const insert = database.prepare(
    'INSERT INTO asset_settings (id, created_at, updated_at, assetid) VALUES (?, ?, ?, ?)',
  );
  insert.run('settings-a', timestamp, timestamp, 'asset-a');
  const settings = database.prepare('SELECT * FROM asset_settings').get();
  assert.equal(settings.label_override, null);
  assert.equal(settings.font_size, null);
  assert.equal(settings.letter_spacing, null);
  assert.throws(() => insert.run('settings-b', timestamp, timestamp, 'asset-a'), /UNIQUE/);
  assert.throws(() => insert.run('settings-c', timestamp, timestamp, null), /NOT NULL/);
});

test('dictionaries can be empty and share assets without duplicate memberships', (t) => {
  const database = createDatabase(t);
  insertAsset(database);
  const insertDictionary = database.prepare(
    `INSERT INTO dictionaries
     (id, dictionary_name, created_at, updated_at, display_order)
     VALUES (?, ?, ?, ?, ?)`,
  );
  insertDictionary.run('dictionary-a', 'Makan', timestamp, timestamp, 0);
  insertDictionary.run('dictionary-b', 'Rumah', timestamp, timestamp, 1);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM assets_dictionaries').get().count, 0);
  const insertLink = database.prepare(
    'INSERT INTO assets_dictionaries (assetsid, dictionariesid, position) VALUES (?, ?, ?)',
  );
  insertLink.run('asset-a', 'dictionary-a', 0);
  insertLink.run('asset-a', 'dictionary-b', 2);
  assert.throws(() => insertLink.run('asset-a', 'dictionary-a', 1), /UNIQUE/);
  assert.throws(() => insertLink.run('missing', 'dictionary-a', 1), /FOREIGN KEY/);
  assert.throws(() => database.exec("DELETE FROM assets WHERE id = 'asset-a'"), /FOREIGN KEY/);
});
