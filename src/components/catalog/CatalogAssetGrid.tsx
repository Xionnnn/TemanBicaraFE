import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { resolveAssetImage } from '../../catalog/images';
import { pageWithFixedSlots } from '../../catalog/paging';
import type { CatalogAsset } from '../../catalog/types';
import { ArrowIcon, PecsPlaceholder } from '../pecs/PecsIcons';
import { PencilButton } from './CatalogControls';

// 2x2 grid; the "Tambah kata" tile always takes the first slot.
const SLOTS = 4;

type Props = {
  assets: CatalogAsset[];
  onCreate: () => void;
  onEdit: (asset: CatalogAsset) => void;
};

export function CatalogAssetGrid({ assets, onCreate, onEdit }: Props) {
  const [requestedPage, setRequestedPage] = useState(0);
  const { items, page, totalPages } = pageWithFixedSlots(assets, requestedPage, SLOTS, 1);
  const canGoUp = page > 0;
  const canGoDown = page < totalPages - 1;

  const { width } = useWindowDimensions();
  const cardWidth = Math.floor((Math.min(width, 520) - 48) / 2);
  const imageSize = Math.min(115, Math.floor(cardWidth * 0.72));

  return (
    <View style={styles.container}>
      <PageArrow direction="up" label="Halaman gambar sebelumnya" enabled={canGoUp}
        onPress={() => setRequestedPage(page - 1)} />

      <View style={styles.grid}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tambah kata baru"
          onPress={onCreate}
          style={({ pressed }) => [styles.card, { width: cardWidth }, pressed && styles.pressed]}
        >
          <View style={[styles.imageBox, { width: imageSize, height: imageSize }]}>
            <Plus size={Math.round(imageSize * 0.7)} color="#111827" strokeWidth={2} accessible={false} />
          </View>
          <Text numberOfLines={1} style={styles.cardText}>Tambah kata</Text>
        </Pressable>

        {items.map((asset) => {
          const image = resolveAssetImage(asset);
          return (
            <View key={asset.id} style={{ width: cardWidth }}>
              <View accessible accessibilityLabel={`Kata ${asset.name}`} style={styles.card}>
                {image ? (
                  <Image source={image} resizeMode="contain" resizeMethod="resize" accessible={false}
                    style={{ width: imageSize, height: imageSize }} />
                ) : (
                  <PecsPlaceholder size={imageSize} lineColor="#1F2937" backgroundColor="#F3F4F6" />
                )}
                <Text numberOfLines={1} style={styles.cardText}>{asset.name}</Text>
              </View>
              <PencilButton label={`Ubah kata ${asset.name}`} onPress={() => onEdit(asset)} />
            </View>
          );
        })}

        {Array.from({ length: SLOTS - 1 - items.length }, (_, index) => (
          <View key={`empty-${index}`} style={{ width: cardWidth }} />
        ))}
      </View>

      {assets.length === 0 && (
        <Text style={styles.empty}>Kamus ini belum berisi gambar.</Text>
      )}

      <PageArrow direction="down" label="Halaman gambar berikutnya" enabled={canGoDown}
        onPress={() => setRequestedPage(page + 1)} />
    </View>
  );
}

function PageArrow({ direction, label, enabled, onPress }:
  { direction: 'up' | 'down'; label: string; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={({ pressed }) => [styles.arrow, !enabled && styles.arrowDisabled, pressed && styles.pressed]}
    >
      <ArrowIcon direction={direction} size={36} color={enabled ? '#111827' : '#9CA3AF'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    gap: 12,
  },
  grid: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: {
    minHeight: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
    textAlign: 'center',
  },
  empty: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  arrow: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    backgroundColor: '#4B5563',
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.75,
  },
});
