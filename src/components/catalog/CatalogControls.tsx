import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { Action, styles as formStyles } from '../AuthForm';

export function PencilButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={7}
      onPress={onPress}
      style={({ pressed }) => [styles.pencil, pressed && styles.pressed]}
    >
      <Pencil size={16} color="#FFFFFF" strokeWidth={2.5} accessible={false} />
    </Pressable>
  );
}

export function PlaceholderNotice({ message, onClose }: { message: string | null; onClose: () => void }) {
  return (
    <Modal visible={message !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={formStyles.overlay}>
        <View style={formStyles.modal} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={formStyles.success}>Belum tersedia</Text>
          <Text style={formStyles.body}>{message}</Text>
          <Action title="Tutup" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pencil: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
