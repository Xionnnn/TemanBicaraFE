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
- Typing a word that is already saved offers the saved asset. Choosing it links
  that asset into the dictionary instead of creating a second one.
- Interim starter dictionaries: the five PECS mock categories are saved as real
  dictionaries in each account database on the first catalog load, while that
  account has no dictionaries. A future deletion feature must stop them from
  being added again after every dictionary is deleted. Their mock picture cards
  remain display-only dummy data.

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
