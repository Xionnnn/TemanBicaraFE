import type { ImageSourcePropType } from 'react-native';
import type { CatalogAsset } from './types';

// Builtin images will live here and ship inside the app bundle (shared, offline).
// Metro needs static require() calls, so each file must be listed in BUILTIN_IMAGES.
export const BUILTIN_IMAGE_DIRECTORY = 'assets/pecs';

// No builtin image files exist yet.
const BUILTIN_IMAGES: Record<string, ImageSourcePropType> = {};

// Custom images are copied into document/profiles/<account-uuid>/custom-images/.
// assets.path stores "custom-images/<file>", relative to the profile directory.

/** Returns undefined when no image file is available, so the card shows a placeholder. */
export function resolveAssetImage(asset: CatalogAsset): ImageSourcePropType | undefined {
  if (asset.sourceType === 'builtin') return BUILTIN_IMAGES[asset.path];
  return asset.imageUri ? { uri: asset.imageUri } : undefined;
}
