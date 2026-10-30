import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';

export default function BlankAuthenticatedScreen() {
  const { snapshot } = useAuth();
  return snapshot.phase === 'signedIn' ? <View style={{ flex: 1, backgroundColor: '#FAFAFA' }} /> : <Redirect href="/" />;
}
