import React, { useEffect, useState } from 'react';
import { Alert as RNAlert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import PriceTag, { formatPrice } from '../../components/PriceTag';
import { colors, radius, shadows, typography } from '../../theme';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { fetchAddresses } from '../../api/addresses';
import { fetchShippingSettings } from '../../api/settings';
import { placeOrder } from '../../api/orders';
import { extractError } from '../../api/client';

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: 'payments' },
  { value: 'eSewa', label: 'eSewa', desc: 'Pay with eSewa wallet', icon: 'account-balance-wallet' },
  { value: 'BankQR', label: 'Bank QR', desc: 'Scan bank QR to pay', icon: 'qr-code' },
];

export default function CheckoutScreen({ navigation }) {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [shipping, setShipping] = useState({ free_shipping_threshold: 5000, shipping_cost: 100 });
  const [addressId, setAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [addrs, ship] = await Promise.all([
          fetchAddresses().catch(() => []),
          fetchShippingSettings().catch(() => ({ free_shipping_threshold: 5000, shipping_cost: 100 })),
        ]);
        if (!alive) return;
        setAddresses(addrs);
        setShipping(ship);
        const def = addrs.find((a) => a.is_default) || addrs[0];
        if (def) setAddressId(def.id);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const freeShippingAt = Number(shipping.free_shipping_threshold || 0);
  const shippingCost = subtotal >= freeShippingAt ? 0 : Number(shipping.shipping_cost || 0);
  const grandTotal = subtotal + shippingCost;

  const onPlaceOrder = async () => {
    setError(null);
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (addresses.length > 0 && !addressId) {
      setError('Select a shipping address.');
      return;
    }
    if (addresses.length === 0) {
      setError('Add a shipping address before placing the order.');
      return;
    }
    setPlacing(true);
    try {
      const result = await placeOrder({
        items: items.map((i) => ({ product_id: i.product_id, quantity: Number(i.quantity) })),
        paymentMethod,
        addressId,
        notes: notes.trim() || undefined,
        couponCode: couponCode.trim() || undefined,
      });
      await clear();
      navigation.replace('OrderSuccess', {
        orderId: result?.order_id,
        orderNumber: result?.order_number,
        total: result?.total ?? grandTotal,
      });
    } catch (err) {
      setError(extractError(err, 'Could not place order'));
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <Screen padded background={colors.surfaceAlt}>
        <Skeleton height={120} style={{ marginBottom: 12 }} />
        <Skeleton height={180} style={{ marginBottom: 12 }} />
        <Skeleton height={200} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error ? <Alert tone="danger" message={error} /> : null}

        <Card>
          <SectionTitle>Shipping Address</SectionTitle>
          {addresses.length === 0 ? (
            <View style={{ alignItems: 'flex-start' }}>
              <Text style={styles.muted}>No saved addresses yet.</Text>
              <Button
                label="Add Address"
                icon="add"
                variant="primary"
                size="sm"
                onPress={() => navigation.navigate('AddressForm', { mode: 'create' })}
                style={{ marginTop: 10 }}
              />
            </View>
          ) : (
            <>
              {addresses.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => setAddressId(a.id)}
                  style={[styles.addrRow, addressId === a.id && styles.addrRowActive]}
                >
                  <View style={styles.radio}>
                    {addressId === a.id ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.addrTopRow}>
                      <Text style={styles.addrName}>{a.full_name}</Text>
                      {a.is_default ? <Badge label="Default" tone="success" /> : null}
                    </View>
                    <Text style={styles.addrLine}>{a.phone}</Text>
                    <Text style={styles.addrLine}>
                      {[a.street, `${a.municipality}-${a.ward}`, a.district, a.province].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                </Pressable>
              ))}
              <Button
                label="Add new address"
                icon="add"
                variant="ghost"
                size="sm"
                onPress={() => navigation.navigate('AddressForm', { mode: 'create' })}
                style={{ marginTop: 8 }}
              />
            </>
          )}
        </Card>

        <Card>
          <SectionTitle>Payment Method</SectionTitle>
          {PAYMENT_METHODS.map((m) => (
            <Pressable
              key={m.value}
              onPress={() => setPaymentMethod(m.value)}
              style={[styles.payRow, paymentMethod === m.value && styles.payRowActive]}
            >
              <View style={styles.radio}>
                {paymentMethod === m.value ? <View style={styles.radioDot} /> : null}
              </View>
              <MaterialIcons name={m.icon} size={22} color={colors.ice} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.payLabel}>{m.label}</Text>
                <Text style={styles.payDesc}>{m.desc}</Text>
              </View>
            </Pressable>
          ))}
        </Card>

        <Card>
          <SectionTitle>Order Notes (optional)</SectionTitle>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special delivery instructions"
            maxLength={1000}
            outlineColor={colors.borderSoft}
            activeOutlineColor={colors.primary}
            style={{ backgroundColor: colors.surface }}
          />
        </Card>

        <Card>
          <SectionTitle>Coupon Code (optional)</SectionTitle>
          <TextInput
            mode="outlined"
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Enter coupon code"
            maxLength={20}
            outlineColor={colors.borderSoft}
            activeOutlineColor={colors.primary}
            style={{ backgroundColor: colors.surface }}
          />
          <Text style={styles.couponHint}>Coupon is validated when you place the order.</Text>
        </Card>

        <Card>
          <SectionTitle>Order Summary</SectionTitle>
          {items.map((i) => (
            <View key={i.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>{i.product_name}</Text>
              <Text style={styles.itemQty}>×{i.quantity}</Text>
              <Text style={styles.itemPrice}>{formatPrice(
                (Number(i.discount_price && Number(i.discount_price) > 0 ? i.discount_price : i.price) || 0) *
                  Number(i.quantity),
              )}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Shipping</Text>
            <Text style={[styles.totalsValue, shippingCost === 0 && { color: colors.success }]}>
              {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
            </Text>
          </View>
          <View style={[styles.totalsRow, { marginTop: 8 }]}>
            <Text style={[styles.grandLabel, { fontFamily: typography.fontFamilyDisplay }]}>Total</Text>
            <Text style={[styles.grandValue, { fontFamily: typography.fontFamilyDisplay }]}>{formatPrice(grandTotal)}</Text>
          </View>
        </Card>

        <Button
          label={placing ? 'Placing order…' : `Place Order (${formatPrice(grandTotal)})`}
          icon="check-circle"
          variant="primary"
          loading={placing}
          onPress={onPlaceOrder}
          block
          style={{ marginTop: 8 }}
        />
        <Text style={styles.disclaimer}>By placing this order you agree to our terms & conditions.</Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Card({ children }) {
  return <View style={styles.card}>{children}</View>;
}

function SectionTitle({ children }) {
  return <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyDisplay }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ice, marginBottom: 12 },
  muted: { color: colors.muted, fontSize: 13 },

  addrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 8,
  },
  addrRowActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  addrTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  addrName: { color: colors.ice, fontWeight: '700', fontSize: 14 },
  addrLine: { color: colors.muted, fontSize: 12, marginTop: 2 },

  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 8,
  },
  payRowActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  payLabel: { color: colors.ice, fontWeight: '700', fontSize: 14 },
  payDesc: { color: colors.muted, fontSize: 12 },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },

  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  itemName: { flex: 1, color: colors.ice, fontSize: 13 },
  itemQty: { color: colors.muted, marginHorizontal: 8, fontSize: 13 },
  itemPrice: { color: colors.ice, fontWeight: '600', fontSize: 13 },

  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: 10 },

  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalsLabel: { color: colors.muted, fontSize: 13 },
  totalsValue: { color: colors.ice, fontWeight: '600', fontSize: 13 },
  grandLabel: { fontSize: 18, fontWeight: '900', color: colors.ice },
  grandValue: { fontSize: 20, fontWeight: '900', color: colors.ice },

  disclaimer: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 10 },

  couponHint: { color: colors.muted, fontSize: 11, marginTop: 6 },
});
