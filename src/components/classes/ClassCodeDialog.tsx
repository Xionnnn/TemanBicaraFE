import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppDialog, DialogButton } from '../AppDialog';

export function ClassCodeDialog({ className, onClose, durationSeconds = 300 }:
  { className: string; onClose: () => void; durationSeconds?: number }) {
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + durationSeconds * 1000);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const time = `00:${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  function renew() {
    const currentTime = Date.now();
    setNow(currentTime);
    setExpiresAt(currentTime + durationSeconds * 1000);
  }
  return (
    <AppDialog title="Kode Kelas" description={`Masukkan kode kelas melalui perangkat siswa untuk ${className}.`}
      onClose={onClose}>
      <View style={styles.codeBox}>
        <Text selectable accessibilityLabel={seconds > 0 ? 'Kode contoh CONTOH' : 'Kode contoh kedaluwarsa'}
          style={styles.code}>{seconds > 0 ? 'CONTOH' : 'Kedaluwarsa'}</Text>
        <Text accessibilityLabel={`Sisa waktu kode contoh ${time}`} style={styles.time}>{time}</Text>
      </View>
      <Text style={styles.note}>Kode dan hitung mundur ini hanya contoh. Belum menerima siswa dari perangkat lain.</Text>
      {seconds === 0 && <DialogButton label="Perbarui kode contoh" onPress={renew} style={styles.button}>
        <Text style={styles.buttonText}>Perbarui Kode Contoh</Text>
      </DialogButton>}
      <DialogButton label="Keluar dari kode kelas" onPress={onClose} style={styles.button}>
        <Text style={styles.buttonText}>Keluar</Text>
      </DialogButton>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  codeBox: { padding: 16, gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: '#525252', borderRadius: 8 },
  code: { fontSize: 23, fontWeight: '700', textAlign: 'center', color: '#111827' },
  time: { color: '#4B5563', fontSize: 16, textAlign: 'center' },
  note: { fontSize: 14, lineHeight: 21, textAlign: 'center', color: '#4B5563' },
  button: { backgroundColor: '#BDBDBD', borderColor: '#525252', padding: 12, minHeight: 52 },
  buttonText: { color: '#111827', fontWeight: '700', fontSize: 16, textAlign: 'center' },
});
