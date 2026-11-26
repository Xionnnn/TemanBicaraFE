# TemanBicara Page Checklist

Last inspected: November 26, 2026.

This checklist records the UI found in the current source code. It is a dated
snapshot, not a claim that every feature is connected to real data or ready for release.

## Scope and status

- The current target is Android, with phone portrait and tablet landscape layouts.
- The current phase focuses on UI. New backend/database integration and route-access
  work are deferred. Existing authentication and catalog storage are recorded as they exist.
- `[x]` means the page or dialog UI exists in its current flow. Read its implementation note.
- `[ ]` means the intended page or dialog UI has not been built. An unavailable-feature
  notice does not count as that page.
- In the Android verification section, checkboxes record checks performed rather than page implementation.
- `UI preview` means example data or temporary component state is used.
- Phone and Tablet exports are responsive variants of the same UI, not separate pages.

## Route pages already created

All 11 route pages have UI. The three former placeholder routes now render previews.
The root layout is navigation infrastructure and is not counted as a page.

- [x] [Masuk](src/app/index.tsx) (`/`): username/password form, validation, and existing login API flow.
- [x] [Daftar](src/app/register.tsx) (`/register`): Guru/Siswa selection, registration fields, validation, and existing registration API flow.
- [x] [Verifikasi Email](src/app/verify-email.tsx) (`/verify-email`): verification code, resend countdown, and existing verification API flow.
- [x] [Lupa Password](src/app/forgot-password.tsx) (`/forgot-password`): email form and OTP dialog for the existing recovery flow.
- [x] [Ganti Password](src/app/reset-password.tsx) (`/reset-password`): password/confirmation form and existing reset API flow.
- [x] [Beranda Guru dan Siswa](src/app/home.tsx) (`/home`): both role-specific menus exist under one route; rendered by [HomeView](src/components/home/HomeView.tsx).
- [x] [Katalog Gambar / PECS](src/app/pecs.tsx) (`/pecs`): UI preview with category browsing, sentence composition, individual removal, and clear. Cards are mock data; the speaker action displays text instead of playing audio.
- [x] [Pengaturan Katalog](src/app/catalog-settings.tsx) (`/catalog-settings`): dictionary/card browsing and adding a word use existing account-scoped SQLite/image storage. Dictionary creation/editing, ordering, custom image editing/deletion, and builtin image reset have explicitly unsaved UI previews.
- [x] [Kelas dan Siswa, Guru](src/app/teacher-classes.tsx) (`/teacher-classes`): UI preview with a class table, class creation/deletion, student lists/removal, example class codes, class charts, and per-student word-frequency tables. Counts follow temporary student-list changes.
- [x] [Riwayat Penggunaan, Siswa](src/app/usage-history.tsx) (`/usage-history`): UI preview with example sentences, placeholder timestamps, wrapping picture cards, and an empty-list view. It does not read actual activity records.
- [x] [Pengaturan Kelas, Siswa](src/app/class-settings.tsx) (`/class-settings`): UI preview with a class table, join-code form, removal confirmation, and empty-list view. `CONTOH` adds `Kelas2` temporarily.

The authentication entries confirm existing UI and API wiring. They do not certify
live email delivery or end-to-end backend operation.

## Supporting forms and dialogs already created

These are part of existing pages, not additional route pages.

- [x] [Pendaftaran Berhasil](src/app/verify-email.tsx): confirmation after successful email verification.
- [x] [Masukkan OTP Email](src/app/forgot-password.tsx): recovery code, resend countdown, cancel, and confirm.
- [x] [Password Berhasil Diganti](src/app/reset-password.tsx): confirmation and return to login.
- [x] [Membuat Kata Baru](src/components/catalog/CreateWordModal.tsx): gallery image, word label, saved-word selection, validation, cancel, and local save.
- [x] [Kata Tersimpan](src/components/catalog/CreateWordModal.tsx): confirmation within the word-creation modal.
- [x] [Membuat Kamus Baru](src/components/catalog/CreateDictionaryModal.tsx): gallery image, name, hex color, named color choices, validation, and cancel. The Buat Kamus action opens this dialog.
- [x] [Pratinjau Kamus Baru](src/components/catalog/CreateDictionaryModal.tsx): image/name/color preview with edit and close actions. It does not save a dictionary or image to account storage.
- [x] [Tambah Kelas, Guru](src/components/classes/TeacherClassesScreen.tsx): class-name form with temporary preview data.
- [x] [Hapus Kelas, Guru](src/components/classes/TeacherClassesScreen.tsx): cancel/confirm removal from the preview list.
- [x] [Tambah Kelas / Masuk ke Kelas, Siswa](src/components/classes/StudentClassSettingsScreen.tsx): class-code form with empty, incorrect-demo-code, and duplicate feedback.
- [x] [Keluar dari Kelas, Siswa](src/components/classes/StudentClassSettingsScreen.tsx): cancel/confirm removal from the preview list.

## Figma designs completed November 26

All seven previously missing screens/dialog variants now have UI in their existing
flows. No supplied page design remains without an implementation. This records UI
coverage only; persistence, real activity data, and backend classroom operations are
separate work.

- [x] [Modifikasi Kamus](src/components/catalog/EditDictionaryModal.tsx) (`[Siswa] Modifikasi Kamus.png`): image, name, color, order, and deletion preview. Opens from the dictionary pencil button; closing discards the draft.
- [x] [Konfirmasi Perubahan Urutan Kamus](src/components/catalog/EditDictionaryModal.tsx) (`Confirmation (Modifikasi Kamus).png` and its `- Tab` variant): proposed-order list with cancel/confirm before the unsaved preview. Cancel preserves the form draft.
- [x] [Modifikasi Gambar Kustom](src/components/catalog/EditAssetModal.tsx) (`[Siswa] Modifikasi Gambar.png`): gallery image, editable label, required-name feedback, and deletion confirmation/preview. Original assets and memberships remain unchanged.
- [x] [Modifikasi Gambar Bawaan](src/components/catalog/EditAssetModal.tsx) (`[Siswa] (is default image) Modifikasi Gambar.png`): editing and Reset Gambar confirmation/preview. Reset shows the original name/image in the draft; final persistence/history semantics remain unresolved in the asset requirements.
- [x] [Daftar Siswa dalam Kelas](src/components/classes/TeacherStudentsView.tsx) (`[Guru] (eye) Siswa - Kelas dan Siswa.png`): example student list, add-code action, removal confirmation, empty state, and return navigation.
- [x] [Kode Kelas untuk Menambah Siswa](src/components/classes/ClassCodeDialog.tsx) (`[Guru] (tambah siswa) Siswa - Kelas dan Siswa.png`): explicitly example `CONTOH` code, five-minute countdown, expiry, renewal, and close. Does not accept joins from other devices.
- [x] [Riwayat Kelas dan Siswa](src/components/classes/TeacherHistoryView.tsx) (`[Guru] (paper) Kelas - Kelas dan Siswa.png`): labeled example class charts and per-student frequency tables. Charts use horizontal bars so student names, words, and values fit phone widths; they sit side by side when landscape width permits.

## Figma naming differences

- `[Guru] Menu Details` and `[Siswa] Menu Details` map to the two views of `/home`.
- `[Siswa] Menu Kustomisasi` maps to `/catalog-settings`, titled Pengaturan Katalog.
- `[Siswa] Modifikasi Gambar-1.png` contains the Membuat Kata Baru design, which is
  already implemented. It is different from the pending image-editing dialogs.
- `[Siswa] Masuk ke Kelas.png` is implemented as the Tambah Kelas modal in `/class-settings`.

## Android UI verification

These checks record verification documented in
[ImplementationStatus.md](docs/ImplementationStatus.md). Missing verification does
not mean the UI is absent.

- [x] Phone portrait emulator checks for Kelas dan Siswa, Riwayat Penggunaan, and Pengaturan Kelas Siswa.
- [x] Tablet landscape emulator checks for Pengaturan Kelas Siswa and its join-code dialog.
- [x] System text at 200% checked for Pengaturan Kelas Siswa in tablet landscape.
- [x] Membuat Kamus Baru checked in Android Expo Go using the actual form in an isolated UI preview: real gallery selection/cancel, validation, named/custom colors, preview/edit, close/Back, and reset on reopening. Phone portrait, tablet landscape, and 200% system text in landscape were checked. The signed-in catalog flow was inspected in source, not exercised end to end.
- [x] All seven November 26 additions checked in an isolated Android Expo Go preview: phone portrait, tablet landscape (1728x1080), and 200% system text in landscape. Validation, confirmation/cancel, original-data preservation, student-count updates, history/empty views, code expiry/renewal, and return navigation were checked. See [the verification report](docs/UICompletionVerification.md) for scope and evidence.
- [ ] Tablet landscape verification for the remaining pages, including Beranda, PECS, Pengaturan Katalog, Riwayat Penggunaan, Kelas dan Siswa Guru, and authentication forms.
- [ ] Physical Android-device verification of the page previews and new catalog dialogs.
- [ ] Hardware-keyboard Escape closure: Expo Go hides the native dialog without clearing editor state. Android Back and visible close/cancel controls pass. A standalone APK check is blocked by the incomplete local NDK installation; see the verification report.

Expo orientation is `default`, allowing rotation. Previously generated Android
projects need configuration regeneration and a rebuild to apply this native setting.
iOS is outside the current development scope.

## Maintenance notes

Update this file when a page or dialog is added, connected to real data, or verified
on a new Android layout. Reinspect its source before changing the status.

The unused [MenuModal](src/components/pecs/MenuModal.tsx) and
[PlaceholderPage](src/components/home/PlaceholderPage.tsx) components are not counted
as additional pages. No current route renders `PlaceholderPage`.
