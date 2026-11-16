import type { UserDatabase } from '../database/database';
import { addWordToDictionary, loadCatalog } from './catalogStore';
import { customImageFiles, customImageUri } from './imageStorage';
import { STARTER_CATALOG } from './starterCatalog';
import type { Catalog, WordRequest } from './types';

const now = () => new Date().toISOString();

/**
 * Reads the account's kamus and saved words from its SQLite database.
 * Starter kamus also show the DUMMY PECS mock cards, which are not stored.
 */
export function loadAccountCatalog(storage: UserDatabase): Promise<Catalog> {
  return loadCatalog(storage.database, STARTER_CATALOG, (path) => customImageUri(storage, path), now);
}

/** Saves a word into the account's database and custom-images folder. No network use. */
export function saveAccountWord(storage: UserDatabase, request: WordRequest): Promise<{ label: string }> {
  return addWordToDictionary(storage.database, customImageFiles(storage), STARTER_CATALOG, request, now);
}
