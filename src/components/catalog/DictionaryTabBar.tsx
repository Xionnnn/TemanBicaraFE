import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { pageWithFixedSlots } from '../../catalog/paging';
import type { CatalogDictionary } from '../../catalog/types';
import { ArrowIcon, PecsPlaceholder } from '../pecs/PecsIcons';
import { PencilButton } from './CatalogControls';

// The "Buat kamus" tile always takes the first slot.
const SLOTS = 3;

type Props = {
  dictionaries: CatalogDictionary[];
  selectedId: string | null;
  onSelect: (dictionary: CatalogDictionary) => void;
  onCreate: () => void;
  onEdit: (dictionary: CatalogDictionary) => void;
};

export function DictionaryTabBar({ dictionaries, selectedId, onSelect, onCreate, onEdit }: Props) {
  const [requestedPage, setRequestedPage] = useState(0);
  const { items, page, totalPages } = pageWithFixedSlots(dictionaries, requestedPage, SLOTS, 1);
  const canGoLeft = page > 0;
  const canGoRight = page < totalPages - 1;

  return (
    <View style={styles.bar}>
      <PageArrow direction="left" label="Kamus sebelumnya" enabled={canGoLeft}
        onPress={() => setRequestedPage(page - 1)} />

      <View style={styles.row} accessibilityRole="tablist">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buat kamus baru"
          onPress={onCreate}
          style={({ pressed }) => [styles.tab, styles.createTab, pressed && styles.pressed]}
        >
          <Plus size={34} color="#111827" strokeWidth={2.5} accessible={false} />
          <Text numberOfLines={1} style={styles.createLabel}>Buat kamus</Text>
        </Pressable>

        {items.map((dictionary) => {
          const selected = dictionary.id === selectedId;
          return (
            <View key={dictionary.id} style={styles.slot}>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={`Kamus ${dictionary.name}`}
                accessibilityState={{ selected }}
                onPress={() => onSelect(dictionary)}
                style={({ pressed }) => [styles.tab, selected && styles.tabSelected, pressed && styles.pressed]}
              >
                <View style={[styles.swatch, { backgroundColor: dictionary.color }]}>
                  <PecsPlaceholder size={36} lineColor="#374151" backgroundColor="transparent" />
                </View>
                <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>
                  {dictionary.name}
                </Text>
              </Pressable>
              <PencilButton label={`Ubah kamus ${dictionary.name}`} onPress={() => onEdit(dictionary)} />
            </View>
          );
        })}

        {Array.from({ length: SLOTS - 1 - items.length }, (_, index) => (
          <View key={`empty-${index}`} style={styles.slot} />
        ))}
      </View>

      <PageArrow direction="right" label="Kamus berikutnya" enabled={canGoRight}
        onPress={() => setRequestedPage(page + 1)} />
    </View>
  );
}

function PageArrow({ direction, label, enabled, onPress }:
  { direction: 'left' | 'right'; label: string; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={({ pressed }) => [styles.arrow, !enabled && styles.arrowDisabled, pressed && styles.pressed]}
    >
      <ArrowIcon direction={direction} size={26} color={enabled ? '#111827' : '#9CA3AF'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  slot: {
    flex: 1,
  },
  tab: {
    flex: 1,
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  createTab: {
    backgroundColor: '#FFFFFF',
  },
  tabSelected: {
    backgroundColor: '#F9FAFB',
    borderColor: '#FFFFFF',
  },
  swatch: {
    width: 48,
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  labelSelected: {
    color: '#111827',
    fontWeight: '800',
  },
  arrow: {
    width: 44,
    minHeight: 84,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    backgroundColor: '#4B5563',
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.75,
  },
});
