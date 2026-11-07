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

const PAGE_SIZE = 4;

export function PecsCardGrid({ cards, onSelectCard }: PecsCardGridProps) {
  const scrollViewRef = useRef<ElementRef<typeof ScrollView>>(null);
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

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
    if (canGoUp) setPage((prev) => Math.max(0, prev - 1));
  };

  const handleDown = () => {
    if (!canGoDown) return;
    const scrollStep = Math.max(160, containerHeight * 0.75);
    const maxScroll = Math.max(0, contentHeight - containerHeight);
    const targetY = Math.min(maxScroll, scrollY + scrollStep);
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
  };

  // Calculate dynamic card size based on screen width
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = Math.floor((screenWidth - 48) / 2);
  const placeholderSize = Math.min(115, Math.floor(cardWidth * 0.72));

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
        accessibilityLabel="Halaman kartu sebelumnya"
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

      {/* Scrollable 2-column Cards Grid */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        style={styles.gridScrollView}
        contentContainerStyle={styles.gridContent}
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
              { width: cardWidth },
              pressed && styles.cardPressed,
            ]}
          >
            <PecsPlaceholder
              size={placeholderSize}
              lineColor="#1F2937"
              backgroundColor="#F3F4F6"
            />
            <Text numberOfLines={1} style={styles.cardText}>
              {card.name}
            </Text>
          </Pressable>
        ))}
        {/* Invisible spacer to keep odd-numbered last card left-aligned */}
        {cards.length % 2 !== 0 && <View style={{ width: cardWidth }} />}
      </ScrollView>

      {/* Bottom Wide Down Arrow */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Halaman kartu berikutnya"
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
    justifyContent: 'space-between',
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
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
