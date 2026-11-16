import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Redirect, useNavigation, useRouter } from 'expo-router';
import { ApiError, authApi } from '../auth/api';
import { useAuth } from '../auth/AuthProvider';
import { Action, AuthForm, Field, Message, styles } from '../components/AuthForm';

export default function ResetPasswordScreen() {
  const { online, passwordResetGrant, setPasswordResetGrant } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const submitting = useRef(false);

  useEffect(() => navigation.addListener('blur', () => setPasswordResetGrant(null)),
    [navigation, setPasswordResetGrant]);

  if (!passwordResetGrant && !success) return <Redirect href="/forgot-password" />;

  async function submit() {
    if (submitting.current || !passwordResetGrant) return;
    if (passwordResetGrant.expiresAt <= Date.now()) { setError('Izin ganti password kedaluwarsa. Minta kode baru.'); return; }
    if (!password.trim() || password.length < 8 || password.length > 128) { setError('Password harus 8–128 karakter dan tidak boleh hanya spasi.'); return; }
    if (password !== confirmPassword) { setError('Konfirmasi password tidak sama.'); return; }
    submitting.current = true; setBusy(true); setError('');
    try {
      await authApi.resetPassword(passwordResetGrant.resetToken, password, confirmPassword);
      setPassword(''); setConfirmPassword(''); setSuccess(true);
    } catch (failure) {
      setPassword(''); setConfirmPassword('');
      setError(failure instanceof ApiError ? failure.message : 'Password belum dapat diganti. Coba lagi.');
    } finally { submitting.current = false; setBusy(false); }
  }

  function finish() { setPasswordResetGrant(null); router.replace('/'); }

  return <AuthForm>
    <Text accessibilityRole="header" style={styles.success}>Ganti Password</Text>
    <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none"
      autoComplete="new-password" textContentType="newPassword" maxLength={128} editable={!busy && !success} />
    <Field label="Konfirmasi Password" value={confirmPassword} onChangeText={setConfirmPassword}
      secureTextEntry autoCapitalize="none" autoComplete="new-password" textContentType="newPassword"
      maxLength={128} editable={!busy && !success} onSubmitEditing={() => { void submit(); }} />
    <Message>{error || (!online ? 'Mengganti password memerlukan koneksi internet.' : '')}</Message>
    <Action title="Ganti Password" busy={busy} disabled={!online || success} onPress={() => { void submit(); }} />
    <Pressable accessibilityRole="link" disabled={busy || success} style={styles.link}
      onPress={() => { setPasswordResetGrant(null); router.replace('/forgot-password'); }}>
      <Text style={styles.linkText}>Minta kode baru</Text>
    </Pressable>
    <Pressable accessibilityRole="link" disabled={busy || success} style={styles.link} onPress={finish}>
      <Text style={styles.linkText}>Kembali ke Masuk</Text>
    </Pressable>
    <Modal visible={success} transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.overlay}>
        <View style={styles.modal} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.success}>Password Berhasil Diganti</Text>
          <Text style={styles.body}>Masuk menggunakan password baru Anda.</Text>
          <Action title="Kembali ke Masuk" onPress={finish} />
        </View>
      </View>
    </Modal>
  </AuthForm>;
}
