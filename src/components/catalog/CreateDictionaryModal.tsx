import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView,
  StyleSheet, Text, View, type AccessibilityState, type StyleProp, type ViewStyle } from 'react-native';
import { Check, PaintBucket, X } from 'lucide-react-native';
import type { PickedImage } from '../../catalog/types';
import { Field, Message, styles as formStyles } from '../AuthForm';
import { PecsPlaceholder } from '../pecs/PecsIcons';

const COLORS = [
  { name: 'Abu-abu', value: '#D9D9D9' },
  { name: 'Biru', value: '#E0F2FE' },
  { name: 'Kuning', value: '#FEF3C7' },
  { name: 'Merah muda', value: '#FCE7F3' },
  { name: 'Hijau', value: '#DCFCE7' },
  { name: 'Ungu', value: '#F3E8FF' },
];

function DictionaryButton({ label, onPress, children, style, disabled = false, state, role = 'button' }:
  PropsWithChildren<{ label: string; onPress: () => void; style?: StyleProp<ViewStyle>;
    disabled?: boolean; state?: AccessibilityState; role?: 'button' | 'radio' }>) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable accessibilityRole={role} accessibilityLabel={label}
      accessibilityState={{ ...state, disabled }} disabled={disabled} onPress={onPress}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={({ pressed }) => [styles.button, style, focused && styles.focused,
        disabled && styles.disabled, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

export function CreateDictionaryModal({ pickImage, onClose }:
  { pickImage: () => Promise<PickedImage | null>; onClose: () => void }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [color, setColor] = useState('#D9D9D9');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(false);
  const working = useRef(false);
  const normalizedColor = color.trim().toUpperCase();
  const validColor = /^#[0-9A-F]{6}$/.test(normalizedColor);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function chooseImage() {
    if (working.current) return;
    working.current = true;
    setPicking(true);
    setError('');
    try {
      const picked = await pickImage();
      if (mounted.current && picked) setImage(picked);
    } catch {
      if (mounted.current) setError('Galeri belum dapat dibuka. Coba lagi.');
    } finally {
      working.current = false;
      if (mounted.current) setPicking(false);
    }
  }

  function showPreview(submittedColor = color) {
    if (working.current) return;
    if (!name.trim()) { setError('Isi nama kamus terlebih dahulu.'); return; }
    if (!image) { setError('Pilih gambar untuk kamus terlebih dahulu.'); return; }
    if (!/^#[0-9A-F]{6}$/i.test(submittedColor.trim())) {
      setError('Gunakan warna dengan format #RRGGBB, misalnya #D9D9D9.'); return;
    }
    setColor(submittedColor.trim().toUpperCase());
    setError('');
    setPaletteOpen(false);
    setPreview(true);
  }

  function imageFailed() {
    setImage(null);
    setPreview(false);
    setError('Gambar belum dapat ditampilkan. Pilih gambar lagi.');
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
          <View style={styles.modal} accessibilityViewIsModal>
            {preview ? (
              <>
                <Text accessibilityRole="header" style={styles.title}>Pratinjau Kamus Baru</Text>
                <View style={styles.previewTile} accessible
                  accessibilityLabel={`Pratinjau kamus ${name.trim()}, warna ${normalizedColor}`}>
                  <View style={[styles.previewImage, { backgroundColor: normalizedColor }]}>
                    {image && <Image source={{ uri: image.uri }} resizeMode="contain" resizeMethod="resize"
                      accessible={false} style={styles.picture} onError={imageFailed} />}
                  </View>
                  <Text style={styles.previewName}>{name.trim()}</Text>
                  <Text style={styles.colorValue}>{normalizedColor}</Text>
                </View>
                <Text style={styles.note}>Ini hanya pratinjau. Kamus belum disimpan ke katalog.</Text>
                <DictionaryButton label="Ubah pratinjau" onPress={() => setPreview(false)} style={styles.secondary}>
                  <Text style={styles.buttonText}>Ubah Pratinjau</Text>
                </DictionaryButton>
                <DictionaryButton label="Kembali ke Katalog" onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>Kembali ke Katalog</Text>
                </DictionaryButton>
              </>
            ) : (
              <>
                <View style={styles.heading}>
                  <Text accessibilityRole="header" style={styles.title}>Membuat Kamus Baru</Text>
                  <Text style={styles.subtitle}>Membuat kumpulan kata baru</Text>
                </View>

                <DictionaryButton label={image ? 'Ganti gambar kamus dari galeri' : 'Pilih gambar kamus dari galeri'}
                  onPress={() => { void chooseImage(); }} disabled={picking} state={{ busy: picking }}
                  style={styles.imageBox}>
                  {picking ? <ActivityIndicator accessibilityLabel="Membuka galeri" color="#374151" />
                    : image ? <Image source={{ uri: image.uri }} resizeMode="contain" resizeMethod="resize"
                      accessible={false} style={styles.picture} onError={imageFailed} />
                      : <PecsPlaceholder size={80} lineColor="#374151" backgroundColor="#D9D9D9" />}
                  <Text style={styles.imageHint}>
                    {picking ? 'Membuka galeri…' : image ? 'Ketuk untuk ganti gambar' : 'Ketuk untuk pilih gambar'}
                  </Text>
                </DictionaryButton>

                <Field label="Nama Kamus" value={name} editable={!picking}
                  onChangeText={(value) => { setName(value); setError(''); }} returnKeyType="next" />

                <View style={styles.colorRow}>
                  <View style={styles.colorField}>
                    <Field label="Warna Kamus" value={color} editable={!picking} maxLength={7}
                      onChangeText={(value) => { setColor(value); setError(''); }} autoCapitalize="characters"
                      autoComplete="off" returnKeyType="done"
                      onSubmitEditing={(event) => showPreview(event.nativeEvent.text)} />
                  </View>
                  <DictionaryButton label="Pilih warna kamus" disabled={picking}
                    state={{ expanded: paletteOpen }} onPress={() => setPaletteOpen((open) => !open)}
                    style={styles.paletteToggle}>
                    <PaintBucket size={30} color="#17202E" accessible={false} />
                    <View style={[styles.colorIndicator, { backgroundColor: validColor ? normalizedColor : '#FFFFFF' }]} />
                  </DictionaryButton>
                </View>

                {paletteOpen && (
                  <View accessibilityRole="radiogroup" accessibilityLabel="Pilihan warna kamus" style={styles.palette}>
                    {COLORS.map((option) => {
                      const selected = normalizedColor === option.value;
                      return (
                        <DictionaryButton key={option.value} role="radio" label={`Warna ${option.name}`}
                          state={{ checked: selected }} disabled={picking}
                          onPress={() => { setColor(option.value); setPaletteOpen(false); setError(''); }}
                          style={[styles.colorOption, { backgroundColor: option.value }, selected && styles.selectedColor]}>
                          {selected ? <Check size={18} color="#17202E" accessible={false} /> : <View style={styles.checkSpace} />}
                          <Text style={styles.optionName}>{option.name}</Text>
                        </DictionaryButton>
                      );
                    })}
                  </View>
                )}

                <Message>{error}</Message>
                <Text style={styles.note}>Pratinjau saja. Kamus belum disimpan.</Text>
                <View style={formStyles.recoveryActions}>
                  <DictionaryButton label="Batal membuat kamus" onPress={onClose} style={[styles.action, styles.secondary]}>
                    <X size={30} color="#17202E" strokeWidth={3} accessible={false} />
                  </DictionaryButton>
                  <DictionaryButton label="Lihat pratinjau kamus" onPress={() => showPreview()} disabled={picking}
                    style={[styles.action, styles.confirm]}>
                    <Check size={30} color="#17202E" strokeWidth={3} accessible={false} />
                  </DictionaryButton>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  modal: { width: '100%', maxWidth: 480, alignSelf: 'center', padding: 20,
    borderRadius: 16, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF', gap: 16 },
  heading: { gap: 4 },
  title: { color: '#17202E', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#4B5563', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  button: { minWidth: 44, minHeight: 44, borderWidth: 2, borderColor: 'transparent', borderRadius: 7,
    alignItems: 'center', justifyContent: 'center' },
  focused: { borderColor: '#17202E' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.7 },
  imageBox: { minHeight: 148, padding: 12, gap: 8, borderColor: '#6B7280', borderStyle: 'dashed', backgroundColor: '#F9FAFB' },
  picture: { width: 96, height: 96 },
  imageHint: { color: '#4B5563', fontSize: 13, textAlign: 'center' },
  colorRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  colorField: { flex: 1, minWidth: 0 },
  paletteToggle: { width: 48, minHeight: 50, gap: 2 },
  colorIndicator: { width: 30, height: 8, borderWidth: 1, borderColor: '#374151' },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorOption: { width: '48%', minHeight: 48, padding: 8, flexDirection: 'row', gap: 6, borderColor: '#6B7280' },
  selectedColor: { borderColor: '#17202E' },
  checkSpace: { width: 18, height: 18 },
  optionName: { color: '#17202E', fontSize: 14, flex: 1 },
  note: { color: '#4B5563', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  action: { flex: 1, minHeight: 60 },
  secondary: { minHeight: 50, borderColor: '#525252', backgroundColor: '#F3F4F6', padding: 10 },
  confirm: { borderColor: '#525252', backgroundColor: '#BDBDBD' },
  buttonText: { color: '#17202E', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  closeButton: { minHeight: 50, backgroundColor: '#525252', padding: 10 },
  closeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  previewTile: { alignItems: 'center', gap: 8 },
  previewImage: { minWidth: 120, minHeight: 120, padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  previewName: { alignSelf: 'stretch', color: '#17202E', fontSize: 20, fontWeight: '600', textAlign: 'center' },
  colorValue: { color: '#4B5563', fontSize: 14 },
});
