import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HomeIcon, PecsPlaceholder } from '../pecs/PecsIcons';
import { HISTORY_PREVIEW, type HistoryPreviewEntry } from './previewData';

export function UsageHistoryScreen({ entries = HISTORY_PREVIEW }:
  { entries?: readonly HistoryPreviewEntry[] }) {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const isTablet = width >= 600;
  const [listWidth, setListWidth] = useState(width);
  const [homeFocused, setHomeFocused] = useState(false);
  const pagePadding = isTablet ? 32 : 12;
  const frameWidth = Math.max(0, listWidth - pagePadding * 2 - 16);
  const minimumCardWidth = (isTablet ? 88 : 64) * Math.max(1, fontScale);
  const columns = Math.max(1, Math.floor((frameWidth + 6) / (minimumCardWidth + 6)));
  const cardWidth = Math.max(0, Math.floor((frameWidth - (columns - 1) * 6) / columns));
  const pictureSize = Math.max(0, Math.min(isTablet ? 96 : 76, cardWidth));

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom', 'left', 'right']}>
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        style={styles.list}
        contentContainerStyle={[styles.content, { paddingHorizontal: pagePadding },
          isTablet && styles.contentTablet]}
        onLayout={(event) => setListWidth(event.nativeEvent.layout.width)}
        ListHeaderComponent={
          <>
            <Pressable accessibilityRole="button" accessibilityLabel="Kembali ke Beranda"
              onPress={() => router.replace('/home')}
              onFocus={() => setHomeFocused(true)} onBlur={() => setHomeFocused(false)}
              style={({ pressed }) => [styles.home, isTablet && styles.homeTablet,
                homeFocused && styles.homeFocused, pressed && styles.pressed]}>
              <HomeIcon size={isTablet ? 44 : 40} color="#000000" />
            </Pressable>
            <View style={[styles.heading, isTablet && styles.headingTablet]}>
              <Text accessibilityRole="header" style={[styles.title, isTablet && styles.titleTablet]}>
                Riwayat Penggunaan
              </Text>
              <Text style={styles.subtitle}>Kalimat yang pernah digunakan.</Text>
              <Text style={styles.previewNotice}>Data contoh, belum berasal dari aktivitas akun.</Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <View accessible accessibilityLabel={`Contoh kalimat ${index + 1}: ${item.words.join(' ')}. Waktu contoh belum tersedia.`}
            style={styles.entry}>
            <Text style={styles.timestamp}>{item.displayTime}</Text>
            <View style={styles.sentence}>
              {item.words.map((word, wordIndex) => (
                <View key={`${item.id}:${wordIndex}`} style={[styles.word, { width: cardWidth }]}>
                  <PecsPlaceholder size={pictureSize} lineColor="#374151" backgroundColor="#D9D9D9" />
                  <Text style={[styles.wordLabel, isTablet && styles.wordLabelTablet]}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text accessibilityRole="header" style={styles.emptyTitle}>Belum ada riwayat penggunaan</Text>
            <Text style={styles.subtitle}>Belum ada kalimat untuk ditampilkan.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { flex: 1, width: '100%', maxWidth: 1104, alignSelf: 'center' },
  content: { paddingTop: 8, paddingBottom: 32 },
  contentTablet: { paddingTop: 20, paddingBottom: 48 },
  home: { width: 72, height: 72, borderRadius: 12, borderWidth: 2,
    borderColor: 'transparent', backgroundColor: '#D9D9D9', alignItems: 'center', justifyContent: 'center' },
  homeTablet: { width: 84, height: 84 },
  homeFocused: { borderColor: '#111827' },
  pressed: { opacity: 0.65 },
  heading: { alignItems: 'center', gap: 4, marginTop: 18, marginBottom: 26 },
  headingTablet: { marginTop: 24, marginBottom: 32 },
  title: { color: '#111827', fontSize: 25, fontWeight: '700', textAlign: 'center' },
  titleTablet: { fontSize: 32 },
  subtitle: { color: '#4B5563', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  previewNotice: { color: '#4B5563', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 4 },
  entry: { marginBottom: 24 },
  timestamp: { color: '#111827', fontSize: 14, marginBottom: 6, paddingHorizontal: 6 },
  sentence: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start',
    gap: 6, padding: 6, borderWidth: 2, borderColor: '#D9D9D9', backgroundColor: '#FFFFFF' },
  word: { alignItems: 'center', gap: 2 },
  wordLabel: { alignSelf: 'stretch', color: '#111827', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  wordLabelTablet: { fontSize: 16 },
  empty: { paddingVertical: 32, paddingHorizontal: 16, gap: 8 },
  emptyTitle: { color: '#111827', fontSize: 18, fontWeight: '600', textAlign: 'center' },
});
