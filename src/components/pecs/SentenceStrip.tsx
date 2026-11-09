import { useRef, type ElementRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { PecsPlaceholder } from './PecsIcons';
import type { SentenceItem } from './types';

type SentenceStripProps = {
  items: SentenceItem[];
  onRemoveItem: (instanceId: string) => void;
};

export function SentenceStrip({ items, onRemoveItem }: SentenceStripProps) {
  const scrollRef = useRef<ElementRef<typeof ScrollView>>(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const placeholderSize = isTablet ? 68 : 58;

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]}
        onContentSizeChange={() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isTablet && styles.emptyTextTablet]}>
              Pilih kartu di bawah untuk menyusun kalimat
            </Text>
          </View>
        ) : (
          items.map((item, index) => (
            <Pressable
              key={item.instanceId}
              accessibilityRole="button"
              accessibilityLabel={`Hapus kata ${item.card.name} ke-${index + 1}`}
              accessibilityHint="Ketuk untuk menghapus kartu ini dari kalimat"
              onPress={() => onRemoveItem(item.instanceId)}
              style={({ pressed }) => [
                styles.stripCard,
                isTablet && styles.stripCardTablet,
                pressed && styles.cardPressed,
              ]}
            >
              <PecsPlaceholder
                size={placeholderSize}
                lineColor="#374151"
                backgroundColor="#F9FAFB"
              />
              <Text
                numberOfLines={1}
                style={[styles.cardLabel, isTablet && styles.cardLabelTablet]}
              >
                {item.card.name}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Wireframe's bottom indicator bar */}
      <View style={styles.indicatorTrack}>
        <View style={[styles.indicatorThumb, isTablet && styles.indicatorThumbTablet]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 110,
    justifyContent: 'center',
  },
  containerTablet: {
    minHeight: 124,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 100,
  },
  scrollContentTablet: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
    minHeight: 114,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyTextTablet: {
    fontSize: 17,
  },
  stripCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    minWidth: 70,
  },
  stripCardTablet: {
    minWidth: 84,
    padding: 6,
  },
  cardPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
    textAlign: 'center',
  },
  cardLabelTablet: {
    fontSize: 16,
    marginTop: 6,
  },
  indicatorTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    width: '100%',
    alignItems: 'center',
  },
  indicatorThumb: {
    width: 60,
    height: 4,
    backgroundColor: '#9CA3AF',
    borderRadius: 2,
  },
  indicatorThumbTablet: {
    width: 90,
  },
});
