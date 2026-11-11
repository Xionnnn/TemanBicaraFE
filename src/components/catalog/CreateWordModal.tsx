import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { AccountChangedError } from '../../auth/session';
import { CatalogError, findWordInDictionary, findWordSuggestions, wordKey } from '../../catalog/catalogStore';
import type { Catalog, CatalogAsset, CatalogDictionary, PickedImage, WordRequest } from '../../catalog/types';
import { Action, Message, styles as formStyles } from '../AuthForm';
import { PecsPlaceholder } from '../pecs/PecsIcons';

export type SavedWord = { label: string; refreshed: boolean };

type Props = {
  catalog: Catalog;
  dictionary: CatalogDictionary;
  pickImage: () => Promise<PickedImage | null>;
  onSave: (request: WordRequest) => Promise<SavedWord>;
  onClose: () => void;
};

const SUGGESTION_LIMIT = 5;

function saveErrorMessage(failure: unknown, dictionaryName: string): string {
  if (failure instanceof AccountChangedError) return 'Akun sudah berganti. Kata tidak disimpan.';
  if (failure instanceof CatalogError) {
    if (failure.code === 'duplicate_word') return `Kata ini sudah ada di kamus ${dictionaryName}.`;
    if (failure.code === 'missing_image') return 'Pilih gambar dulu.';
    if (failure.code === 'missing_label') return 'Tulis kata dulu.';
    if (failure.code === 'missing_asset') return 'Kata tersimpan itu tidak ditemukan. Pilih kata lain.';
    if (failure.code === 'missing_dictionary') return 'Kamus ini tidak ditemukan. Buka ulang halaman ini.';
  }
  return 'Kata belum dapat disimpan. Coba lagi.';
}

export function CreateWordModal({ catalog, dictionary, pickImage, onSave, onClose }: Props) {
  // One ID per form, kept across retries so a retry cannot create a second asset.
  const [assetId] = useState(() => randomUUID());
  const [image, setImage] = useState<PickedImage | null>(null);
  const [label, setLabel] = useState('');
  const [reused, setReused] = useState<CatalogAsset | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [busy, setBusy] = useState<'idle' | 'picking' | 'saving'>('idle');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<SavedWord | null>(null);
  const [focused, setFocused] = useState(false);
  const working = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const cards = catalog.assetsByDictionary[dictionary.id] ?? [];
  const trimmed = label.trim();
  const duplicate = findWordInDictionary(cards, trimmed);
  const suggestions = reused || (!listOpen && !trimmed) ? []
    : findWordSuggestions(catalog.assets, cards, trimmed).slice(0, SUGGESTION_LIMIT);
  const exactSaved = suggestions.find((asset) => wordKey(asset.name) === wordKey(trimmed));
  const previewUri = reused ? reused.imageUri : image?.uri;
  const hasImage = reused !== null || image !== null;
  const canSave = busy === 'idle' && trimmed !== '' && !duplicate && hasImage;
  const missing = !hasImage && !trimmed ? 'Pilih gambar dan tulis kata untuk menyimpan.'
    : !hasImage ? 'Pilih gambar untuk menyimpan.'
      : !trimmed ? 'Tulis kata untuk menyimpan.' : '';

  async function chooseImage() {
    if (working.current) return;
    working.current = true;
    setBusy('picking');
    setError('');
    try {
      const picked = await pickImage();
      // Cancelling the picker is a normal choice: keep the form as it was.
      if (mounted.current && picked) {
        setImage(picked);
        setReused(null);
      }
    } catch {
      if (mounted.current) setError('Galeri belum dapat dibuka. Coba lagi.');
    } finally {
      working.current = false;
      if (mounted.current) setBusy('idle');
    }
  }

  function chooseSavedWord(asset: CatalogAsset) {
    setReused(asset);
    setLabel(asset.name);
    setImage(null);
    setListOpen(false);
    setError('');
  }

  function changeLabel(text: string) {
    setLabel(text);
    setReused(null);
    setError('');
  }

  async function save() {
    if (working.current || !canSave) return;
    working.current = true;
    setBusy('saving');
    setError('');
    const request: WordRequest = reused
      ? { kind: 'existing', assetId: reused.id, dictionaryId: dictionary.id }
      : { kind: 'new', assetId, dictionaryId: dictionary.id, label, image };
    try {
      const result = await onSave(request);
      if (mounted.current) setSaved(result);
    } catch (failure) {
      // The form keeps its image and text so the user can try again.
      if (mounted.current) setError(saveErrorMessage(failure, dictionary.name));
    } finally {
      working.current = false;
      if (mounted.current) setBusy('idle');
    }
  }

  function cancel() {
    if (!working.current) onClose();
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={saved ? onClose : cancel}>
      <KeyboardAvoidingView style={formStyles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={formStyles.recoveryModalScroll}>
          <View style={[formStyles.modal, formStyles.otpModal]} accessibilityViewIsModal>
            {saved ? (
              <>
                <Text accessibilityRole="header" style={formStyles.success}>Kata tersimpan</Text>
                <Text accessibilityLiveRegion="polite" style={formStyles.body}>
                  {`"${saved.label}" ada di urutan pertama kamus ${dictionary.name}.`}
                  {saved.refreshed ? '' : ' Buka ulang halaman ini untuk melihatnya.'}
                </Text>
                <Action title="OK" onPress={onClose} />
              </>
            ) : (
              <>
                <View style={styles.heading}>
                  <Text accessibilityRole="header" style={formStyles.success}>Membuat Kata Baru</Text>
                  <Text style={formStyles.body}>{`Kata baru masuk ke kamus ${dictionary.name}.`}</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={hasImage ? 'Ganti gambar dari galeri' : 'Pilih gambar dari galeri'}
                  accessibilityState={{ disabled: busy !== 'idle', busy: busy === 'picking' }}
                  disabled={busy !== 'idle'}
                  onPress={() => { void chooseImage(); }}
                  style={({ pressed }) => [styles.imageBox, pressed && formStyles.pressed]}
                >
                  {previewUri ? (
                    <Image source={{ uri: previewUri }} resizeMode="contain" resizeMethod="resize"
                      accessible={false} style={styles.preview} />
                  ) : (
                    <PecsPlaceholder size={76} lineColor="#4B5563" backgroundColor="#E5E7EB" />
                  )}
                  <Text style={styles.imageHint}>
                    {busy === 'picking' ? 'Membuka galeri…'
                      : reused ? 'Gambar kata tersimpan. Ketuk untuk ganti.'
                        : image ? 'Ketuk untuk ganti gambar' : 'Ketuk untuk pilih gambar'}
                  </Text>
                </Pressable>

                <View style={formStyles.field}>
                  <Text style={formStyles.label}>Nama Gambar (Kata)</Text>
                  <View>
                    <TextInput
                      value={label}
                      onChangeText={changeLabel}
                      accessibilityLabel="Nama Gambar (Kata)"
                      editable={busy === 'idle'}
                      autoCorrect={false}
                      returnKeyType="done"
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      style={[formStyles.input, styles.labelInput, focused && formStyles.focused]}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={listOpen ? 'Tutup daftar kata tersimpan' : 'Buka daftar kata tersimpan'}
                      accessibilityState={{ expanded: listOpen, disabled: busy !== 'idle' }}
                      disabled={busy !== 'idle'}
                      onPress={() => setListOpen((open) => !open)}
                      style={({ pressed }) => [styles.listToggle, pressed && formStyles.pressed]}
                    >
                      {listOpen
                        ? <ChevronUp size={24} color="#17202E" accessible={false} />
                        : <ChevronDown size={24} color="#17202E" accessible={false} />}
                    </Pressable>
                  </View>
                </View>

                {duplicate ? (
                  <Text accessibilityLiveRegion="polite" style={styles.problem}>
                    {`Kata ini sudah ada di kamus ${dictionary.name}. Tulis kata lain.`}
                  </Text>
                ) : reused ? (
                  <Text style={styles.note}>Memakai kata dan gambar yang sudah tersimpan.</Text>
                ) : exactSaved ? (
                  <Text accessibilityLiveRegion="polite" style={styles.note}>
                    Kata ini sudah tersimpan. Pilih di daftar untuk memakai gambarnya, atau pakai gambar baru.
                  </Text>
                ) : null}

                {suggestions.length > 0 && (
                  <View style={styles.list}>
                    <Text style={styles.listTitle}>Kata tersimpan</Text>
                    {suggestions.map((asset) => (
                      <Pressable
                        key={asset.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Pakai kata ${asset.name}`}
                        disabled={busy !== 'idle'}
                        onPress={() => chooseSavedWord(asset)}
                        style={({ pressed }) => [styles.row, pressed && formStyles.pressed]}
                      >
                        {asset.imageUri ? (
                          <Image source={{ uri: asset.imageUri }} resizeMode="cover" resizeMethod="resize"
                            accessible={false} style={styles.thumb} />
                        ) : (
                          <PecsPlaceholder size={40} lineColor="#4B5563" backgroundColor="#E5E7EB" />
                        )}
                        <Text numberOfLines={1} style={styles.rowText}>{asset.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                {listOpen && !reused && suggestions.length === 0 && (
                  <Text style={styles.note}>Belum ada kata tersimpan yang bisa dipakai di kamus ini.</Text>
                )}

                {busy === 'idle' && !duplicate && missing !== '' && <Text style={styles.note}>{missing}</Text>}
                <Message>{error}</Message>

                <View style={formStyles.recoveryActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Batal membuat kata"
                    accessibilityState={{ disabled: busy === 'saving' }}
                    disabled={busy === 'saving'}
                    onPress={cancel}
                    style={({ pressed }) => [formStyles.recoveryIconButton, formStyles.recoveryCancel,
                      pressed && formStyles.pressed]}
                  >
                    <X size={28} color="#17202E" accessible={false} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Simpan kata"
                    accessibilityState={{ disabled: !canSave, busy: busy === 'saving' }}
                    disabled={!canSave}
                    onPress={() => { void save(); }}
                    style={({ pressed }) => [formStyles.recoveryIconButton, formStyles.recoveryConfirm,
                      !canSave && busy !== 'saving' && styles.saveDisabled, pressed && formStyles.pressed]}
                  >
                    {busy === 'saving'
                      ? <ActivityIndicator color="#FFFFFF" accessibilityLabel="Menyimpan kata" />
                      : <Check size={28} color="#FFFFFF" accessible={false} />}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 6,
  },
  imageBox: {
    minHeight: 168,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6B7280',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 12,
  },
  preview: {
    width: 120,
    height: 120,
  },
  imageHint: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  labelInput: {
    paddingRight: 60,
  },
  listToggle: {
    position: 'absolute',
    right: 4,
    top: 3,
    bottom: 3,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    borderWidth: 1,
    borderColor: '#6B7280',
    borderRadius: 8,
    overflow: 'hidden',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  rowText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#17202E',
  },
  note: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  problem: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    color: '#9B1C1C',
  },
  saveDisabled: {
    opacity: 0.45,
  },
});
