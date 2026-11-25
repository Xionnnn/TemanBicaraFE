import { useEffect, useState, type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text,
  View, type StyleProp, type ViewStyle } from 'react-native';
import { Check, X } from 'lucide-react-native';

export function ClassButton({ label, onPress, children, style, disabled = false }:
  PropsWithChildren<{ label: string; onPress: () => void; style?: StyleProp<ViewStyle>; disabled?: boolean }>) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label}
      accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={({ pressed }) => [styles.button, style, focused && styles.focused,
        disabled && styles.disabled, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

export function ClassDialog({ title, description, onClose, children }:
  PropsWithChildren<{ title: string; description: string; onClose: () => void }>) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
          <View accessibilityViewIsModal style={styles.dialog}>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ClassDialogActions({ onCancel, onConfirm, confirmLabel, disabled = false }:
  { onCancel: () => void; onConfirm: () => void; confirmLabel: string; disabled?: boolean }) {
  return (
    <View style={styles.actions}>
      <ClassButton label="Batal" onPress={onCancel} style={[styles.action, styles.cancel]}>
        <X size={30} color="#111827" strokeWidth={3} accessible={false} />
      </ClassButton>
      <ClassButton label={confirmLabel} onPress={onConfirm} disabled={disabled}
        style={[styles.action, styles.confirm]}>
        <Check size={30} color="#111827" strokeWidth={3} accessible={false} />
      </ClassButton>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minWidth: 44, minHeight: 44, borderRadius: 8, borderWidth: 2,
    borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  focused: { borderColor: '#111827' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.65 },
  overlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.3)' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 480, padding: 20, gap: 16,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 16 },
  title: { color: '#111827', fontSize: 23, fontWeight: '700', textAlign: 'center' },
  description: { color: '#4B5563', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  action: { flex: 1, minHeight: 60 },
  cancel: { backgroundColor: '#F3F4F6', borderColor: '#525252' },
  confirm: { backgroundColor: '#BDBDBD', borderColor: '#525252' },
});
