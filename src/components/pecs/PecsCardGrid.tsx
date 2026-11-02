import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowIcon, PecsPlaceholder } from './PecsIcons';
import type { PecsCard } from './types';

type PecsCardGridProps = {
  cards: PecsCard[];
  onSelectCard: (card: PecsCard) => void;
};

const PAGE_SIZE = 4;

export function PecsCardGrid({ cards, onSelectCard }: PecsCardGridProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(cards.length / PAGE_SIZE) || 1;
  const canGoUp = page > 0;
  const canGoDown = page < totalPages - 1;

  const handleUp = () => {
    if (canGoUp) setPage((prev) => Math.max(0, prev - 1));
  };

  const handleDown = () => {
    if (canGoDown) setPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const currentCards = cards.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Pad to 4 cards if fewer to keep 2x2 layout stable
  const paddedCards: (PecsCard | null)[] = [...currentCards];
  while (paddedCards.length < PAGE_SIZE) {
    paddedCards.push(null);
  }

  // Calculate dynamic card size based on screen width
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = Math.floor((screenWidth - 48) / 2);
  const placeholderSize = Math.min(115, Math.floor(cardWidth * 0.72));

  return (
    <View style={styles.container}>
      {/* Top Wide Up Arrow */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Halaman kartu sebelumnya"
        accessibilityState={{ disabled: !canGoUp }}
        disabled={!canGoUp}
        onPress={handleUp}
        style={({ pressed }) => [
          styles.wideArrowButton,
          !canGoUp && styles.arrowDisabled,
          pressed && canGoUp && styles.pressed,
        ]}
      >
        <ArrowIcon direction="up" size={36} color={canGoUp ? '#111827' : '#9CA3AF'} />
      </Pressable>

      {/* 2x2 Cards Grid */}
      <View style={styles.gridContainer}>
        {paddedCards.map((card, idx) => {
          if (!card) {
            return (
              <View
                key={`empty-${idx}`}
                style={[styles.card, styles.emptyCard, { width: cardWidth }]}
              />
            );
          }

          return (
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
          );
        })}
      </View>

      {/* Bottom Wide Down Arrow */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Halaman kartu berikutnya"
        accessibilityState={{ disabled: !canGoDown }}
        disabled={!canGoDown}
        onPress={handleDown}
        style={({ pressed }) => [
          styles.wideArrowButton,
          !canGoDown && styles.arrowDisabled,
          pressed && canGoDown && styles.pressed,
        ]}
      >
        <ArrowIcon direction="down" size={36} color={canGoDown ? '#111827' : '#9CA3AF'} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F4940',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
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
  arrowDisabled: {
    backgroundColor: '#4B5563',
    borderColor: '#374151',
    opacity: 0.45,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'center',
    gap: 16,
    paddingVertical: 8,
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
  emptyCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
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
  pressed: {
    opacity: 0.7,
  },
});
