import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme';

export function formatPrice(value) {
  const num = Number(value || 0);
  return 'Rs. ' + Math.round(num).toLocaleString('en-IN');
}

export default function PriceTag({ price, discountPrice, size = 'md', accent = false }) {
  const hasDiscount = discountPrice && Number(discountPrice) > 0 && Number(discountPrice) < Number(price);
  const sale = hasDiscount ? discountPrice : price;

  const sizes = {
    sm: { sale: 14, original: 11 },
    md: { sale: 18, original: 13 },
    lg: { sale: 24, original: 14 },
    xl: { sale: 32, original: 16 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.sale,
          {
            fontSize: s.sale,
            color: accent ? colors.primary : colors.text,
            fontFamily: typography.fontFamilyDisplay,
          },
        ]}
      >
        {formatPrice(sale)}
      </Text>
      {hasDiscount ? (
        <Text style={[styles.original, { fontSize: s.original, fontFamily: typography.fontFamilyBody }]}>
          {formatPrice(price)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  sale: { fontWeight: '800' },
  original: {
    color: colors.muted,
    marginLeft: 8,
    textDecorationLine: 'line-through',
  },
});
