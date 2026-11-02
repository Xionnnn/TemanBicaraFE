import { Redirect } from 'expo-router';
import { useAuth } from '../auth/AuthProvider';
import { HomeView } from '../components/home/HomeView';

export default function HomeScreen() {
  const { snapshot } = useAuth();
  return snapshot.phase === 'signedIn' ? <HomeView /> : <Redirect href="/" />;
}
