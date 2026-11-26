import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { PreviewClass } from './previewData';
import { TeacherDetailLayout } from './TeacherDetailLayout';

type Bar = { id: string; name: string; value: number; detail: string };

function ActivityChart({ title, bars }: { title: string; bars: Bar[] }) {
  const maximum = Math.max(1, ...bars.map((bar) => bar.value));
  return (
    <View style={styles.chart}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.caption}>Data contoh. Setiap baris mewakili satu siswa.</Text>
      {bars.map((bar) => (
        <View key={bar.id} style={styles.barRow} accessible
          accessibilityLabel={`${bar.name}, ${bar.detail}: ${bar.value}`}>
          <View style={styles.barLabel}>
            <Text style={styles.studentLabel}>{bar.name}</Text>
            <Text style={styles.caption}>{bar.detail}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${bar.value / maximum * 100}%` }]} />
          </View>
          <Text style={styles.value}>{bar.value}</Text>
        </View>
      ))}
      {bars.length === 0 && <Text style={styles.empty}>Belum ada aktivitas pada pratinjau kelas ini.</Text>}
    </View>
  );
}

export function TeacherHistoryView({ classroom, onBack, onHome }:
  { classroom: PreviewClass; onBack: () => void; onHome: () => void }) {
  const { width, fontScale } = useWindowDimensions();
  const sideBySide = width >= 900 && fontScale <= 1.3;
  const mostUsed = classroom.students.map((student) => {
    const top = [...student.words].sort((a, b) => b.count - a.count)[0];
    return { id: student.id, name: student.name, value: top?.count ?? 0, detail: top?.word ?? 'Belum ada kata' };
  });
  const totals = classroom.students.map((student) => ({
    id: student.id, name: student.name,
    value: student.words.reduce((total, word) => total + word.count, 0), detail: 'Jumlah kata',
  }));
  return (
    <TeacherDetailLayout title="Riwayat Kelas dan Siswa" className={classroom.name} onBack={onBack} onHome={onHome}>
      <View style={[styles.charts, sideBySide && styles.chartsWide]}>
        <ActivityChart title="Kata yang paling sering digunakan" bars={mostUsed} />
        <ActivityChart title="Jumlah Kata per Siswa" bars={totals} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>Riwayat Per Siswa</Text>
      {classroom.students.length === 0 && <Text style={styles.empty}>Belum ada siswa dalam pratinjau kelas ini.</Text>}
      {classroom.students.map((student) => (
        <View key={student.id} style={styles.studentHistory}>
          <Text accessibilityRole="header" style={styles.studentTitle}>{student.name}</Text>
          <Text style={styles.sectionTitle}>Kata yang paling sering digunakan</Text>
          <View>
            <View style={[styles.tableRow, styles.header]}>
              <Text style={[styles.headerText, styles.rank]}>Urutan</Text>
              <Text style={[styles.headerText, styles.word]}>Kata</Text>
              <Text style={[styles.headerText, styles.frequency]}>Frekuensi</Text>
            </View>
            {[...student.words].sort((a, b) => b.count - a.count).map((item, index) => (
              <View key={item.word} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#D9D9D9' : '#EEEEEE' }]}>
                <Text style={[styles.cell, styles.rank]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.word]}>{item.word}</Text>
                <Text style={[styles.cell, styles.frequency]}>{item.count}</Text>
              </View>
            ))}
            {student.words.length === 0 && <Text style={styles.empty}>Belum ada kata dalam pratinjau siswa ini.</Text>}
          </View>
        </View>
      ))}
    </TeacherDetailLayout>
  );
}

const styles = StyleSheet.create({
  charts: { gap: 28 },
  chartsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  chart: { flex: 1, gap: 12, minWidth: 0 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', textAlign: 'center' },
  caption: { fontSize: 13, color: '#4B5563', textAlign: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48 },
  barLabel: { width: '32%', gap: 4 },
  studentLabel: { color: '#111827', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  track: { flex: 1, height: 24, backgroundColor: '#EEEEEE', borderLeftWidth: 2, borderColor: '#111827' },
  bar: { height: '100%', backgroundColor: '#525252' },
  value: { width: '15%', fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'center' },
  title: { fontSize: 25, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
  studentHistory: { gap: 12, marginBottom: 16 },
  studentTitle: { fontSize: 23, fontWeight: '700', color: '#111827', textAlign: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: 8, minHeight: 40 },
  header: { backgroundColor: '#3F3F3F' },
  headerText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  rank: { width: '23%' },
  word: { flex: 1, paddingHorizontal: 6 },
  frequency: { width: '32%' },
  cell: { color: '#111827', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  empty: { color: '#4B5563', fontSize: 15, lineHeight: 22, textAlign: 'center', padding: 20 },
});
