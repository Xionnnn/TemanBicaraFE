import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../auth/AuthProvider';
import { ApiError, authApi } from '../auth/api';
import { Action, AuthForm, Field, Message, styles } from '../components/AuthForm';

export default function VerifyScreen() {
  const { verification, setVerification, online, snapshot } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [remaining, setRemaining] = useState(verification?.resendAfter ?? 0);
  const deadline = useRef(0);
  const submitting = useRef(false);
  useEffect(() => {
    deadline.current = Date.now() + (verification?.resendAfter ?? 0) * 1000;
  }, [verification]);
  useEffect(() => {
    const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))), 500);
    return () => clearInterval(timer);
  }, []);
  if (snapshot.phase === 'signedIn') return <Redirect href="/home" />;
  if (!verification) return <Redirect href="/" />;
  const challenge = verification;

  async function submit(resend = false) {
    if (submitting.current) return;
    if (!resend && !/^\d{6}$/.test(code)) { setError('Masukkan kode 6 angka.'); return; }
    submitting.current = true; setBusy(true); setError('');
    try {
      if (resend) { setVerification(await authApi.resend(challenge.verificationTicket)); setCode(''); }
      else { await authApi.verify(challenge.verificationTicket, code); setSuccess(true); setCode(''); }
    } catch (failure) {
      if (failure instanceof ApiError && failure.verification)
        setVerification({ ...failure.verification, notice: failure.message });
      setError(failure instanceof ApiError ? failure.message : 'Verifikasi belum berhasil. Coba lagi.');
    } finally { submitting.current = false; setBusy(false); }
  }
  function finish() { setSuccess(false); setVerification(null); router.replace('/'); }

  return <AuthForm>
    <Text accessibilityRole="header" style={styles.success}>Verifikasi Email</Text>
    <Text style={styles.body}>Verifikasi {challenge.email} menggunakan kode 6 angka. Kode berlaku selama 10 menit.</Text>
    <Field label="Kode Verifikasi" value={code} onChangeText={setCode} keyboardType="number-pad"
      autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={6} editable={!busy && !success} />
    <Message>{error || challenge.notice || (!online ? 'Verifikasi memerlukan koneksi internet.' : '')}</Message>
    <Action title="Verifikasi Email" busy={busy} disabled={!online || success} onPress={() => { void submit(); }} />
    <Action title={remaining > 0 ? `Kirim ulang dalam ${remaining} detik` : 'Kirim Ulang Kode'}
      disabled={!online || busy || remaining > 0 || success} onPress={() => { void submit(true); }} />
    <Pressable accessibilityRole="link" disabled={busy} style={styles.link} onPress={() => { setVerification(null); router.replace('/'); }}>
      <Text style={styles.linkText}>Kembali ke Masuk</Text>
    </Pressable>
    <Modal visible={success} transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.overlay}><View accessibilityViewIsModal style={styles.modal}>
        <Text accessibilityRole="header" style={styles.success}>Pendaftaran Berhasil!</Text>
        <Text style={styles.body}>Email berhasil diverifikasi. Silakan masuk menggunakan akun Anda.</Text>
        <Action title="Masuk" onPress={finish} />
      </View></View>
    </Modal>
  </AuthForm>;
}
