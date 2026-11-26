import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Pencil } from 'lucide-react-native';

export function PencilButton({ label, onPress }: { label: string; onPress: () => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={({ pressed }) => [styles.pencil, focused && styles.focused, pressed && styles.pressed]}
    >
      <Pencil size={16} color={focused ? '#111827' : '#FFFFFF'} strokeWidth={2.5} accessible={false} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pencil: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  focused: { borderColor: '#111827', backgroundColor: '#FFFFFF' },
});
