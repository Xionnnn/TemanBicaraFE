import { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../auth/AuthProvider';
import { ApiError, authApi } from '../auth/api';
import { Action, AuthForm, Field, Message, styles } from '../components/AuthForm';

export default function LoginScreen() {
  const { controller, snapshot, online, setVerification } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  if (snapshot.phase === 'signedIn' && snapshot.onlineAccess !== 'blocked') return <Redirect href="/home" />;

  async function submit() {
    if (submitting.current) return;
    if (!username.trim() || !password) { setError('Isi username dan password.'); return; }
    submitting.current = true;
    setBusy(true);
    setError('');
    try { await controller.signIn(() => authApi.login(username.trim(), password)); setPassword(''); }
    catch (failure) {
      setPassword('');
      if (failure instanceof ApiError && failure.verification) {
        setVerification({ ...failure.verification, notice: failure.message });
        router.push('/verify-email');
      } else setError(failure instanceof ApiError ? failure.message : 'Akun belum dapat dibuka. Coba lagi.');
    } finally { submitting.current = false; setBusy(false); }
  }

  return <AuthForm>
    <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none"
      autoComplete="username" textContentType="username" maxLength={32} editable={!busy} />
    <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry
      autoCapitalize="none" autoComplete="current-password" textContentType="password" maxLength={128}
      editable={!busy} onSubmitEditing={() => { void submit(); }} />
    <Message>{error || (!online ? 'Masuk memerlukan koneksi internet.' : '')}</Message>
    <Action title="Masuk" busy={busy} disabled={!online} onPress={() => { void submit(); }} />
    <Pressable accessibilityRole="link" disabled={busy} style={styles.link} onPress={() => router.push('/register')}>
      <Text style={styles.linkText}>Belum memiliki akun? Daftar</Text>
    </Pressable>
  </AuthForm>;
}
