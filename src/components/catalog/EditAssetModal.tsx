import { useState } from 'react';
import { Text, View } from 'react-native';
import type { CatalogAsset, PickedImage } from '../../catalog/types';
import { resolveAssetImage } from '../../catalog/images';
import { AppDialog, DialogActions, DialogButton } from '../AppDialog';
import { Field, Message } from '../AuthForm';
import { CatalogDraftImage, CatalogImageField, editorStyles, useImageDraft } from './CatalogEditorFields';

export function EditAssetModal({ asset, pickImage, onClose }:
  { asset: CatalogAsset; pickImage: () => Promise<PickedImage | null>; onClose: () => void }) {
  const [name, setName] = useState(asset.name);
  const [stage, setStage] = useState<'edit' | 'preview' | 'delete' | 'deleted' | 'reset'>('edit');
  const [error, setError] = useState('');
  const image = useImageDraft(pickImage);
  const builtin = asset.sourceType === 'builtin';
  const source = image.picked ? { uri: image.picked.uri } : resolveAssetImage(asset);
  const backToEdit = () => setStage('edit');
  function preview() {
    if (image.busy) return;
    if (!name.trim()) { setError('Isi nama gambar terlebih dahulu.'); return; }
    setError('');
    setStage('preview');
  }

  if (stage === 'reset' || stage === 'delete') return (
    <AppDialog title={stage === 'reset' ? 'Reset Gambar?' : 'Hapus Gambar?'}
      description={stage === 'reset' ? 'Kembalikan nama dan gambar pada pratinjau ke versi bawaan?'
        : `Lihat pratinjau penghapusan gambar ${asset.name}?`} onClose={backToEdit}>
      <Text style={editorStyles.note}>Tindakan ini hanya untuk pratinjau. Gambar tersimpan dan riwayat tidak berubah.</Text>
      <DialogActions onCancel={backToEdit} confirmLabel={stage === 'reset' ? 'Konfirmasi pratinjau reset gambar' : 'Konfirmasi pratinjau hapus gambar'}
        onConfirm={() => {
          if (stage === 'reset') {
            setName(asset.defaultName || asset.name);
            image.reset();
            setError('');
            setStage('preview');
          } else setStage('deleted');
        }} />
    </AppDialog>
  );

  if (stage === 'preview' || stage === 'deleted') return (
    <AppDialog title={stage === 'deleted' ? 'Pratinjau Hapus Gambar' : 'Pratinjau Perubahan Gambar'}
      description="Perubahan belum disimpan ke katalog." onClose={onClose}>
      {stage === 'preview' ? <View style={editorStyles.preview}>
        <CatalogDraftImage source={source} onError={image.imageFailed} />
        <Text style={editorStyles.darkText}>{name.trim()}</Text>
      </View> : <Text style={editorStyles.note}>{asset.name} akan dihapus. Data asli tetap tersedia pada tahap UI ini.</Text>}
      <Message>{image.error}</Message>
      <DialogButton label="Ubah pratinjau gambar" onPress={backToEdit} style={editorStyles.lightButton}>
        <Text style={editorStyles.darkText}>Ubah Pratinjau</Text>
      </DialogButton>
      <DialogButton label="Kembali ke Katalog" onPress={onClose} style={editorStyles.darkButton}>
        <Text style={editorStyles.whiteText}>Kembali ke Katalog</Text>
      </DialogButton>
    </AppDialog>
  );

  return (
    <AppDialog title="Modifikasi Gambar" description="Mengubah gambar atau kata penjelas" onClose={onClose}>
      <CatalogImageField source={source} busy={image.busy} onPress={() => { void image.choose(); }} onError={image.imageFailed} />
      <Field label="Nama Gambar (Kata)" value={name} editable={!image.busy}
        onChangeText={(value) => { setName(value); setError(''); }} returnKeyType="done" />
      <Message>{error || image.error}</Message>
      <Text style={editorStyles.note}>{builtin ? 'Gambar bawaan. Reset hanya menampilkan versi bawaan dalam pratinjau.'
        : 'Gambar kustom. Perubahan dan penghapusan hanya ditampilkan dalam pratinjau.'}</Text>
      <DialogActions onCancel={onClose} onConfirm={preview} disabled={image.busy} confirmLabel="Lihat pratinjau perubahan gambar" />
      <DialogButton label={builtin ? 'Reset Gambar' : 'Hapus Gambar'} disabled={image.busy}
        onPress={() => setStage(builtin ? 'reset' : 'delete')} style={editorStyles.darkButton}>
        <Text style={editorStyles.whiteText}>{builtin ? 'Reset Gambar' : 'Hapus Gambar'}</Text>
      </DialogButton>
    </AppDialog>
  );
}
