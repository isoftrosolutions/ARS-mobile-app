import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';
import { colors, radius, shadows, typography } from '../../theme';
import { fetchInvoice } from '../../api/orders';
import { formatPrice } from '../../components/PriceTag';

export default function InvoiceScreen({ navigation, route }) {
  const { id } = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice(id)
      .then((d) => {
        setData(d);
        navigation.setOptions({ title: d?.order_number || `Invoice #${id}` });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id, navigation]);

  if (loading) {
    return (
      <Screen padded background={colors.surfaceAlt}>
        <Skeleton height={400} radius={radius.xl} />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen padded>
        <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 32 }}>Invoice unavailable.</Text>
      </Screen>
    );
  }

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={styles.card}>
          <Text style={[styles.brand, { fontFamily: typography.fontFamilyDisplay }]}>Easy Shopping A.R.S</Text>
          <Text style={styles.brandSub}>Birgunj, Parsa, Nepal</Text>

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.label}>Invoice #</Text>
              <Text style={styles.value}>{data.order_number}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{new Date(data.date).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.section}>Billed to</Text>
          <Text style={styles.value}>{data.customer?.name}</Text>
          <Text style={styles.muted}>{data.customer?.email}</Text>
          <Text style={styles.muted}>{data.customer?.phone}</Text>
          {data.shipping_address ? <Text style={styles.muted}>{data.shipping_address}</Text> : null}

          <View style={styles.divider} />

          <Text style={styles.section}>Items</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.colName, styles.tableHeaderText]}>Item</Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.tableHeaderText]}>Price</Text>
            <Text style={[styles.colTotal, styles.tableHeaderText]}>Total</Text>
          </View>
          {data.items?.map((it, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colName} numberOfLines={2}>{it.product_name}</Text>
              <Text style={styles.colQty}>{it.quantity}</Text>
              <Text style={styles.colPrice}>{formatPrice(it.unit_price)}</Text>
              <Text style={styles.colTotal}>{formatPrice(it.total)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <Row label="Subtotal" value={formatPrice(data.subtotal)} />
          <Row label="Shipping" value={data.shipping_charge ? formatPrice(data.shipping_charge) : 'Free'} />
          {data.discount ? <Row label="Discount" value={`- ${formatPrice(data.discount)}`} /> : null}
          <View style={[styles.totalRow]}>
            <Text style={[styles.totalLabel, { fontFamily: typography.fontFamilyDisplay }]}>Total</Text>
            <Text style={[styles.totalValue, { fontFamily: typography.fontFamilyDisplay }]}>{formatPrice(data.total)}</Text>
          </View>

          <View style={styles.divider} />

          <Row label="Payment Method" value={String(data.payment_method).toUpperCase()} />
          <Row label="Payment Status" value={data.payment_status} />
          <Row label="Delivery Status" value={data.delivery_status} />

          <Text style={styles.thanks}>Thank you for shopping with Easy Shopping A.R.S!</Text>
        </View>

        <Button label="Back to order" variant="ghost" onPress={() => navigation.goBack()} block style={{ marginTop: 14 }} />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  brand: { fontSize: 22, fontWeight: '900', color: colors.ice, textAlign: 'center' },
  brandSub: { color: colors.muted, textAlign: 'center', marginTop: 2, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  value: { color: colors.ice, fontWeight: '700', marginTop: 2 },
  muted: { color: colors.muted, fontSize: 13 },

  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: 14 },

  section: { color: colors.ice, fontWeight: '800', marginBottom: 6, fontSize: 14 },

  tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  tableHeaderText: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  colName: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right', fontWeight: '700' },

  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  totalLabel: { fontSize: 18, fontWeight: '900', color: colors.ice },
  totalValue: { fontSize: 20, fontWeight: '900', color: colors.ice },

  thanks: { textAlign: 'center', color: colors.muted, marginTop: 16, fontSize: 12 },
});
