import { Redirect } from 'expo-router';
import { useAuth } from '../auth/AuthProvider';
import { CatalogSettingsScreen } from '../components/catalog/CatalogSettingsScreen';

export default function CatalogSettingsRoute() {
  const { snapshot } = useAuth();
  if (snapshot.phase !== 'signedIn' || !snapshot.account) return <Redirect href="/" />;
  if (snapshot.account.role !== 'Student') return <Redirect href="/home" />;
  // Keyed by account so no catalog state survives an account switch.
  return <CatalogSettingsScreen key={snapshot.account.id} accountId={snapshot.account.id} />;
}
