// Mirrors the Hot DB `dictionaries` and `assets` columns the catalog screens read.
export type CatalogDictionary = {
  id: string;
  name: string;
  color: string;
  displayOrder: number;
};

export type CatalogAsset = {
  id: string;
  // assets.asset_name: the label shown on the card.
  name: string;
  // assets.default_name: a builtin asset's original name; empty for custom assets.
  defaultName: string;
  sourceType: 'builtin' | 'custom';
  // builtin: file name inside the bundled image directory.
  // custom: path relative to the account's profile directory (custom-images/<file>).
  path: string;
  // Resolved file URI of a custom image that exists on this device.
  imageUri?: string;
  // Mock PECS card shown in a starter kamus; not stored in SQLite.
  dummy?: boolean;
};

export type Catalog = {
  dictionaries: CatalogDictionary[];
  // Cards per kamus: saved links by assets_dictionaries.display_order, then dummy cards.
  assetsByDictionary: Record<string, CatalogAsset[]>;
  // Every asset saved in this account's database, newest first.
  assets: CatalogAsset[];
};

export type PickedImage = {
  // Temporary picker file; it must be copied before it is stored.
  uri: string;
  // Lower-case file extension including the dot, e.g. ".jpg".
  extension: string;
};

export type WordRequest =
  | {
    kind: 'new';
    assetId: string;
    dictionaryId: string;
    label: string;
    image: PickedImage | null;
  }
  | {
    // Links an existing asset into the kamus instead of creating one.
    kind: 'existing';
    assetId: string;
    dictionaryId: string;
  };
