import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronDown, CircleAlert } from 'lucide-react-native';
import type { CatalogDictionary, PickedImage } from '../../catalog/types';
import { AppDialog, DialogActions, DialogButton } from '../AppDialog';
import { Field, Message } from '../AuthForm';
import { CatalogColorField, CatalogDraftImage, CatalogImageField, editorStyles, useImageDraft } from './CatalogEditorFields';

export function EditDictionaryModal({ dictionary, dictionaries, pickImage, onClose }:
  { dictionary: CatalogDictionary; dictionaries: CatalogDictionary[];
    pickImage: () => Promise<PickedImage | null>; onClose: () => void }) {
  const originalPosition = dictionaries.findIndex((item) => item.id === dictionary.id);
  const [name, setName] = useState(dictionary.name);
  const [color, setColor] = useState(dictionary.color);
  const [position, setPosition] = useState(originalPosition);
  const [orderOpen, setOrderOpen] = useState(false);
  const [stage, setStage] = useState<'edit' | 'order' | 'preview' | 'delete' | 'deleted'>('edit');
  const [error, setError] = useState('');
  const image = useImageDraft(pickImage);
  const normalizedColor = /^#[0-9A-F]{6}$/i.test(color.trim()) ? color.trim().toUpperCase() : '#D9D9D9';
  const source = image.picked ? { uri: image.picked.uri } : undefined;
  const proposed = dictionaries.filter((item) => item.id !== dictionary.id);
  proposed.splice(position, 0, { ...dictionary, name: name.trim(), color: normalizedColor });
  const backToEdit = () => setStage('edit');

  function preview() {
    if (image.busy) return;
    if (!name.trim()) { setError('Isi nama kamus terlebih dahulu.'); return; }
    if (!/^#[0-9A-F]{6}$/i.test(color.trim())) {
      setError('Gunakan warna dengan format #RRGGBB, misalnya #D9D9D9.'); return;
    }
    setError('');
    setOrderOpen(false);
    setStage(position === originalPosition ? 'preview' : 'order');
  }

  if (stage === 'order') return (
    <AppDialog title="Urutan Kamus Berubah!" description="Periksa urutan berikut sebelum melanjutkan pratinjau."
      onClose={backToEdit}>
      <CircleAlert size={40} color="#111827" style={{ alignSelf: 'center' }} accessible={false} />
      <View>
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.headerText, styles.rank]}>Urutan</Text>
          <Text style={[styles.headerText, styles.name]}>Nama Kamus</Text>
        </View>
        {proposed.map((item, index) => <View key={item.id} style={styles.row}>
          <Text style={[styles.cell, styles.rank]}>{index + 1}</Text>
          <Text style={[styles.cell, styles.name]}>{item.name}</Text>
        </View>)}
      </View>
      <Text style={editorStyles.note}>Urutan ini hanya pratinjau. Katalog asli belum berubah.</Text>
      <DialogActions onCancel={backToEdit} onConfirm={() => setStage('preview')} confirmLabel="Konfirmasi pratinjau urutan kamus" />
    </AppDialog>
  );

  if (stage === 'delete') return (
    <AppDialog title="Hapus Kamus?" description={`Lihat pratinjau penghapusan ${dictionary.name}?`}
      onClose={backToEdit}>
      <Text style={editorStyles.note}>Kamus dan gambar yang tersimpan tidak akan dihapus pada tahap UI ini.</Text>
      <DialogActions onCancel={backToEdit} onConfirm={() => setStage('deleted')} confirmLabel="Konfirmasi pratinjau hapus kamus" />
    </AppDialog>
  );

  if (stage === 'preview' || stage === 'deleted') return (
    <AppDialog title={stage === 'deleted' ? 'Pratinjau Hapus Kamus' : 'Pratinjau Perubahan Kamus'}
      description="Perubahan belum disimpan ke katalog." onClose={onClose}>
      {stage === 'preview' ? <>
        <View style={[editorStyles.preview, { backgroundColor: normalizedColor }]}>
          <CatalogDraftImage source={source} onError={image.imageFailed} />
        </View>
        <Text style={editorStyles.darkText}>{name.trim()}</Text>
        <Text style={editorStyles.note}>Warna {normalizedColor}, urutan {position + 1}</Text>
      </> : <Text style={editorStyles.note}>{dictionary.name} akan dihapus dari daftar kamus. Data asli tetap tersedia.</Text>}
      <Message>{image.error}</Message>
      <DialogButton label="Ubah pratinjau kamus" onPress={backToEdit} style={editorStyles.lightButton}>
        <Text style={editorStyles.darkText}>Ubah Pratinjau</Text>
      </DialogButton>
      <DialogButton label="Kembali ke Katalog" onPress={onClose} style={editorStyles.darkButton}>
        <Text style={editorStyles.whiteText}>Kembali ke Katalog</Text>
      </DialogButton>
    </AppDialog>
  );

  return (
    <AppDialog title="Modifikasi Kamus" description="Mengubah nama, warna, serta urutan kamus" onClose={onClose}>
      <CatalogImageField source={source} busy={image.busy} onPress={() => { void image.choose(); }} onError={image.imageFailed} />
      <Field label="Nama Kamus" value={name} editable={!image.busy} onChangeText={(value) => { setName(value); setError(''); }} />
      <CatalogColorField value={color} onChange={(value) => { setColor(value); setError(''); }} disabled={image.busy} />
      <View style={{ gap: 8 }}>
        <Text style={styles.label}>Urutan Kamus</Text>
        <DialogButton label="Pilih urutan kamus" onPress={() => setOrderOpen(!orderOpen)} disabled={image.busy}
          state={{ expanded: orderOpen }} style={styles.orderToggle}>
          <Text style={[editorStyles.darkText, { flex: 1 }]}>{position + 1}</Text>
          <ChevronDown size={24} color="#111827" accessible={false} />
        </DialogButton>
        {orderOpen && <View accessibilityRole="radiogroup" accessibilityLabel="Urutan kamus">
          {dictionaries.map((item, index) => <DialogButton key={item.id} role="radio" label={`Urutan ${index + 1}`}
            state={{ checked: position === index }} onPress={() => { setPosition(index); setOrderOpen(false); }}
            style={editorStyles.lightButton}>
            <Text style={editorStyles.darkText}>{index + 1}{position === index ? ' (dipilih)' : ''}</Text>
          </DialogButton>)}
        </View>}
      </View>
      <Message>{error || image.error}</Message>
      <Text style={editorStyles.note}>Pratinjau saja. Kamus dan urutan asli belum berubah.</Text>
      <DialogActions onCancel={onClose} onConfirm={preview} disabled={image.busy} confirmLabel="Lihat pratinjau perubahan kamus" />
      <DialogButton label="Hapus Kamus" onPress={() => setStage('delete')} disabled={image.busy} style={editorStyles.darkButton}>
        <Text style={editorStyles.whiteText}>Hapus Kamus</Text>
      </DialogButton>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  label: { color: '#374151', fontSize: 15, fontWeight: '600' },
  orderToggle: { flexDirection: 'row', padding: 12, borderColor: '#6B7280', minHeight: 50 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 8, minHeight: 40 },
  header: { backgroundColor: '#3F3F3F' },
  headerText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  rank: { width: '28%' },
  name: { flex: 1, paddingHorizontal: 6 },
  cell: { color: '#111827', fontSize: 15, textAlign: 'center' },
});
