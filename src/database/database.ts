import { Directory, Paths } from 'expo-file-system';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_VERSION, INITIAL_SCHEMA } from './schema';

export const DATABASE_NAME = 'temanbicara.db';

export type UserDatabase = {
  userId: string;
  database: SQLiteDatabase;
  profileDirectory: Directory;
  customImagesDirectory: Directory;
};

/**
 * Creates/upgrades the schema before the connection is made available to callers.
 * Future changes must add migrations and increment DATABASE_VERSION.
 */
export async function initializeDatabase(database: SQLiteDatabase): Promise<void> {
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const result = await transaction.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
    );
    const version = result?.user_version ?? 0;

    if (version > DATABASE_VERSION) {
      throw new Error('This database was created by a newer version of TemanBicara.');
    }

    if (version === 0) {
      await transaction.execAsync(INITIAL_SCHEMA);
      await transaction.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    }
  });
}

/**
 * Android/iOS entry point. Pass the verified account ID returned by Cold API.
 * Open once for the active account and reuse the returned connection.
 * Before switching accounts, finish/cancel outstanding work and closeAsync().
 * Closing the connection preserves the database and custom images.
 */
export async function openUserDatabase(userId: string): Promise<UserDatabase> {
  // Our domain IDs are GUIDs. Reject paths, empty IDs and arbitrary folder names.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    throw new Error('A valid account UUID is required to open a user database.');
  }

  const normalizedUserId = userId.toLowerCase();
  const profileDirectory = new Directory(Paths.document, 'profiles', normalizedUserId);
  const customImagesDirectory = new Directory(profileDirectory, 'custom-images');
  customImagesDirectory.create({ intermediates: true, idempotent: true });

  const database = await openDatabaseAsync(
    DATABASE_NAME,
    { useNewConnection: true },
    profileDirectory.uri,
  );

  try {
    await initializeDatabase(database);
  } catch (error) {
    await database.closeAsync();
    throw error;
  }

  return {
    userId: normalizedUserId,
    database,
    profileDirectory,
    customImagesDirectory,
  };
}
