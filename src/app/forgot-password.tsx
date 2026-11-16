import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { ApiError, authApi, type PasswordRecovery } from '../auth/api';
import { useAuth } from '../auth/AuthProvider';
import { Action, AuthForm, Field, Message, styles } from '../components/AuthForm';

export default function ForgotPasswordScreen() {
  const { snapshot, online, setPasswordResetGrant } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState<PasswordRecovery | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(0);
  const deadline = useRef(0);
  const submitting = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))), 500);
    return () => clearInterval(timer);
  }, []);

  if (snapshot.phase === 'signedIn' && snapshot.onlineAccess !== 'blocked') return <Redirect href="/home" />;

  function acceptChallenge(challenge: PasswordRecovery) {
    setRecovery(challenge);
    setCode('');
    deadline.current = Date.now() + challenge.resendAfter * 1000;
    setRemaining(challenge.resendAfter);
    setOtpOpen(true);
  }

  async function sendCode() {
    if (submitting.current || remaining > 0) return;
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 254) {
      setError('Masukkan alamat email yang valid.'); return;
    }
    submitting.current = true; setBusy(true); setError('');
    try { acceptChallenge(await authApi.forgotPassword(normalized)); }
    catch (failure) {
      if (failure instanceof ApiError && failure.recovery) acceptChallenge(failure.recovery);
      if (failure instanceof ApiError && failure.status === 429 && !failure.recovery) {
        deadline.current = Date.now() + (failure.resendAfter ?? 60) * 1000;
        setRemaining(failure.resendAfter ?? 60);
      }
      setError(failure instanceof ApiError ? failure.message : 'Kode belum dapat dikirim. Coba lagi.');
    } finally { submitting.current = false; setBusy(false); }
  }

  async function verifyCode() {
    if (submitting.current || !recovery) return;
    if (!/^[0-9]{6}$/.test(code)) { setError('Masukkan kode 6 angka.'); return; }
    submitting.current = true; setBusy(true); setError('');
    try {
      const grant = await authApi.verifyPasswordReset(recovery.recoveryTicket, code);
      setPasswordResetGrant({ resetToken: grant.resetToken, expiresAt: Date.now() + grant.expiresIn * 1000 });
      setOtpOpen(false); setCode('');
      router.replace('/reset-password');
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'Kode belum dapat diperiksa. Coba lagi.');
    } finally { submitting.current = false; setBusy(false); }
  }

  function closeOtp() { if (!submitting.current) { setOtpOpen(false); setCode(''); setError(''); } }

  return <AuthForm>
    <Text accessibilityRole="header" style={styles.success}>Lupa Password</Text>
    <Text style={styles.body}>Masukkan email yang terdaftar pada akun Anda untuk menerima kode pemulihan.</Text>
    <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address"
      autoCapitalize="none" autoComplete="email" textContentType="emailAddress" maxLength={254}
      editable={!busy && !recovery} onSubmitEditing={() => { if (!recovery) void sendCode(); }} />
    {!otpOpen && <Message>{error || (!online ? 'Pemulihan password memerlukan koneksi internet.' : '')}</Message>}
    <Action title={recovery ? 'Masukkan Kode' : remaining > 0 ? `Coba lagi dalam ${remaining} detik` : 'Kirim Kode'}
      busy={busy} disabled={!online || (!recovery && remaining > 0)}
      onPress={() => { if (recovery) setOtpOpen(true); else void sendCode(); }} />
    {recovery && <Pressable accessibilityRole="button" disabled={busy} style={styles.link}
      onPress={() => { setRecovery(null); setCode(''); setError(''); deadline.current = 0; setRemaining(0); }}>
      <Text style={styles.linkText}>Gunakan email lain</Text>
    </Pressable>}
    <Pressable accessibilityRole="link" disabled={busy} style={styles.link}
      onPress={() => { setPasswordResetGrant(null); router.replace('/'); }}>
      <Text style={styles.linkText}>Kembali ke Masuk</Text>
    </Pressable>
    <Modal visible={otpOpen} transparent animationType="fade" onRequestClose={closeOtp}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.recoveryModalScroll}>
          <View style={[styles.modal, styles.otpModal]} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={styles.success}>Masukkan OTP Email</Text>
            <Text style={styles.body}>Periksa kode di {recovery?.email}. Kode berlaku selama 10 menit.</Text>
            <Field label="Kode OTP" value={code} onChangeText={setCode} keyboardType="number-pad"
              autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={6} editable={!busy}
              onSubmitEditing={() => { void verifyCode(); }} />
            <Message>{error || (!online ? 'Verifikasi kode memerlukan koneksi internet.' : '')}</Message>
            <View style={styles.recoveryActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Batal memasukkan kode" disabled={busy}
                accessibilityState={{ disabled: busy }} onPress={closeOtp}
                style={({ pressed }) => [styles.recoveryIconButton, styles.recoveryCancel, pressed && styles.pressed]}>
                <X size={28} color="#17202E" accessible={false} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Verifikasi kode OTP" disabled={!online || busy}
                accessibilityState={{ disabled: !online || busy, busy }} onPress={() => { void verifyCode(); }}
                style={({ pressed }) => [styles.recoveryIconButton, styles.recoveryConfirm,
                  (!online || busy) && styles.disabled, pressed && styles.pressed]}>
                {busy ? <Text style={styles.buttonText}>Memproses…</Text> : <Check size={28} color="#FFFFFF" accessible={false} />}
              </Pressable>
            </View>
            <Action title={remaining > 0 ? `Kirim ulang dalam ${remaining} detik` : 'Kirim Ulang Kode'}
              disabled={!online || busy || remaining > 0} onPress={() => { void sendCode(); }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  </AuthForm>;
}
