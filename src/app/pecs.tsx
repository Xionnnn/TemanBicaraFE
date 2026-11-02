import { Redirect } from 'expo-router';
import { useAuth } from '../auth/AuthProvider';
import { PecsCommunicationScreen } from '../components/pecs/PecsCommunicationScreen';

export default function PecsRoute() {
  const { snapshot } = useAuth();
  return snapshot.phase === 'signedIn' ? <PecsCommunicationScreen /> : <Redirect href="/" />;
}
