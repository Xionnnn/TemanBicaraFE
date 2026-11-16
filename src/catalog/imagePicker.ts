import * as ImagePicker from 'expo-image-picker';
import { imageExtension } from './catalogStore';
import type { PickedImage } from './types';

/** Opens the system photo library for one image. Resolves null when the user cancels. */
export async function pickLibraryImage(): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: false,
    allowsMultipleSelection: false,
    base64: false,
    exif: false,
    // Re-encodes to keep card images small. On iOS, also converts HEIC to a compatible format.
    quality: 0.8,
    preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  return asset ? { uri: asset.uri, extension: imageExtension(asset.uri, asset.mimeType) } : null;
}
