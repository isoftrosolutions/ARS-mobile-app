import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, shadows, typography } from '../theme';
import Badge from './Badge';
import PriceTag from './PriceTag';

function discountPercent(price, discountPrice) {
  const p = Number(price);
  const d = Number(discountPrice);
  if (!p || !d || d >= p) return 0;
  return Math.round(((p - d) / p) * 100);
}

export default function ProductCard({ product, onPress, onAddPress, style }) {
  const pct = discountPercent(product.price, product.discount_price);
  const image = product.image_url || product.image;
  return (
    <Pressable onPress={onPress} style={[styles.card, style]}>
      <View style={styles.imgBox}>
        {pct > 0 ? <Badge label={`-${pct}%`} tone="danger" solid style={styles.discBadge} /> : null}
        {image ? (
          <Image source={image} style={styles.img} contentFit="contain" />
        ) : (
          <MaterialIcons name="image" size={48} color={colors.muted} style={{ opacity: 0.3 }} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={[styles.cat, { fontFamily: typography.fontFamilyBody }]} numberOfLines={1}>
          {product.category_name || product.cat_name || 'General'}
        </Text>
        <Text style={[styles.name, { fontFamily: typography.fontFamilyBody }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <PriceTag price={product.price} discountPrice={product.discount_price} size="md" />
          <Pressable onPress={onAddPress} style={styles.addBtn} hitSlop={6}>
            <MaterialIcons name="add" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
    overflow: 'hidden',
    ...shadows.sm,
  },
  imgBox: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '80%', height: '80%' },
  discBadge: { position: 'absolute', top: 10, left: 10, zIndex: 1 },
  body: { padding: 12 },
  cat: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    lineHeight: 17,
    minHeight: 34,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
