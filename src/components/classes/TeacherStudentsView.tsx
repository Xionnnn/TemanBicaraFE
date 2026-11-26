import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { AppDialog, DialogActions, DialogButton } from '../AppDialog';
import { ClassCodeDialog } from './ClassCodeDialog';
import type { PreviewClass, PreviewStudent } from './previewData';
import { TeacherDetailLayout } from './TeacherDetailLayout';

export function TeacherStudentsView({ classroom, onBack, onHome, onRemove }:
  { classroom: PreviewClass; onBack: () => void; onHome: () => void; onRemove: (id: string) => void }) {
  const [codeOpen, setCodeOpen] = useState(false);
  const [removing, setRemoving] = useState<PreviewStudent | null>(null);
  const [announcement, setAnnouncement] = useState('');
  return (
    <>
      <TeacherDetailLayout title="Kelas dan Siswa" className={classroom.name} onBack={onBack} onHome={onHome}>
        <View style={styles.toolbar}>
          <DialogButton label="Tambah Siswa" onPress={() => setCodeOpen(true)} style={styles.add}>
            <Plus size={22} color="#111827" accessible={false} />
            <Text style={styles.addText}>Tambah Siswa</Text>
          </DialogButton>
        </View>
        <View>
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.headerText, styles.number]}>No.</Text>
            <Text style={[styles.headerText, styles.name]}>Siswa</Text>
            <Text style={[styles.headerText, styles.detail]}>Detail</Text>
          </View>
          {classroom.students.map((student, index) => (
            <View key={student.id} style={[styles.row, { backgroundColor: index % 2 === 0 ? '#D9D9D9' : '#EEEEEE' }]}>
              <Text style={[styles.cell, styles.number]}>{index + 1}</Text>
              <Text style={[styles.cell, styles.name]}>{student.name}</Text>
              <View style={styles.detail}>
                <DialogButton label={`Hapus ${student.name} dari kelas`} onPress={() => setRemoving(student)}>
                  <Trash2 size={24} color="#111827" strokeWidth={2.5} accessible={false} />
                </DialogButton>
              </View>
            </View>
          ))}
          {classroom.students.length === 0 && <Text style={styles.empty}>Belum ada siswa dalam pratinjau kelas ini.</Text>}
        </View>
        {announcement !== '' && <Text accessibilityLiveRegion="polite" style={styles.note}>{announcement}</Text>}
      </TeacherDetailLayout>
      {codeOpen && <ClassCodeDialog className={classroom.name} onClose={() => setCodeOpen(false)} />}
      {removing && <AppDialog title="Hapus Siswa dari Kelas?"
        description={`Hapus ${removing.name} dari pratinjau ${classroom.name}? Akun siswa tidak dihapus.`}
        onClose={() => setRemoving(null)}>
        <DialogActions onCancel={() => setRemoving(null)} confirmLabel="Konfirmasi hapus siswa dari pratinjau"
          onConfirm={() => {
            onRemove(removing.id);
            setAnnouncement(`${removing.name} dihapus dari pratinjau kelas.`);
            setRemoving(null);
          }} />
      </AppDialog>}
    </>
  );
}

const styles = StyleSheet.create({
  toolbar: { alignItems: 'flex-end' },
  add: { flexDirection: 'row', gap: 6, padding: 12, maxWidth: '100%', backgroundColor: '#BDBDBD', borderColor: '#525252' },
  addText: { fontSize: 15, fontWeight: '700', color: '#111827', flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, minHeight: 60 },
  header: { backgroundColor: '#3F3F3F', minHeight: 36 },
  headerText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  number: { width: '18%' },
  name: { flex: 1, paddingHorizontal: 8 },
  detail: { width: '25%', alignItems: 'center' },
  cell: { color: '#111827', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  empty: { backgroundColor: '#EEEEEE', padding: 24, fontSize: 16, color: '#4B5563', textAlign: 'center' },
  note: { color: '#4B5563', fontSize: 14, lineHeight: 21 },
});
