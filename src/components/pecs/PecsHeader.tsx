import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { HomeIcon, SpeakerIcon, TrashIcon } from './PecsIcons';

type PecsHeaderProps = {
  onGoHome: () => void;
  onClearStrip: () => void;
  onSpeakSentence: () => void;
  isStripEmpty?: boolean;
};

export function PecsHeader({
  onGoHome,
  onClearStrip,
  onSpeakSentence,
  isStripEmpty = false,
}: PecsHeaderProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const iconSize = isTablet ? 38 : 34;

  return (
    <View style={[styles.header, isTablet && styles.headerTablet]}>
      {/* Left: Home button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali ke Beranda"
        accessibilityHint="Membuka halaman beranda utama"
        onPress={onGoHome}
        style={({ pressed }) => [
          styles.button,
          isTablet && styles.buttonTablet,
          pressed && styles.pressed,
        ]}
      >
        <HomeIcon size={iconSize} color="#111827" />
      </Pressable>

      <View style={[styles.rightGroup, isTablet && styles.rightGroupTablet]}>
        {/* Middle-Right: Trash button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hapus semua kartu di kalimat"
          accessibilityHint="Mengosongkan baris kalimat di atas"
          accessibilityState={{ disabled: isStripEmpty }}
          disabled={isStripEmpty}
          onPress={onClearStrip}
          style={({ pressed }) => [
            styles.button,
            isTablet && styles.buttonTablet,
            isStripEmpty && styles.disabled,
            pressed && !isStripEmpty && styles.pressed,
          ]}
        >
          <TrashIcon size={iconSize} color={isStripEmpty ? '#9CA3AF' : '#111827'} />
        </Pressable>

        {/* Far-Right: Speak button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Putar suara kalimat"
          accessibilityHint="Membacakan kartu-kartu yang telah dipilih"
          accessibilityState={{ disabled: isStripEmpty }}
          disabled={isStripEmpty}
          onPress={onSpeakSentence}
          style={({ pressed }) => [
            styles.button,
            isTablet && styles.buttonTablet,
            isStripEmpty && styles.disabled,
            pressed && !isStripEmpty && styles.pressed,
          ]}
        >
          <SpeakerIcon size={iconSize} color={isStripEmpty ? '#9CA3AF' : '#111827'} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  headerTablet: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  rightGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  rightGroupTablet: {
    gap: 16,
  },
  button: {
    width: 68,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  buttonTablet: {
    width: 76,
    height: 68,
    borderRadius: 14,
  },
  disabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: '#D1D5DB',
  },
});
