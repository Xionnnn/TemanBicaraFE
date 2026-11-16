import { File } from 'expo-file-system';
import type { UserDatabase } from '../database/database';
import { isCustomImagePath, type CustomImageFiles } from './catalogStore';

function fileAt(storage: UserDatabase, relativePath: string): File {
  if (!isCustomImagePath(relativePath)) throw new Error('Invalid custom image path.');
  return new File(storage.profileDirectory, ...relativePath.split('/'));
}

/** Copies and removes files inside this account's custom-images folder only. */
export function customImageFiles(storage: UserDatabase): CustomImageFiles {
  return {
    async copyIn(sourceUri, relativePath) {
      storage.customImagesDirectory.create({ intermediates: true, idempotent: true });
      // The picker returns a cache file, which the system may delete; keep a persistent copy.
      await new File(sourceUri).copy(fileAt(storage, relativePath), { overwrite: true });
    },
    remove(relativePath) {
      const file = fileAt(storage, relativePath);
      if (file.exists) file.delete();
    },
  };
}

/** File URI for a stored custom image, or undefined when the file is not on this device. */
export function customImageUri(storage: UserDatabase, relativePath: string): string | undefined {
  if (!isCustomImagePath(relativePath)) return undefined;
  const file = fileAt(storage, relativePath);
  return file.exists ? file.uri : undefined;
}
