import { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Field } from '../AuthForm';
import { HomeIcon } from '../pecs/PecsIcons';
import { ClassButton, ClassDialog, ClassDialogActions } from './ClassDialog';

type PreviewMembership = { id: string; name: string; year: string };
type Dialog = { type: 'join' } | { type: 'leave'; classroom: PreviewMembership } | null;

const INITIAL_CLASSES: PreviewMembership[] = [{ id: 'preview-1', name: 'Kelas1', year: 'yyyy' }];
const JOIN_EXAMPLE: PreviewMembership = { id: 'preview-2', name: 'Kelas2', year: 'yyyy' };

export function StudentClassSettingsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');

  function closeDialog() { setDialog(null); setCode(''); setError(''); }

  function openJoin() { setCode(''); setError(''); setDialog({ type: 'join' }); }

  function joinClass(submittedCode: string) {
    const entered = submittedCode.trim().toUpperCase();
    if (!entered) { setError('Isi kode kelas terlebih dahulu.'); return; }
    if (entered !== 'CONTOH') { setError('Untuk pratinjau ini, gunakan kode CONTOH.'); return; }
    if (classes.some((classroom) => classroom.id === JOIN_EXAMPLE.id)) {
      setError('Kelas contoh ini sudah ada di daftar.'); return;
    }
    setClasses((current) => current.some((classroom) => classroom.id === JOIN_EXAMPLE.id)
      ? current : [...current, JOIN_EXAMPLE]);
    setAnnouncement(`${JOIN_EXAMPLE.name} ditambahkan ke daftar pratinjau.`);
    closeDialog();
  }

  function leaveClass(classroom: PreviewMembership) {
    setClasses((current) => current.filter((item) => item.id !== classroom.id));
    setAnnouncement(`${classroom.name} dihapus dari daftar pratinjau.`);
    closeDialog();
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}>
        <View style={styles.content}>
          <ClassButton label="Kembali ke Beranda" onPress={() => router.replace('/home')}
            style={[styles.home, isTablet && styles.homeTablet]}>
            <HomeIcon size={isTablet ? 44 : 40} color="#000000" />
          </ClassButton>

          <View style={[styles.heading, isTablet && styles.headingTablet]}>
            <Text accessibilityRole="header" style={[styles.title, isTablet && styles.titleTablet]}>
              Pengaturan Kelas
            </Text>
            <Text style={styles.subtitle}>Lihat kelas yang diikuti atau tambahkan kelas dengan kode.</Text>
          </View>

          <View style={styles.toolbar}>
            <ClassButton label="Tambah Kelas" onPress={openJoin} style={styles.addButton}>
              <Plus size={22} color="#111827" accessible={false} />
              <Text style={styles.addText}>Tambah Kelas</Text>
            </ClassButton>
          </View>

          <View style={styles.table}>
            <View style={[styles.row, styles.tableHeader]}>
              <Text style={[styles.headerText, styles.yearColumn, isTablet && styles.headerTextTablet]}>Tahun</Text>
              <Text style={[styles.headerText, styles.nameColumn, isTablet && styles.headerTextTablet]}>Kelas</Text>
              <Text style={[styles.headerText, styles.detailColumn, isTablet && styles.headerTextTablet]}>Detail</Text>
            </View>
            {classes.map((classroom, index) => (
              <View key={classroom.id} style={[styles.row, index % 2 === 0 ? styles.rowDark : styles.rowLight]}>
                <Text style={[styles.cellText, styles.yearColumn, isTablet && styles.cellTextTablet]}>{classroom.year}</Text>
                <Text style={[styles.cellText, styles.nameColumn, isTablet && styles.cellTextTablet]}>{classroom.name}</Text>
                <View style={[styles.detailColumn, styles.actions]}>
                  <ClassButton label={`Keluar dari ${classroom.name}`}
                    onPress={() => setDialog({ type: 'leave', classroom })}>
                    <Trash2 size={24} color="#000000" strokeWidth={2.5} accessible={false} />
                  </ClassButton>
                </View>
              </View>
            ))}
            {classes.length === 0 && (
              <View style={styles.empty}>
                <Text accessibilityRole="header" style={styles.emptyTitle}>Belum ada kelas di pratinjau ini</Text>
                <Text style={styles.subtitle}>Ketuk Tambah Kelas untuk mencoba kode contoh.</Text>
              </View>
            )}
          </View>

          <Text style={styles.previewNotice}>
            Data contoh untuk pratinjau. Perubahan hanya berlaku selama halaman ini terbuka.
          </Text>
          {announcement !== '' && <Text accessibilityLiveRegion="polite" style={styles.announcement}>{announcement}</Text>}
        </View>
      </ScrollView>

      {dialog?.type === 'join' && (
        <ClassDialog title="Tambah Kelas" description="Masukkan kode kelas yang diberikan guru." onClose={closeDialog}>
          <Field label="Kode Kelas" value={code} onChangeText={(value) => { setCode(value); setError(''); }}
            autoFocus autoCapitalize="characters" autoComplete="off" returnKeyType="done"
            onSubmitEditing={(event) => joinClass(event.nativeEvent.text)} />
          {error !== '' && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <Text style={styles.dialogNote}>Kode contoh: CONTOH. Kelas hanya ditambahkan ke daftar pratinjau.</Text>
          <ClassDialogActions onCancel={closeDialog} onConfirm={() => joinClass(code)} confirmLabel="Tambahkan kelas contoh" />
        </ClassDialog>
      )}
      {dialog?.type === 'leave' && (
        <ClassDialog title="Keluar dari Kelas?"
          description={`Keluarkan ${dialog.classroom.name} dari daftar pratinjau ini?`} onClose={closeDialog}>
          <ClassDialogActions onCancel={closeDialog} onConfirm={() => leaveClass(dialog.classroom)}
            confirmLabel={`Konfirmasi keluar dari ${dialog.classroom.name}`} />
        </ClassDialog>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flexGrow: 1, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 32 },
  scrollTablet: { paddingHorizontal: 32, paddingTop: 20 },
  content: { width: '100%', maxWidth: 1040, alignSelf: 'center' },
  home: { width: 72, height: 72, backgroundColor: '#D9D9D9', borderRadius: 12 },
  homeTablet: { width: 84, height: 84 },
  heading: { alignItems: 'center', gap: 4, marginTop: 18, marginBottom: 20 },
  headingTablet: { marginTop: 24, marginBottom: 28 },
  title: { color: '#111827', fontSize: 25, fontWeight: '700', textAlign: 'center' },
  titleTablet: { fontSize: 32 },
  subtitle: { color: '#4B5563', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  toolbar: { alignItems: 'flex-end', marginBottom: 10 },
  addButton: { flexDirection: 'row', gap: 6, minHeight: 52, maxWidth: '100%', paddingHorizontal: 12,
    backgroundColor: '#BDBDBD', borderColor: '#525252' },
  addText: { color: '#111827', fontSize: 14, fontWeight: '700', flexShrink: 1 },
  table: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, minHeight: 60 },
  tableHeader: { backgroundColor: '#3F3F3F', minHeight: 36, paddingVertical: 8 },
  headerText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  headerTextTablet: { fontSize: 14 },
  yearColumn: { flex: 1, minWidth: 0, paddingHorizontal: 2 },
  nameColumn: { flex: 1.4, minWidth: 0, paddingHorizontal: 2 },
  detailColumn: { flex: 1.6, minWidth: 44 },
  actions: { alignItems: 'center', paddingVertical: 8 },
  rowDark: { backgroundColor: '#D9D9D9' },
  rowLight: { backgroundColor: '#EEEEEE' },
  cellText: { color: '#111827', fontSize: 13, fontWeight: '600', textAlign: 'center', paddingVertical: 10 },
  cellTextTablet: { fontSize: 16 },
  previewNotice: { color: '#4B5563', fontSize: 13, lineHeight: 20, marginTop: 16 },
  announcement: { color: '#374151', fontSize: 14, lineHeight: 20, marginTop: 8 },
  empty: { padding: 24, backgroundColor: '#EEEEEE', gap: 8 },
  emptyTitle: { color: '#111827', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  error: { color: '#9B1C1C', fontSize: 15, lineHeight: 22 },
  dialogNote: { color: '#4B5563', fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
