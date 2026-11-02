import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type MenuModalProps = {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  username?: string;
  role?: string;
};

export function MenuModal({
  visible,
  onClose,
  onLogout,
  username = 'Siswa',
  role = 'Siswa',
}: MenuModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu TemanBicara</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup menu"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* User Profile Card */}
          <View style={styles.profileSection}>
            <Text style={styles.accountLabel}>Akun Aktif:</Text>
            <Text style={styles.userName}>{username}</Text>
            <Text style={styles.userRole}>Peran: {role}</Text>
          </View>

          {/* Action List */}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Keluar dari akun"
              accessibilityHint="Menutup sesi akun dan kembali ke halaman login"
              onPress={onLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
            >
              <Text style={styles.logoutText}>Keluar / Ganti Akun</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  profileSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accountLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  userRole: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  actions: {
    gap: 12,
  },
  logoutButton: {
    minHeight: 48,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
