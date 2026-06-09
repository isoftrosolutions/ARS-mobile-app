import React, { useEffect, useState } from 'react';
import {
  Alert as RNAlert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import QuantityStepper from '../../components/QuantityStepper';
import PriceTag, { formatPrice } from '../../components/PriceTag';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, typography } from '../../theme';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { fetchShippingSettings } from '../../api/settings';
import { extractError } from '../../api/client';

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items, loading, refresh, updateQuantity, remove, subtotal, count, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const [shipping, setShipping] = useState({ free_shipping_threshold: 5000, shipping_cost: 100 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchShippingSettings().then(setShipping).catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <Screen background={colors.background}>
        <EmptyState
          icon="shopping-cart"
          title="Sign in to view your cart"
          message="Your cart and saved items live in your account."
          actionLabel="Sign In"
          onAction={() => navigation.navigate('Account', { screen: 'Login' })}
        />
      </Screen>
    );
  }

  const freeShippingAt = Number(shipping.free_shipping_threshold || 0);
  const shippingCost = subtotal >= freeShippingAt || subtotal === 0 ? 0 : Number(shipping.shipping_cost || 0);
  const grandTotal = subtotal + shippingCost;

  const remaining = Math.max(0, freeShippingAt - subtotal);

  const handleRemove = (item) => {
    RNAlert.alert('Remove item?', `${item.product_name} will be removed from your cart.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(item.id);
          } catch (err) {
            RNAlert.alert('Could not remove', extractError(err));
          }
        },
      },
    ]);
  };

  const handleQty = async (item, qty) => {
    try {
      await updateQuantity(item, qty);
    } catch (err) {
      RNAlert.alert('Could not update', extractError(err));
    }
  };

  const renderItem = ({ item }) => {
    const max = Math.max(1, Number(item.stock || 99));
    return (
      <View style={styles.card}>
        {item.product_image ? (
          <Image source={item.product_image} style={styles.img} contentFit="contain" />
        ) : (
          <View style={[styles.img, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }]}>
            <MaterialIcons name="image" size={32} color={colors.muted} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.product_name}</Text>
          <PriceTag price={item.price} discountPrice={item.discount_price} size="sm" />
          <View style={styles.row}>
            <QuantityStepper value={Number(item.quantity)} onChange={(q) => handleQty(item, q)} min={1} max={max} />
            <Pressable onPress={() => handleRemove(item)} hitSlop={6} style={styles.trash}>
              <MaterialIcons name="delete-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        </View>
        <Text style={[styles.lineTotal, { fontFamily: typography.fontFamilyDisplay }]}>
          {formatPrice(
            (Number(item.discount_price && Number(item.discount_price) > 0 ? item.discount_price : item.price) || 0) *
              Number(item.quantity),
          )}
        </Text>
      </View>
    );
  };

  return (
    <Screen background={colors.surfaceAlt} padded={false}>
      {loading && items.length === 0 ? (
        <View style={{ padding: 16 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={110} radius={radius.xl} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 200 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            items.length > 0 ? (
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { fontFamily: typography.fontFamilyDisplay }]}>Shopping Cart</Text>
                <Pressable onPress={() => {
                  RNAlert.alert('Clear cart?', 'All items will be removed from your cart.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: () => clear() },
                  ]);
                }} hitSlop={6}>
                  <Text style={styles.clearLink}>Clear cart</Text>
                </Pressable>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="remove-shopping-cart"
              title="Your cart is empty"
              message="Add some products to get started!"
              actionLabel="Browse Products"
              onAction={() => navigation.navigate('Shop', { screen: 'ProductList' })}
            />
          }
        />
      )}

      {items.length > 0 ? (
        <View style={[styles.summary, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({count})</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, shippingCost === 0 && { color: colors.success }]}>
              {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
            </Text>
          </View>
          {remaining > 0 ? (
            <Text style={styles.freeShipHint}>
              Add {formatPrice(remaining)} more for FREE delivery!
            </Text>
          ) : null}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { fontFamily: typography.fontFamilyDisplay }]}>Total</Text>
            <Text style={[styles.totalValue, { fontFamily: typography.fontFamilyDisplay }]}>{formatPrice(grandTotal)}</Text>
          </View>
          <Button
            label="Proceed to Checkout"
            icon="credit-card"
            block
            onPress={() => navigation.navigate('Checkout')}
            style={{ marginTop: 12 }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: colors.ice },
  clearLink: { color: colors.danger, fontWeight: '600', fontSize: 13 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  img: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '700', color: colors.ice, fontSize: 14, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  trash: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineTotal: { color: colors.ice, fontWeight: '800', marginLeft: 8, fontSize: 14 },

  summary: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    ...shadows.lg,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { color: colors.muted, fontSize: 13 },
  summaryValue: { color: colors.ice, fontWeight: '600', fontSize: 13 },
  freeShipHint: { color: colors.success, fontSize: 12, marginTop: 2, marginBottom: 4 },
  totalRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSoft,
  },
  totalLabel: { fontSize: 18, fontWeight: '900', color: colors.ice },
  totalValue: { fontSize: 22, fontWeight: '900', color: colors.ice },
});
