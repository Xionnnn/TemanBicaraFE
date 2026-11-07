import { type ElementRef, useRef, useState } from 'react';
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
import type { PecsCategory } from './types';

type CategoryBarProps = {
  categories: PecsCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
};

export function CategoryBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryBarProps) {
  const scrollViewRef = useRef<ElementRef<typeof ScrollView>>(null);
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const arrowIconSize = isTablet ? 32 : 26;
  const placeholderSize = isTablet ? 54 : 46;

  const visibleEstimate =
    containerWidth > 0
      ? Math.floor(containerWidth / (isTablet ? 96 : 80))
      : isTablet
      ? 5
      : 3;

  const canGoLeft = scrollX > 4;
  const canGoRight =
    containerWidth > 0
      ? contentWidth > containerWidth + 4 && scrollX < contentWidth - containerWidth - 4
      : categories.length > visibleEstimate;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  };

  const handleContentSizeChange = (contentWidthParam: number) => {
    setContentWidth(contentWidthParam);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleLeft = () => {
    if (!canGoLeft) return;
    const scrollStep = Math.max(isTablet ? 120 : 90, containerWidth * 0.75);
    const targetX = Math.max(0, scrollX - scrollStep);
    scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleRight = () => {
    if (!canGoRight) return;
    const scrollStep = Math.max(isTablet ? 120 : 90, containerWidth * 0.75);
    const maxScroll = Math.max(0, contentWidth - containerWidth);
    const targetX = Math.min(maxScroll, scrollX + scrollStep);
    scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
  };

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      {/* Left Paging Arrow */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kamus sebelumnya"
        accessibilityHint="Menggeser daftar kategori ke kiri"
        accessibilityState={{ disabled: !canGoLeft }}
        disabled={!canGoLeft}
        onPress={handleLeft}
        style={({ pressed }) => [
          styles.arrowButton,
          isTablet && styles.arrowButtonTablet,
          !canGoLeft && styles.arrowDisabled,
          pressed && canGoLeft && styles.pressed,
        ]}
      >
        <ArrowIcon direction="left" size={arrowIconSize} color={canGoLeft ? '#111827' : '#9CA3AF'} />
      </Pressable>

      {/* Categories Horizontal ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        style={styles.categoriesScrollView}
        contentContainerStyle={[
          styles.categoriesContent,
          isTablet && styles.categoriesContentTablet,
        ]}
        accessibilityRole="tablist"
        accessibilityLabel="Daftar kategori kamus"
      >
        {categories.map((cat) => {
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
                isTablet && styles.categoryCardTablet,
                isSelected && styles.categorySelected,
                pressed && styles.pressed,
              ]}
            >
              <PecsPlaceholder
                size={placeholderSize}
                lineColor={isSelected ? '#111827' : '#6B7280'}
                backgroundColor={isSelected ? '#FFFFFF' : '#D1D5DB'}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.categoryLabel,
                  isTablet && styles.categoryLabelTablet,
                  isSelected && styles.categoryLabelSelected,
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Right Paging Arrow */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kamus berikutnya"
        accessibilityHint="Menggeser daftar kategori ke kanan"
        accessibilityState={{ disabled: !canGoRight }}
        disabled={!canGoRight}
        onPress={handleRight}
        style={({ pressed }) => [
          styles.arrowButton,
          isTablet && styles.arrowButtonTablet,
          !canGoRight && styles.arrowDisabled,
          pressed && canGoRight && styles.pressed,
        ]}
      >
        <ArrowIcon direction="right" size={arrowIconSize} color={canGoRight ? '#111827' : '#9CA3AF'} />
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
  containerTablet: {
    paddingVertical: 10,
    paddingHorizontal: 16,
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
  arrowButtonTablet: {
    width: 60,
    height: 80,
    borderRadius: 10,
  },
  arrowDisabled: {
    backgroundColor: '#4B5563',
    borderColor: '#374151',
    opacity: 0.5,
  },
  categoriesScrollView: {
    flex: 1,
    marginHorizontal: 6,
  },
  categoriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  categoriesContentTablet: {
    paddingHorizontal: 8,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minWidth: 72,
  },
  categoryCardTablet: {
    minWidth: 88,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  categoryLabelTablet: {
    fontSize: 14,
    marginTop: 6,
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
