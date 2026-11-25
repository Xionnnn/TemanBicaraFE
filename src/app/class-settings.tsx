import { useAuth } from '../auth/AuthProvider';
import { StudentClassSettingsScreen } from '../components/classes/StudentClassSettingsScreen';

export default function ClassSettingsRoute() {
  const { snapshot } = useAuth();
  return <StudentClassSettingsScreen key={snapshot.account?.id ?? 'preview'} />;
}

