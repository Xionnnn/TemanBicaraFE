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

## Unresolved decisions

Discuss these before treating an interpretation as settled:

- The exact role of `asset_name` as the editable display label.
- Reset semantics for custom assets.
- Image retention in history after editing or deleting a custom image.
- How builtin categories coexist with user-created dictionaries.

## Schema transition

The implemented version 1 still uses `assets.label`, `asset_settings`, and
membership `position`; it lacks `default_name` and `dictionary_color`. These
requirements do not constitute a migration. Follow the latest approved Hot ERD
and resolve conversion semantics before implementing a data-preserving upgrade.
