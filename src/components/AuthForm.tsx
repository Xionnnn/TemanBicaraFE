import { useState, type PropsWithChildren } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';

export function AuthForm({ children }: PropsWithChildren) {
  return <SafeAreaView style={styles.page}><KeyboardAvoidingView style={styles.page}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
      <View style={styles.form}>
        <Text accessibilityRole="header" style={styles.brand}>TemanBicara</Text>
        {children}
      </View>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}

export function Field({ label, secureTextEntry, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [toggleFocused, setToggleFocused] = useState(false);
  const toggleDisabled = props.editable === false || props.readOnly === true;
  const VisibilityIcon = passwordVisible ? EyeOff : Eye;

  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View>
      <TextInput {...props} accessibilityLabel={label} autoCorrect={false}
        secureTextEntry={secureTextEntry && !passwordVisible}
        onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
        style={[styles.input, focused && styles.focused, props.style, secureTextEntry && styles.passwordInput]} />
      {secureTextEntry && <Pressable accessibilityRole="button"
        accessibilityLabel={`${passwordVisible ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`}
        accessibilityState={{ disabled: toggleDisabled }} disabled={toggleDisabled}
        onPress={() => setPasswordVisible((visible) => !visible)}
        onFocus={() => setToggleFocused(true)} onBlur={() => setToggleFocused(false)}
        style={({ pressed }) => [styles.visibilityToggle, toggleFocused && styles.visibilityToggleFocused,
          toggleDisabled && styles.visibilityToggleDisabled, pressed && styles.pressed]}>
        <VisibilityIcon size={22} color="#374151" accessible={false} />
      </Pressable>}
    </View>
  </View>;
}

export function Action({ title, onPress, busy = false, disabled = false }:
  { title: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }}
    disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => [styles.button, (disabled || busy) && styles.disabled, pressed && styles.pressed]}>
    {busy ? <ActivityIndicator color="#FFFFFF" accessibilityLabel="Sedang diproses" /> :
      <Text style={styles.buttonText}>{title}</Text>}
  </Pressable>;
}

export function Message({ children }: PropsWithChildren) {
  return children ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.message}>{children}</Text> : null;
}

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },
  form: { width: '100%', maxWidth: 440, alignSelf: 'center', gap: 20 },
  brand: { color: '#17202E', fontSize: 26, fontWeight: '700', textAlign: 'center', marginTop: 12, marginBottom: 28 },
  field: { gap: 8 },
  label: { color: '#374151', fontSize: 15, fontWeight: '600' },
  input: { minHeight: 50, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1,
    borderColor: '#6B7280', borderRadius: 7, color: '#17202E', fontSize: 17, backgroundColor: '#FFFFFF' },
  focused: { borderColor: '#374151', borderWidth: 2 },
  passwordInput: { paddingRight: 60 },
  visibilityToggle: { position: 'absolute', right: 4, top: 3, bottom: 3, width: 44, minHeight: 44,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', borderRadius: 4 },
  visibilityToggleFocused: { borderColor: '#374151', backgroundColor: '#E5E7EB' },
  visibilityToggleDisabled: { opacity: 0.5 },
  button: { minHeight: 50, backgroundColor: '#525252', paddingHorizontal: 18, paddingVertical: 14,
    borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  disabled: { backgroundColor: '#666666' },
  pressed: { opacity: 0.8 },
  message: { color: '#9B1C1C', fontSize: 15, lineHeight: 22 },
  body: { color: '#4B5563', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  link: { minHeight: 44, justifyContent: 'center', paddingVertical: 10 },
  linkText: { color: '#374151', fontSize: 15, fontWeight: '600', textAlign: 'center', textDecorationLine: 'underline' },
  roles: { flexDirection: 'row', gap: 20 },
  role: { flex: 1, minHeight: 50, borderRadius: 7, borderWidth: 2, borderColor: '#6B7280',
    backgroundColor: '#E5E7EB', padding: 12, justifyContent: 'center' },
  selectedRole: { borderColor: '#17202E', backgroundColor: '#525252' },
  roleText: { color: '#17202E', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 },
  modal: { maxWidth: 440, width: '100%', alignSelf: 'center', backgroundColor: '#FFFFFF', padding: 24,
    borderRadius: 16, gap: 20 },
  success: { fontSize: 22, fontWeight: '700', color: '#17202E', textAlign: 'center' },
  recoveryModalScroll: { flexGrow: 1, justifyContent: 'center' },
  otpModal: { borderWidth: 1, borderColor: '#6B7280' },
  recoveryActions: { flexDirection: 'row', gap: 12 },
  recoveryIconButton: { flex: 1, minHeight: 50, padding: 12, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center' },
  recoveryCancel: { borderWidth: 1, borderColor: '#6B7280', backgroundColor: '#E5E7EB' },
  recoveryConfirm: { backgroundColor: '#525252' },
});
