import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth/AuthProvider';
import { PecsPlaceholder } from '../pecs/PecsIcons';

type RoleView = 'Teacher' | 'Student';

export function HomeView() {
  const router = useRouter();
  const { snapshot, controller } = useAuth();
  const { width } = useWindowDimensions();

  const isTablet = width >= 600;

  // Role detection: default to authenticated account role, fallback to 'Teacher'
  const activeRole: RoleView = snapshot.account?.role === 'Student' ? 'Student' : 'Teacher';
  const [roleOverride, setRoleOverride] = useState<RoleView | null>(null);

  const displayRole = roleOverride ?? activeRole;

  const handleLogout = () => {
    void controller.logout().catch(() => undefined);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isTablet && styles.scrollContainerTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dev Role Switcher Badge */}
        {__DEV__ && (
          <View style={[styles.headerRow, isTablet && styles.headerRowTablet]}>
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

        <View style={[styles.contentWrapper, isTablet && styles.contentWrapperTablet]}>
          {/* Center Logo & Brand Name */}
          <View style={[styles.logoSection, isTablet && styles.logoSectionTablet]}>
            <PecsPlaceholder
              size={isTablet ? 74 : 64}
              lineColor="#111827"
              backgroundColor="#D1D5DB"
            />
            <Text
              accessibilityRole="header"
              style={[styles.brandTitle, isTablet && styles.brandTitleTablet]}
            >
              TemanBicara
            </Text>
          </View>

          {/* Action Buttons Stack */}
          <View style={[styles.buttonsStack, isTablet && styles.buttonsStackTablet]}>
            {displayRole === 'Teacher' ? (
              /* ================= TEACHER HOMEPAGE (Image 2) ================= */
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Katalog Gambar"
                  onPress={() => router.push('/pecs')}
                  style={({ pressed }) => [
                    styles.menuButton,
                    isTablet && styles.menuButtonTablet,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.menuButtonText, isTablet && styles.menuButtonTextTablet]}>
                    Katalog Gambar
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pengaturan Kelas dan Siswa"
                  onPress={() => router.push('/teacher-classes')}
                  style={({ pressed }) => [
                    styles.menuButton,
                    isTablet && styles.menuButtonTablet,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.menuButtonText, isTablet && styles.menuButtonTextTablet]}>
                    Pengaturan Kelas dan Siswa
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Keluar Akun"
                  onPress={handleLogout}
                  style={({ pressed }) => [
                    styles.logoutButton,
                    isTablet && styles.logoutButtonTablet,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.logoutButtonText, isTablet && styles.logoutButtonTextTablet]}>
                    Keluar Akun
                  </Text>
                </Pressable>
              </>
            ) : (
              /* ================= STUDENT HOMEPAGE (Image 1) ================= */
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Katalog Gambar"
                  onPress={() => router.push('/pecs')}
                  style={({ pressed }) => [
                    styles.menuButton,
                    isTablet && styles.menuButtonTablet,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.menuButtonText, isTablet && styles.menuButtonTextTablet]}>
                    Katalog Gambar
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pengaturan Katalog"
                  onPress={() => router.push('/catalog-settings')}
                  style={({ pressed }) => [
                    styles.menuButton,
                    isTablet && styles.menuButtonTablet,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.menuButtonText, isTablet && styles.menuButtonTextTablet]}>
                    Pengaturan Katalog
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Riwayat Penggunaan"
                  onPress={() => router.push('/usage-history')}
                  style={({ pressed }) => [
                    styles.menuButton,
                    isTablet && styles.menuButtonTablet,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.menuButtonText, isTablet && styles.menuButtonTextTablet]}>
                    Riwayat Penggunaan
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pengaturan Kelas"
                  onPress={() => router.push('/class-settings')}
                  style={({ pressed }) => [
                    styles.menuButton,
                    isTablet && styles.menuButtonTablet,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.menuButtonText, isTablet && styles.menuButtonTextTablet]}>
                    Pengaturan Kelas
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Keluar Akun"
                  onPress={handleLogout}
                  style={({ pressed }) => [
                    styles.logoutButton,
                    isTablet && styles.logoutButtonTablet,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.logoutButtonText, isTablet && styles.logoutButtonTextTablet]}>
                    Keluar Akun
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  scrollContainerTablet: {
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
    minHeight: 32,
  },
  headerRowTablet: {
    paddingTop: 12,
  },
  roleBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
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
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentWrapperTablet: {
    paddingVertical: 12,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 32,
    gap: 12,
  },
  logoSectionTablet: {
    marginTop: 8,
    marginBottom: 36,
    gap: 14,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  brandTitleTablet: {
    fontSize: 30,
    letterSpacing: 0.3,
  },
  buttonsStack: {
    width: '100%',
    maxWidth: 380,
    gap: 16,
  },
  buttonsStackTablet: {
    maxWidth: 780,
    gap: 18,
  },
  menuButton: {
    minHeight: 56,
    backgroundColor: '#BDBDBD',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  menuButtonTablet: {
    minHeight: 62,
    borderRadius: 10,
    paddingHorizontal: 24,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  menuButtonTextTablet: {
    fontSize: 18,
  },
  logoutButton: {
    minHeight: 56,
    backgroundColor: '#2E2E2E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logoutButtonTablet: {
    minHeight: 62,
    borderRadius: 10,
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  logoutButtonTextTablet: {
    fontSize: 18,
  },
  pressed: {
    opacity: 0.75,
  },
});
