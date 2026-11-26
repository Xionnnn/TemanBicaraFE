import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { Check, PaintBucket } from 'lucide-react-native';
import type { PickedImage } from '../../catalog/types';
import { Field } from '../AuthForm';
import { DialogButton } from '../AppDialog';
import { PecsPlaceholder } from '../pecs/PecsIcons';

const COLORS = [
  ['Abu-abu', '#D9D9D9'], ['Biru', '#E0F2FE'], ['Kuning', '#FEF3C7'],
  ['Merah muda', '#FCE7F3'], ['Hijau', '#DCFCE7'], ['Ungu', '#F3E8FF'],
];

export function useImageDraft(pickImage: () => Promise<PickedImage | null>) {
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(false);
  const working = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  async function choose() {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError('');
    try {
      const image = await pickImage();
      if (mounted.current && image) setPicked(image);
    } catch {
      if (mounted.current) setError('Galeri belum dapat dibuka. Coba lagi.');
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return { picked, busy, error, choose,
    reset: () => { setPicked(null); setError(''); },
    imageFailed: () => { setPicked(null); setError('Gambar belum dapat ditampilkan. Pilih gambar lagi.'); } };
}

export function CatalogImageField({ source, busy, onPress, onError }:
  { source?: ImageSourcePropType; busy: boolean; onPress: () => void; onError: () => void }) {
  return (
    <DialogButton label="Ganti gambar dari galeri" onPress={onPress} disabled={busy} state={{ busy }} style={editorStyles.imageBox}>
      {busy ? <ActivityIndicator color="#374151" accessibilityLabel="Membuka galeri" />
        : <CatalogDraftImage source={source} onError={onError} />}
      <Text style={editorStyles.note}>{busy ? 'Membuka galeri…' : 'Ketuk untuk ganti gambar'}</Text>
    </DialogButton>
  );
}

export function CatalogDraftImage({ source, onError }: { source?: ImageSourcePropType; onError: () => void }) {
  const [failedSource, setFailedSource] = useState('');
  const sourceKey = JSON.stringify(source);
  return source && sourceKey !== failedSource
    ? <Image source={source} resizeMode="contain" resizeMethod="resize" accessible={false}
        style={editorStyles.image} onError={() => { setFailedSource(sourceKey); onError(); }} />
    : <PecsPlaceholder size={80} lineColor="#374151" backgroundColor="#D9D9D9" />;
}

export function CatalogColorField({ value, onChange, disabled }:
  { value: string; onChange: (value: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const normalized = value.trim().toUpperCase();
  return (
    <>
      <View style={editorStyles.colorRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Warna Kamus" value={value} onChangeText={onChange} maxLength={7}
            autoCapitalize="characters" autoComplete="off" editable={!disabled} />
        </View>
        <DialogButton label="Pilih warna kamus" onPress={() => setOpen(!open)} disabled={disabled}
          state={{ expanded: open }} style={editorStyles.paletteToggle}>
          <PaintBucket size={30} color="#111827" accessible={false} />
          <View style={[editorStyles.swatch, { backgroundColor: /^#[0-9A-F]{6}$/.test(normalized) ? normalized : '#FFFFFF' }]} />
        </DialogButton>
      </View>
      {open && <View accessibilityRole="radiogroup" accessibilityLabel="Pilihan warna kamus" style={editorStyles.palette}>
        {COLORS.map(([name, color]) => (
          <DialogButton key={color} label={`Warna ${name}`} role="radio" state={{ checked: normalized === color }}
            disabled={disabled} onPress={() => { onChange(color); setOpen(false); }}
            style={[editorStyles.colorOption, { backgroundColor: color }]}>
            {normalized === color && <Check size={18} color="#111827" accessible={false} />}
            <Text style={editorStyles.optionText}>{name}</Text>
          </DialogButton>
        ))}
      </View>}
    </>
  );
}

export const editorStyles = StyleSheet.create({
  imageBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#6B7280', backgroundColor: '#F9FAFB',
    minHeight: 148, padding: 12, gap: 8 },
  image: { width: 96, height: 96 },
  note: { color: '#4B5563', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  colorRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  paletteToggle: { width: 48, minHeight: 50, gap: 2 },
  swatch: { width: 30, height: 8, borderWidth: 1, borderColor: '#374151' },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorOption: { width: '48%', flexDirection: 'row', gap: 6, padding: 8, borderColor: '#6B7280' },
  optionText: { flexShrink: 1, fontSize: 14, color: '#111827', textAlign: 'center' },
  darkButton: { padding: 12, minHeight: 52, backgroundColor: '#525252' },
  whiteText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  lightButton: { padding: 12, minHeight: 50, backgroundColor: '#EEEEEE', borderColor: '#525252' },
  darkText: { color: '#111827', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  preview: { alignItems: 'center', gap: 12, padding: 16, borderWidth: 1, borderColor: '#6B7280', borderRadius: 8 },
});
