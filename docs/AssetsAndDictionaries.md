# Assets and Dictionaries

These confirmed requirements and open decisions supplement [AGENTS.md](../AGENTS.md).
They describe intended behavior; see [implementation status](ImplementationStatus.md)
and inspect current code before assuming they are implemented.

## Images and labels

- Builtin images are bundled for offline use and shared as application resources.
- Copy custom images into the active account's persistent image directory. Keep
  relative references; never leave the only copy in an evictable cache.
- Synchronization covers asset metadata, not custom image bytes. A student's
  personalization must not overwrite shared builtin metadata on the server.
- `default_name` preserves a builtin asset's original name for reset. Label
  customization remains required.
- Per-asset font-size and letter-spacing overrides are no longer required;
  `asset_settings` is excluded from the target schema.
- Event payload labels are historical snapshots. Do not rename or replace them
  with `default_name` merely because the asset entity uses that column.

Read [storage rules](sqlite.md) before changing image persistence and
[synchronization rules](SyncronizationRules.md) before changing metadata uploads.

## Dictionaries and ordering

- Dictionaries are user-created tabs containing selected cards. Each has a
  required `dictionary_color`; color must not be the only tab identifier.
- `dictionaries.display_order` controls tab order.
- `assets_dictionaries.display_order` controls card order within a dictionary.
- Dictionaries and memberships remain local and are not cloud-backed.
- A dictionary may be empty. An asset may belong to multiple dictionaries or none.
- Removing a membership is distinct from deleting an asset.
- Saved multi-card sentence templates remain excluded from scope.

## Decisions confirmed November 11, 2026

These came with custom word creation on the Pengaturan Katalog page:

- A custom asset stores its trimmed label in `asset_name` (the card label) and
  empty text in `default_name`, meaning it has no original builtin name.
- A new word goes into the selected dictionary at `display_order` 0; the other
  cards in that dictionary move down one place in the same transaction.
- A word may appear only once per dictionary (trimmed, letter case ignored,
  dummy cards shown there included). The same word may exist in other dictionaries.
- Interim starter dictionaries: the five PECS mock categories are saved as real
  dictionaries in each account database on the first catalog load, while that
  account has no dictionaries. A future deletion feature must stop them from
  being added again after every dictionary is deleted. Their mock picture cards
  remain display-only dummy data.

## Decisions revised November 16, 2026

These follow the activity diagram "Menambahkan gambar dengan makna baru". A short-lived
revision earlier that day, in which choosing a saved word always created a copied asset,
is withdrawn; there is no "create copy" action.

- The word list offers every saved asset whose word is not yet in the current
  dictionary. Assets with the same name are listed separately, each with its picture
  and the dictionaries that hold it. None is hidden or chosen for being newest.
- Choosing an option fills the name, shows its picture and keeps that asset's ID.
  The image selector is locked while it stays selected; the name stays editable, and
  choosing another option replaces the selection. Nothing is saved before confirming.
- Confirming an unchanged selection adds only a membership for that asset's existing
  ID. No asset row or image file is created.
- The first user edit to the name, including clearing it, drops the selection and its
  picture from the form and unlocks the image selector, keeping the edited text. Typing
  the original name again does not restore the selection. This clears form state only;
  the saved asset, its file and its memberships are untouched. A manually picked image
  is kept when the name is edited.
- Without a selection, saving creates a new custom asset with a new UUID and its own
  copy of the picked image, as described above.
- The same duplicate rule applies to both paths and is checked again inside the save
  transaction. Both insert at `display_order` 0 and shift only that dictionary's cards.

## Unresolved decisions

Discuss these before treating an interpretation as settled:

- The editable role of `asset_name` for builtin assets.
- Reset semantics for custom assets.
- Image retention in history after editing or deleting a custom image.
- How builtin categories coexist with user-created dictionaries beyond the
  interim starter dictionaries.

## Schema transition

Fresh databases follow the latest Hot ERD: `default_name` and
`dictionary_color` are required, membership ordering uses `display_order`, and
`assets.label` and `asset_settings` are absent. This schema-definition update keeps
version 1 and includes no migration. Existing databases retain their earlier schema;
legacy label mapping and dictionary colors need resolution before a later upgrade.
