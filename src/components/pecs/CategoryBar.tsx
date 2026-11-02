import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowIcon, PecsPlaceholder } from './PecsIcons';
import type { PecsCategory } from './types';

type CategoryBarProps = {
  categories: PecsCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
};

const VISIBLE_COUNT = 3;

export function CategoryBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryBarProps) {
  const [startIndex, setStartIndex] = useState(0);

  const canGoLeft = startIndex > 0;
  const canGoRight = startIndex + VISIBLE_COUNT < categories.length;

  const handleLeft = () => {
    if (canGoLeft) {
      setStartIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleRight = () => {
    if (canGoRight) {
      setStartIndex((prev) => Math.min(categories.length - VISIBLE_COUNT, prev + 1));
    }
  };

  const visibleCategories = categories.slice(startIndex, startIndex + VISIBLE_COUNT);

  return (
    <View style={styles.container}>
      {/* Left Paging Arrow */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kamus sebelumnya"
        accessibilityState={{ disabled: !canGoLeft }}
        disabled={!canGoLeft}
        onPress={handleLeft}
        style={({ pressed }) => [
          styles.arrowButton,
          !canGoLeft && styles.arrowDisabled,
          pressed && canGoLeft && styles.pressed,
        ]}
      >
        <ArrowIcon direction="left" size={26} color={canGoLeft ? '#111827' : '#9CA3AF'} />
      </Pressable>

      {/* Categories Row */}
      <View style={styles.categoriesRow}>
        {visibleCategories.map((cat) => {
          const isSelected = cat.id === selectedCategoryId;
          return (
            <Pressable
              key={cat.id}
              accessibilityRole="tab"
              accessibilityLabel={`Kamus ${cat.name}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectCategory(cat.id)}
              style={({ pressed }) => [
                styles.categoryCard,
                isSelected && styles.categorySelected,
                pressed && styles.pressed,
              ]}
            >
              <PecsPlaceholder
                size={46}
                lineColor={isSelected ? '#111827' : '#6B7280'}
                backgroundColor={isSelected ? '#FFFFFF' : '#D1D5DB'}
              />
              <Text
                numberOfLines={1}
                style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Right Paging Arrow */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kamus berikutnya"
        accessibilityState={{ disabled: !canGoRight }}
        disabled={!canGoRight}
        onPress={handleRight}
        style={({ pressed }) => [
          styles.arrowButton,
          !canGoRight && styles.arrowDisabled,
          pressed && canGoRight && styles.pressed,
        ]}
      >
        <ArrowIcon direction="right" size={26} color={canGoRight ? '#111827' : '#9CA3AF'} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  arrowButton: {
    width: 52,
    height: 72,
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
    opacity: 0.5,
  },
  categoriesRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    gap: 6,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minWidth: 70,
  },
  categorySelected: {
    backgroundColor: '#4B5563',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1D5DB',
    marginTop: 4,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
