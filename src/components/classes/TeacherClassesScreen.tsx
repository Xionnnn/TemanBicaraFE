import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, Files, Plus, Trash2 } from 'lucide-react-native';
import { Field } from '../AuthForm';
import { HomeIcon } from '../pecs/PecsIcons';
import { ClassButton, ClassDialog, ClassDialogActions } from './ClassDialog';

type PreviewClass = { id: number; name: string; studentCount: number; year: string };
type Dialog = { type: 'create' }
  | { type: 'delete' | 'history' | 'students'; classroom: PreviewClass }
  | null;

const EXAMPLE_CLASSES: PreviewClass[] = [
  { id: 1, name: 'Kelas A', studentCount: 10, year: 'yyyy' },
  { id: 2, name: 'Kelas B', studentCount: 10, year: 'yyyy' },
  { id: 3, name: 'Kelas C', studentCount: 10, year: 'yyyy' },
];

export function TeacherClassesScreen() {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const isTablet = width >= 600;
  const largeText = fontScale > 1.3;
  const [classes, setClasses] = useState(EXAMPLE_CLASSES);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [className, setClassName] = useState('');
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const nextId = useRef(4);

  function closeDialog() { setDialog(null); setError(''); }

  function openCreate() {
    setClassName('');
    setError('');
    setDialog({ type: 'create' });
  }

  function addClass() {
    const name = className.trim();
    if (!name) { setError('Isi nama kelas terlebih dahulu.'); return; }
    const id = nextId.current++;
    setClasses((current) => [...current, { id, name, studentCount: 0, year: '-' }]);
    setAnnouncement(`${name} ditambahkan ke pratinjau.`);
    closeDialog();
  }

  function deleteClass(classroom: PreviewClass) {
    setClasses((current) => current.filter((item) => item.id !== classroom.id));
    setAnnouncement(`${classroom.name} dihapus dari pratinjau.`);
    closeDialog();
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.scroll, isTablet && styles.scrollTablet]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ClassButton label="Kembali ke Beranda" onPress={() => router.replace('/home')}
            style={[styles.home, isTablet && styles.homeTablet]}>
            <HomeIcon size={isTablet ? 44 : 40} color="#000000" />
          </ClassButton>

          <View style={[styles.heading, isTablet && styles.headingTablet]}>
            <Text accessibilityRole="header" style={[styles.title, isTablet && styles.titleTablet]}>
              Kelas dan Siswa
            </Text>
            <Text style={styles.subtitle}>Kelola kelas dan lihat aktivitas siswa.</Text>
          </View>

          <View style={styles.toolbar}>
            <ClassButton label="Tambah Kelas" onPress={openCreate} style={styles.addButton}>
              <Plus size={22} color="#111827" accessible={false} />
              <Text style={styles.addText}>Tambah Kelas</Text>
            </ClassButton>
          </View>

          <View style={styles.table}>
            <View style={[styles.row, styles.tableHeader]}>
              <Text style={[styles.headerText, styles.nameColumn]}>Kelas</Text>
              <Text style={[styles.headerText, styles.countColumn, isTablet && styles.countTablet,
                largeText && styles.countLarge]}>Siswa</Text>
              <Text style={[styles.headerText, styles.yearColumn, isTablet && styles.yearTablet,
                largeText && styles.yearLarge]}>Tahun</Text>
              {!largeText && <Text style={[styles.headerText, styles.detailColumn]}>Detail</Text>}
            </View>
            {classes.map((classroom, index) => (
              <View key={classroom.id} style={[styles.row, index % 2 === 0 ? styles.rowDark : styles.rowLight,
                largeText && styles.stackedRow]}>
                <View style={[styles.cells, largeText && styles.fullWidth]}>
                  <Text style={[styles.cellText, styles.nameColumn]}>{classroom.name}</Text>
                  <Text accessibilityLabel={`${classroom.studentCount} siswa, data contoh`}
                    style={[styles.cellText, styles.countColumn, isTablet && styles.countTablet,
                      largeText && styles.countLarge]}>
                    {classroom.studentCount}
                  </Text>
                  <Text style={[styles.cellText, styles.yearColumn, isTablet && styles.yearTablet,
                    largeText && styles.yearLarge]}>{classroom.year}</Text>
                </View>
                <View style={[styles.rowActions, largeText && styles.fullWidth]}>
                  {largeText && <Text style={styles.detailLabel}>Detail</Text>}
                  <View style={[styles.detailColumn, styles.rowActions]}>
                    <ClassButton label={`Riwayat ${classroom.name}`}
                      onPress={() => setDialog({ type: 'history', classroom })}>
                      <Files size={24} color="#000000" strokeWidth={2.5} accessible={false} />
                    </ClassButton>
                    <ClassButton label={`Lihat siswa ${classroom.name}`}
                      onPress={() => setDialog({ type: 'students', classroom })}>
                      <Eye size={25} color="#000000" strokeWidth={2.5} accessible={false} />
                    </ClassButton>
                    <ClassButton label={`Hapus ${classroom.name}`}
                      onPress={() => setDialog({ type: 'delete', classroom })}>
                      <Trash2 size={24} color="#000000" strokeWidth={2.5} accessible={false} />
                    </ClassButton>
                  </View>
                </View>
              </View>
            ))}
            {classes.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Belum ada kelas di pratinjau ini</Text>
                <Text style={styles.subtitle}>Ketuk Tambah Kelas untuk membuat kelas contoh.</Text>
              </View>
            )}
          </View>

          <Text style={styles.previewNotice}>
            Data contoh untuk pratinjau. Perubahan hanya berlaku selama halaman ini terbuka.
          </Text>
          {announcement !== '' && <Text accessibilityLiveRegion="polite" style={styles.announcement}>{announcement}</Text>}
        </View>
      </ScrollView>

      {dialog?.type === 'create' && (
        <ClassDialog title="Tambah Kelas" description="Menambahkan kelas baru" onClose={closeDialog}>
          <Field label="Nama Kelas" value={className} onChangeText={(value) => { setClassName(value); setError(''); }}
            autoFocus returnKeyType="done" onSubmitEditing={addClass} />
          {error !== '' && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <Text style={styles.dialogNote}>Kelas ini hanya ditambahkan ke pratinjau, belum disimpan ke akun.</Text>
          <ClassDialogActions onCancel={closeDialog} onConfirm={addClass} confirmLabel="Tambah kelas ke pratinjau" />
        </ClassDialog>
      )}
      {dialog?.type === 'delete' && (
        <ClassDialog title="Hapus Kelas?" description={`Hapus ${dialog.classroom.name} dari pratinjau ini?`}
          onClose={closeDialog}>
          <ClassDialogActions onCancel={closeDialog} onConfirm={() => deleteClass(dialog.classroom)}
            confirmLabel={`Konfirmasi hapus ${dialog.classroom.name}`} />
        </ClassDialog>
      )}
      {(dialog?.type === 'history' || dialog?.type === 'students') && (
        <ClassDialog title={dialog.type === 'history' ? 'Riwayat Kelas dan Siswa' : 'Daftar Siswa'}
          description={dialog.classroom.name} onClose={closeDialog}>
          <Text style={styles.dialogNote}>
            {dialog.type === 'history'
              ? 'Riwayat dan grafik aktivitas kelas belum tersedia.'
              : 'Daftar siswa dan penambahan siswa belum tersedia.'}
          </Text>
          <ClassButton label="Tutup" onPress={closeDialog} style={styles.closeButton}>
            <Text style={styles.closeText}>Tutup</Text>
          </ClassButton>
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
  heading: { alignItems: 'center', gap: 4, marginTop: 14, marginBottom: 20 },
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
  nameColumn: { flex: 1, minWidth: 0, paddingHorizontal: 2 },
  countColumn: { width: 40 },
  countTablet: { width: 90 },
  countLarge: { width: 80 },
  yearColumn: { width: 46 },
  yearTablet: { width: 100 },
  yearLarge: { width: 90 },
  detailColumn: { width: 144 },
  cells: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stackedRow: { flexDirection: 'column', alignItems: 'stretch', paddingVertical: 8 },
  fullWidth: { flex: 0, width: '100%' },
  detailLabel: { flex: 1, color: '#374151', fontSize: 13, paddingHorizontal: 2 },
  rowActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowDark: { backgroundColor: '#D9D9D9' },
  rowLight: { backgroundColor: '#EEEEEE' },
  cellText: { color: '#111827', fontSize: 13, fontWeight: '600', textAlign: 'center', paddingVertical: 10 },
  empty: { backgroundColor: '#EEEEEE', padding: 24, gap: 8 },
  emptyTitle: { color: '#111827', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  previewNotice: { color: '#4B5563', fontSize: 13, lineHeight: 20, marginTop: 16 },
  announcement: { color: '#374151', fontSize: 14, lineHeight: 20, marginTop: 8 },
  error: { color: '#9B1C1C', fontSize: 15, lineHeight: 22 },
  dialogNote: { color: '#4B5563', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  closeButton: { backgroundColor: '#3F3F3F', minHeight: 52 },
  closeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
