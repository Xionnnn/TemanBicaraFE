import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../auth/AuthProvider';
import { ApiError, authApi } from '../auth/api';
import type { Account } from '../auth/session';
import { Action, AuthForm, Field, Message, styles } from '../components/AuthForm';

export default function RegisterScreen() {
  const { snapshot, online, setVerification } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Account['role'] | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  if (snapshot.phase === 'signedIn') return <Redirect href="/home" />;

  async function submit() {
    if (submitting.current) return;
    if (!role) { setError('Pilih role Guru atau Siswa.'); return; }
    if (!/^[A-Za-z0-9_]{3,32}$/.test(username.trim())) { setError('Username harus 3–32 huruf, angka, atau garis bawah.'); return; }
    if (password.length < 15 || password.length > 128) { setError('Password harus 15–128 karakter. Anda dapat menggunakan frasa.'); return; }
    if (password !== confirmPassword) { setError('Konfirmasi password tidak sama.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) { setError('Masukkan alamat email yang valid.'); return; }
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const challenge = await authApi.register({ username: username.trim(), password, confirmPassword,
        email: email.trim().toLowerCase(), role });
      setVerification(challenge);
      setPassword(''); setConfirmPassword('');
      router.replace('/verify-email');
    } catch (failure) {
      setPassword(''); setConfirmPassword('');
      if (failure instanceof ApiError && failure.verification) {
        setVerification({ ...failure.verification, notice: failure.message });
        router.replace('/verify-email');
      } else setError(failure instanceof ApiError ? failure.message : 'Pendaftaran belum berhasil. Coba lagi.');
    } finally { submitting.current = false; setBusy(false); }
  }

  return <AuthForm>
    <View style={{ gap: 8 }}><Text style={styles.label}>Pilih Role</Text>
      <View accessibilityRole="radiogroup" style={styles.roles}>
        {([{ value: 'Teacher', label: 'Guru' }, { value: 'Student', label: 'Siswa' }] as const).map((item) =>
          <Pressable key={item.value} accessibilityRole="radio" accessibilityLabel={item.label}
            accessibilityState={{ checked: role === item.value, disabled: busy }} disabled={busy}
            onPress={() => setRole(item.value)} style={[styles.role, role === item.value && styles.selectedRole]}>
            <Text style={[styles.roleText, role === item.value && { color: '#FFFFFF' }]}>{item.label}</Text>
          </Pressable>)}
      </View>
    </View>
    <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none"
      autoComplete="username-new" maxLength={32} editable={!busy} />
    <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none"
      autoComplete="new-password" textContentType="newPassword" maxLength={128} editable={!busy} />
    <Field label="Konfirmasi Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry
      autoCapitalize="none" autoComplete="new-password" maxLength={128} editable={!busy} />
    <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
      autoComplete="email" textContentType="emailAddress" maxLength={254} editable={!busy} />
    <Message>{error || (!online ? 'Pendaftaran memerlukan koneksi internet.' : '')}</Message>
    <Action title="Daftar" busy={busy} disabled={!online} onPress={() => { void submit(); }} />
    <Pressable accessibilityRole="link" disabled={busy} style={styles.link} onPress={() => router.replace('/')}>
      <Text style={styles.linkText}>Sudah memiliki akun? Masuk</Text>
    </Pressable>
  </AuthForm>;
}
