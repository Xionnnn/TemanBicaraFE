// State rules of the create-word form. Only type imports, so the Node tests can load it.
import type { CatalogAsset, PickedImage, WordRequest } from './types';

export type WordForm = {
  label: string;
  // Picture picked from the photo library; only used when no saved asset is selected.
  image: PickedImage | null;
  // Saved asset chosen from the word list. Its own ID is saved; its picture is locked.
  selected: CatalogAsset | null;
};

export type WordFormAction =
  | { type: 'select'; asset: CatalogAsset }
  | { type: 'editLabel'; label: string }
  | { type: 'pickImage'; image: PickedImage };

export const EMPTY_WORD_FORM: WordForm = { label: '', image: null, selected: null };

export function wordFormReducer(form: WordForm, action: WordFormAction): WordForm {
  switch (action.type) {
    case 'select':
      return { label: action.asset.name, image: null, selected: action.asset };
    case 'editLabel':
      // The first typed change leaves the saved asset and drops its picture from the form only.
      // Typing its name again does not select it again.
      return form.selected
        ? { label: action.label, image: null, selected: null }
        : { ...form, label: action.label };
    case 'pickImage':
      return form.selected ? form : { ...form, image: action.image };
  }
}

export function isImageLocked(form: WordForm): boolean {
  return form.selected !== null;
}

export function previewUri(form: WordForm): string | undefined {
  return form.selected ? form.selected.imageUri : form.image?.uri;
}

export function hasPicture(form: WordForm): boolean {
  return form.selected !== null || form.image !== null;
}

/** `newAssetId` is kept for the whole form, so a retry cannot create a second asset. */
export function wordRequest(form: WordForm, newAssetId: string, dictionaryId: string): WordRequest {
  return form.selected
    ? { kind: 'existing', assetId: form.selected.id, dictionaryId }
    : { kind: 'new', assetId: newAssetId, dictionaryId, label: form.label, image: form.image };
}
