export const DATABASE_VERSION = 1;

export const INITIAL_SCHEMA = `
  CREATE TABLE sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE event_logs (
    id TEXT PRIMARY KEY NOT NULL,
    event_type TEXT NOT NULL
      CHECK (event_type IN ('asset_selected', 'message_completed')),
    payload TEXT NOT NULL CHECK (json_valid(payload)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    received_at TEXT,
    sessionid TEXT NOT NULL REFERENCES sessions(id)
  );

  CREATE TABLE assets (
    id TEXT PRIMARY KEY NOT NULL,
    asset_name TEXT NOT NULL,
    default_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    path TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('builtin', 'custom'))
  );

  CREATE TABLE dictionaries (
    id TEXT PRIMARY KEY NOT NULL,
    dictionary_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    display_order INTEGER NOT NULL CHECK (display_order >= 0),
    dictionary_color TEXT NOT NULL
  );

  CREATE TABLE assets_dictionaries (
    assetsid TEXT NOT NULL REFERENCES assets(id),
    dictionariesid TEXT NOT NULL REFERENCES dictionaries(id),
    display_order INTEGER NOT NULL CHECK (display_order >= 0),
    PRIMARY KEY (assetsid, dictionariesid)
  );

  CREATE INDEX event_logs_session_created
    ON event_logs(sessionid, created_at);
  CREATE INDEX assets_dictionaries_dictionary_display_order
    ON assets_dictionaries(dictionariesid, display_order);
`;
