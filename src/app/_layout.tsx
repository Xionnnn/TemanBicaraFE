import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../auth/AuthProvider';
import { Action, styles } from '../components/AuthForm';

function Routes() {
  const { snapshot, controller } = useAuth();
  if (snapshot.phase === 'loading') return <View style={[styles.page, { justifyContent: 'center' }]}>
    <ActivityIndicator accessibilityLabel="Membuka akun" color="#374151" />
  </View>;
  if (snapshot.phase === 'error') return <View style={[styles.page, { justifyContent: 'center', padding: 24, gap: 20 }]}>
    <Text accessibilityRole="alert" style={styles.body}>Akun belum dapat dibuka. Coba lagi.</Text>
    <Action title="Coba lagi" onPress={() => { void controller.restore().catch(() => undefined); }} />
  </View>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAFAFA' } }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="register" />
    <Stack.Screen name="verify-email" />
    <Stack.Screen name="home" />
  </Stack>;
}

export default function RootLayout() {
  return <SafeAreaProvider><AuthProvider><StatusBar style="dark" /><Routes /></AuthProvider></SafeAreaProvider>;
}
