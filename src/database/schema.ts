// Version 1 follows the agreed Hot DB ERD. Cloud-only fields stay on the server.
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
    sessionid TEXT NOT NULL REFERENCES sessions(id)
  );

  CREATE TABLE assets (
    id TEXT PRIMARY KEY NOT NULL,
    asset_name TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    path TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('builtin', 'custom'))
  );

  CREATE TABLE asset_settings (
    id TEXT PRIMARY KEY NOT NULL,
    label_override TEXT,
    font_size REAL CHECK (font_size IS NULL OR font_size > 0),
    letter_spacing REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    assetid TEXT NOT NULL UNIQUE REFERENCES assets(id)
  );

  CREATE TABLE dictionaries (
    id TEXT PRIMARY KEY NOT NULL,
    dictionary_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    display_order INTEGER NOT NULL CHECK (display_order >= 0)
  );

  CREATE TABLE assets_dictionaries (
    assetsid TEXT NOT NULL REFERENCES assets(id),
    dictionariesid TEXT NOT NULL REFERENCES dictionaries(id),
    position INTEGER NOT NULL CHECK (position >= 0),
    PRIMARY KEY (assetsid, dictionariesid)
  );

  CREATE INDEX event_logs_session_created
    ON event_logs(sessionid, created_at);
  CREATE INDEX assets_dictionaries_dictionary_position
    ON assets_dictionaries(dictionariesid, position);
`;
