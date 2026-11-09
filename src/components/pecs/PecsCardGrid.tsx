import { type ElementRef, useEffect, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ArrowIcon, PecsPlaceholder } from './PecsIcons';
import type { PecsCard } from './types';

type PecsCardGridProps = {
  cards: PecsCard[];
  onSelectCard: (card: PecsCard) => void;
};

export function PecsCardGrid({ cards, onSelectCard }: PecsCardGridProps) {
  const scrollViewRef = useRef<ElementRef<typeof ScrollView>>(null);
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const numColumns = isTablet ? 4 : 2;

  // Responsive sizing calculations
  const horizontalPadding = isTablet ? 24 : 16;
  const gap = isTablet ? 16 : 14;
  const totalGaps = (numColumns - 1) * gap;
  const availableWidth = width - horizontalPadding * 2 - totalGaps;
  const cardWidth = Math.max(80, Math.floor(availableWidth / numColumns));
  const placeholderSize = Math.min(isTablet ? 135 : 115, Math.floor(cardWidth * 0.7));

  const arrowIconSize = isTablet ? 40 : 36;

  // Reset scroll to top whenever the cards list changes (e.g. category changed)
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [cards]);

  const canGoUp = scrollY > 4;
  const canGoDown =
    containerHeight > 0
      ? contentHeight > containerHeight + 4 && scrollY < contentHeight - containerHeight - 4
      : cards.length > 4;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  };

  const handleContentSizeChange = (_w: number, height: number) => {
    setContentHeight(height);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  };

  const handleUp = () => {
    if (!canGoUp) return;
    const scrollStep = Math.max(160, containerHeight * 0.75);
    const targetY = Math.max(0, scrollY - scrollStep);
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
  };

  const handleDown = () => {
    if (!canGoDown) return;
    const scrollStep = Math.max(160, containerHeight * 0.75);
    const maxScroll = Math.max(0, contentHeight - containerHeight);
    const targetY = Math.min(maxScroll, scrollY + scrollStep);
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
  };

  // Determine spacers needed for left-aligning the last row
  const remainder = cards.length % numColumns;
  const spacerCount = remainder === 0 ? 0 : numColumns - remainder;

  return (
    <View
      style={[
        styles.container,
        isTablet && styles.containerTablet,
        { paddingHorizontal: horizontalPadding },
      ]}
    >
      {/* Top Wide Up Arrow */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kartu sebelumnya"
        accessibilityHint="Menggeser daftar kartu ke atas"
        accessibilityState={{ disabled: !canGoUp }}
        disabled={!canGoUp}
        onPress={handleUp}
        style={({ pressed }) => [
          styles.wideArrowButton,
          isTablet && styles.wideArrowButtonTablet,
          !canGoUp && styles.arrowDisabled,
          pressed && canGoUp && styles.pressed,
        ]}
      >
        <ArrowIcon direction="up" size={arrowIconSize} color={canGoUp ? '#111827' : '#9CA3AF'} />
      </Pressable>

      {/* Scrollable Responsive Cards Grid */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        style={styles.gridScrollView}
        contentContainerStyle={[styles.gridContent, { gap }]}
        accessibilityRole="list"
        accessibilityLabel="Daftar kartu PECS"
      >
        {cards.map((card) => (
          <Pressable
            key={card.id}
            accessibilityRole="button"
            accessibilityLabel={`Pilih kartu ${card.name}`}
            accessibilityHint="Menambahkan kartu ini ke baris kalimat"
            onPress={() => onSelectCard(card)}
            style={({ pressed }) => [
              styles.card,
              isTablet && styles.cardTablet,
              { width: cardWidth },
              pressed && styles.cardPressed,
            ]}
          >
            <PecsPlaceholder
              size={placeholderSize}
              lineColor="#1F2937"
              backgroundColor="#F3F4F6"
            />
            <Text
              numberOfLines={1}
              style={[styles.cardText, isTablet && styles.cardTextTablet]}
            >
              {card.name}
            </Text>
          </Pressable>
        ))}

        {/* Invisible spacers to keep the last row cleanly aligned to the left */}
        {spacerCount > 0 &&
          Array.from({ length: spacerCount }).map((_, i) => (
            <View key={`grid-spacer-${i}`} style={{ width: cardWidth }} />
          ))}
      </ScrollView>

      {/* Bottom Wide Down Arrow */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kartu berikutnya"
        accessibilityHint="Menggeser daftar kartu ke bawah"
        accessibilityState={{ disabled: !canGoDown }}
        disabled={!canGoDown}
        onPress={handleDown}
        style={({ pressed }) => [
          styles.wideArrowButton,
          isTablet && styles.wideArrowButtonTablet,
          !canGoDown && styles.arrowDisabled,
          pressed && canGoDown && styles.pressed,
        ]}
      >
        <ArrowIcon direction="down" size={arrowIconSize} color={canGoDown ? '#111827' : '#9CA3AF'} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F4940',
    paddingVertical: 12,
  },
  containerTablet: {
    paddingVertical: 14,
  },
  wideArrowButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
  },
  wideArrowButtonTablet: {
    height: 56,
    borderRadius: 10,
  },
  arrowDisabled: {
    backgroundColor: '#4B5563',
    borderColor: '#374151',
    opacity: 0.45,
  },
  gridScrollView: {
    flex: 1,
    marginVertical: 8,
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 160,
  },
  cardTablet: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    minHeight: 180,
  },
  cardPressed: {
    opacity: 0.8,
    backgroundColor: '#E5E7EB',
    transform: [{ scale: 0.97 }],
  },
  cardText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
    textAlign: 'center',
  },
  cardTextTablet: {
    fontSize: 22,
    marginTop: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
