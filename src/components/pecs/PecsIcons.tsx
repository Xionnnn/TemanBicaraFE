import { StyleSheet, View } from 'react-native';

/**
 * The wireframe's signature crossed-box image placeholder:
 * A square border with diagonal lines intersecting from corner to corner.
 */
export function PecsPlaceholder({
  size = 64,
  lineColor = '#4B5563',
  backgroundColor = '#E5E7EB',
}: {
  size?: number;
  lineColor?: string;
  backgroundColor?: string;
}) {
  const diagonal = Math.round(size * 1.414);

  return (
    <View
      style={[
        styles.placeholderContainer,
        {
          width: size,
          height: size,
          backgroundColor,
          borderColor: lineColor,
        },
      ]}
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
    >
      <View
        style={[
          styles.diagonalLine,
          {
            width: diagonal,
            backgroundColor: lineColor,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.diagonalLine,
          {
            width: diagonal,
            backgroundColor: lineColor,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
    </View>
  );
}

/**
 * House/Home icon for navigating back to the homepage
 */
export function HomeIcon({ color = '#111827', size = 32 }: { color?: string; size?: number }) {
  const roofHeight = Math.round(size * 0.4);
  const roofWidth = Math.round(size * 0.88);
  const wallWidth = Math.round(size * 0.7);
  const wallHeight = Math.round(size * 0.46);
  const doorWidth = Math.round(size * 0.26);
  const doorHeight = Math.round(size * 0.28);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
    >
      {/* Roof */}
      <View
        style={{
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: roofWidth / 2,
          borderRightWidth: roofWidth / 2,
          borderBottomWidth: roofHeight,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      {/* House Body with Door cutout */}
      <View
        style={{
          width: wallWidth,
          height: wallHeight,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }}
      >
        <View
          style={{
            width: doorWidth,
            height: doorHeight,
            backgroundColor: '#E5E7EB',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />
      </View>
    </View>
  );
}

/**
 * Three-line hamburger icon matching the top-left button in wireframe
 */
export function HamburgerIcon({ color = '#111827', size = 32 }: { color?: string; size?: number }) {
  const barHeight = Math.max(4, Math.round(size * 0.12));
  const gap = Math.max(4, Math.round(size * 0.14));

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', gap }}>
      <View style={{ height: barHeight, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ height: barHeight, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ height: barHeight, backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

/**
 * Solid black trash can icon matching top-right wireframe button
 */
export function TrashIcon({ color = '#111827', size = 32 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Top Handle */}
      <View
        style={{
          width: size * 0.35,
          height: size * 0.12,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          backgroundColor: color,
        }}
      />
      {/* Lid */}
      <View
        style={{
          width: size * 0.8,
          height: size * 0.12,
          borderRadius: 2,
          backgroundColor: color,
          marginBottom: 2,
        }}
      />
      {/* Can Body */}
      <View
        style={{
          width: size * 0.6,
          height: size * 0.55,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/**
 * Solid speaker icon matching the far top-right wireframe button
 */
export function SpeakerIcon({ color = '#111827', size = 32 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Speaker box */}
      <View
        style={{
          width: size * 0.25,
          height: size * 0.36,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      {/* Speaker cone polygon simulation */}
      <View
        style={{
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: size * 0.3,
          borderTopWidth: size * 0.28,
          borderBottomWidth: size * 0.28,
          borderLeftColor: color,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
        }}
      />
      {/* Sound waves */}
      <View style={{ marginLeft: 3, gap: 3, alignItems: 'center' }}>
        <View style={{ width: 3, height: size * 0.22, backgroundColor: color, borderRadius: 2 }} />
        <View style={{ width: 3, height: size * 0.44, backgroundColor: color, borderRadius: 2 }} />
        <View style={{ width: 3, height: size * 0.22, backgroundColor: color, borderRadius: 2 }} />
      </View>
    </View>
  );
}

/**
 * Directional Arrow Icons: up, down, left, right
 */
export function ArrowIcon({
  direction,
  color = '#111827',
  size = 32,
}: {
  direction: 'up' | 'down' | 'left' | 'right';
  color?: string;
  size?: number;
}) {
  const rotation =
    direction === 'up'
      ? '0deg'
      : direction === 'down'
      ? '180deg'
      : direction === 'left'
      ? '270deg'
      : '90deg';

  const stemWidth = Math.max(4, Math.round(size * 0.14));
  const headSize = Math.round(size * 0.42);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: rotation }],
      }}
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
    >
      {/* Arrow Chevron Head */}
      <View
        style={{
          width: headSize,
          height: headSize,
          borderLeftWidth: stemWidth,
          borderTopWidth: stemWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
          top: size * 0.18,
        }}
      />
      {/* Arrow Shaft */}
      <View
        style={{
          width: stemWidth,
          height: size * 0.55,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.12,
          borderRadius: stemWidth / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    borderWidth: 1.5,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  diagonalLine: {
    height: 1.5,
    position: 'absolute',
  },
});
