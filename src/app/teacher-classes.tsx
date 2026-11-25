import { useAuth } from '../auth/AuthProvider';
import { TeacherClassesScreen } from '../components/classes/TeacherClassesScreen';

export default function TeacherClassesRoute() {
  const { snapshot } = useAuth();
  return <TeacherClassesScreen key={snapshot.account?.id ?? 'preview'} />;
}

