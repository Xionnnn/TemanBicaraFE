import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { HomeIcon } from '../pecs/PecsIcons';
import { DialogButton } from '../AppDialog';

export function TeacherDetailLayout({ title, className, onBack, onHome, children }:
  PropsWithChildren<{ title: string; className: string; onBack: () => void; onHome: () => void }>) {
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.scroll, width >= 600 && styles.tablet]}>
        <View style={styles.content}>
          <View style={styles.navigation}>
            <DialogButton label="Kembali ke Beranda" onPress={onHome} style={styles.home}>
              <HomeIcon size={40} color="#000000" />
            </DialogButton>
            <DialogButton label="Kembali ke daftar kelas" onPress={onBack} style={styles.back}>
              <ArrowLeft size={20} color="#111827" accessible={false} />
              <Text style={styles.backText}>Daftar Kelas</Text>
            </DialogButton>
          </View>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Text style={styles.className}>{className}</Text>
            <Text style={styles.notice}>Data contoh untuk pratinjau, bukan aktivitas siswa sebenarnya.</Text>
          </View>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flexGrow: 1, padding: 12, paddingBottom: 32 },
  tablet: { paddingHorizontal: 32, paddingTop: 20 },
  content: { width: '100%', maxWidth: 1040, alignSelf: 'center', gap: 20 },
  navigation: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  home: { width: 72, height: 72, backgroundColor: '#D9D9D9', borderRadius: 12 },
  back: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: '#EEEEEE', borderColor: '#525252', maxWidth: '100%' },
  backText: { fontSize: 14, fontWeight: '600', color: '#111827', flexShrink: 1 },
  heading: { alignItems: 'center', gap: 8 },
  title: { color: '#111827', fontSize: 25, fontWeight: '700', textAlign: 'center' },
  className: { color: '#111827', fontSize: 23, fontWeight: '700', textAlign: 'center' },
  notice: { color: '#4B5563', fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
