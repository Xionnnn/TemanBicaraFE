import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth/AuthProvider';
import { PecsPlaceholder } from '../pecs/PecsIcons';

type RoleView = 'Teacher' | 'Student';

export function HomeView() {
  const router = useRouter();
  const { snapshot, controller } = useAuth();

  // Role detection: default to authenticated account role, fallback to 'Teacher'
  const activeRole: RoleView = snapshot.account?.role === 'Student' ? 'Student' : 'Teacher';
  const [roleOverride, setRoleOverride] = useState<RoleView | null>(null);

  const displayRole = roleOverride ?? activeRole;

  const handleLogout = () => {
    void controller.logout().catch(() => undefined);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Dev Role Switcher Badge */}
        {__DEV__ && (
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => setRoleOverride((prev) => (prev === 'Teacher' ? 'Student' : 'Teacher'))}
              style={styles.roleBadge}
              accessibilityLabel={`Peran aktif: ${displayRole}. Ketuk untuk beralih tampilan.`}
            >
              <Text style={styles.roleBadgeText}>
                Mode: {displayRole === 'Teacher' ? 'Guru' : 'Siswa'} (Ketuk untuk ganti)
              </Text>
            </Pressable>
          </View>
        )}

        {/* Center Logo & Brand Name */}
        <View style={styles.logoSection}>
          <PecsPlaceholder size={68} lineColor="#111827" backgroundColor="#D1D5DB" />
          <Text accessibilityRole="header" style={styles.brandTitle}>
            TemanBicara
          </Text>
        </View>

        {/* Action Buttons Stack */}
        <View style={styles.buttonsStack}>
          {displayRole === 'Teacher' ? (
            /* ================= TEACHER HOMEPAGE (Image 2) ================= */
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Katalog Gambar"
                onPress={() => router.push('/pecs')}
                style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
              >
                <Text style={styles.menuButtonText}>Katalog Gambar</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kelas dan Siswa"
                onPress={() => router.push('/teacher-classes')}
                style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
              >
                <Text style={styles.menuButtonText}>Kelas dan Siswa</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Keluar Akun"
                onPress={handleLogout}
                style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
              >
                <Text style={styles.logoutButtonText}>Keluar Akun</Text>
              </Pressable>
            </>
          ) : (
            /* ================= STUDENT HOMEPAGE (Image 1) ================= */
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Katalog Gambar"
                onPress={() => router.push('/pecs')}
                style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
              >
                <Text style={styles.menuButtonText}>Katalog Gambar</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Pengaturan Katalog"
                onPress={() => router.push('/catalog-settings')}
                style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
              >
                <Text style={styles.menuButtonText}>Pengaturan Katalog</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Riwayat Penggunaan"
                onPress={() => router.push('/usage-history')}
                style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
              >
                <Text style={styles.menuButtonText}>Riwayat Penggunaan</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Pengaturan Kelas"
                onPress={() => router.push('/class-settings')}
                style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
              >
                <Text style={styles.menuButtonText}>Pengaturan Kelas</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Keluar Akun"
                onPress={handleLogout}
                style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
              >
                <Text style={styles.logoutButtonText}>Keluar Akun</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
    minHeight: 32,
  },
  roleBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 36,
    gap: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  buttonsStack: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    gap: 16,
  },
  menuButton: {
    minHeight: 56,
    backgroundColor: '#BDBDBD',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  logoutButton: {
    minHeight: 56,
    backgroundColor: '#2E2E2E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});

