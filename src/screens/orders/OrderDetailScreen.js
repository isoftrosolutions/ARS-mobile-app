import React, { useCallback, useEffect, useState } from 'react';
import { Alert as RNAlert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, typography } from '../../theme';
import { fetchOrderDetail, cancelOrder, returnOrder } from '../../api/orders';
import { extractError } from '../../api/client';
import { formatPrice } from '../../components/PriceTag';

const STATUS_FLOW = [
  { key: 'Pending', label: 'Order Placed' },
  { key: 'Confirmed', label: 'Confirmed' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Out for Delivery', label: 'Out for Delivery' },
  { key: 'Delivered', label: 'Delivered' },
];

function timeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(dateString).toLocaleDateString();
}

function statusTone(s) {
  const v = String(s || '').toLowerCase();
  if (v === 'delivered') return 'success';
  if (v === 'cancelled') return 'danger';
  if (v === 'return requested') return 'warning';
  if (v === 'shipped' || v === 'out for delivery') return 'info';
  return 'warning';
}

function statusReached(currentStatus, key) {
  const order = STATUS_FLOW.map((s) => s.key.toLowerCase());
  const cur = order.indexOf(String(currentStatus || '').toLowerCase());
  const tgt = order.indexOf(key.toLowerCase());
  if (cur < 0 || tgt < 0) return false;
  return cur >= tgt;
}

export default function OrderDetailScreen({ navigation, route }) {
  const { id } = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchOrderDetail(id);
      setData(result);
      navigation.setOptions({ title: result?.order?.order_number || `Order #${id}` });
    } catch (err) {
      RNAlert.alert('Could not load order', extractError(err));
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) {
    return (
      <Screen padded background={colors.surfaceAlt}>
        <Skeleton height={140} style={{ marginBottom: 12 }} />
        <Skeleton height={120} style={{ marginBottom: 12 }} />
        <Skeleton height={220} />
      </Screen>
    );
  }

  const { order, items = [], status_history = [], address, payment } = data;
  const ds = String(order.status || '').toLowerCase();
  const cancellable = ['pending', 'confirmed', 'shipped'].includes(ds);
  const returnable = ds === 'delivered';

  const handleCancel = () => {
    RNAlert.alert('Cancel order?', 'This action cannot be undone.', [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await cancelOrder(order.id);
            await load();
          } catch (err) {
            RNAlert.alert('Could not cancel', extractError(err));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const handleReturn = () => {
    RNAlert.alert('Request return?', 'Our team will contact you to coordinate pickup.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Request',
        onPress: async () => {
          setBusy(true);
          try {
            await returnOrder(order.id);
            await load();
          } catch (err) {
            RNAlert.alert('Could not request return', extractError(err));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.orderNum, { fontFamily: typography.fontFamilyDisplay }]}>
                {order.order_number || `Order #${order.id}`}
              </Text>
              <Text style={styles.date}>Placed {timeAgo(order.created_at) ? `${timeAgo(order.created_at)}` : new Date(order.created_at).toLocaleDateString()}</Text>
            </View>
            <Badge label={order.status} tone={statusTone(order.status)} solid={statusTone(order.status) === 'danger'} />
          </View>

          <View style={styles.actionRow}>
            <Button
              label="Invoice"
              icon="receipt-long"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('Invoice', { id: order.id })}
            />
            {cancellable ? (
              <Button label="Cancel" icon="cancel" variant="outlineDanger" size="sm" onPress={handleCancel} loading={busy} style={{ marginLeft: 8 }} />
            ) : null}
            {returnable ? (
              <Button label="Return" icon="undo" variant="ghost" size="sm" onPress={handleReturn} loading={busy} style={{ marginLeft: 8 }} />
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <SectionTitle>Items</SectionTitle>
          {items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              {it.product_image ? (
                <Image source={it.product_image} style={styles.itemImg} contentFit="contain" />
              ) : (
                <View style={[styles.itemImg, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }]}>
                  <MaterialIcons name="image" size={20} color={colors.muted} />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.itemName} numberOfLines={2}>{it.product_name}</Text>
                <Text style={styles.itemSub}>Qty: {it.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>{formatPrice(Number(it.unit_price) * Number(it.quantity))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <SectionTitle>Tracking</SectionTitle>
          {ds === 'cancelled' ? (
            <TimelineStep label="Cancelled" reached danger />
          ) : (
            STATUS_FLOW.map((s, idx) => (
              <TimelineStep
                key={s.key}
                label={s.label}
                reached={statusReached(order.status, s.key)}
                last={idx === STATUS_FLOW.length - 1}
              />
            ))
          )}
        </View>

        {address ? (
          <View style={styles.card}>
            <SectionTitle>Delivery Address</SectionTitle>
            <Text style={styles.addrText}>{address.full || [address.street, address.municipality, address.district, address.province].filter(Boolean).join(', ')}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <SectionTitle>Payment & Totals</SectionTitle>
          <Row label="Method" value={payment?.method || order.payment_method} />
          <Row label="Status" value={payment?.status || order.payment_status} />
          {order.shipping_charge ? <Row label="Shipping" value={formatPrice(order.shipping_charge)} /> : null}
          {order.notes ? <Row label="Order Notes" value={order.notes} /> : null}
          {payment?.transaction_id ? <Row label="Transaction ID" value={payment.transaction_id} /> : null}
          <View style={[styles.row, { marginTop: 6 }]}>
            <Text style={[styles.rowLabel, { fontWeight: '800', color: colors.ice }]}>Total</Text>
            <Text style={[styles.rowValue, { fontFamily: typography.fontFamilyDisplay, fontSize: 18 }]}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        {status_history.length > 0 ? (
          <View style={styles.card}>
            <SectionTitle>Order Timeline</SectionTitle>
            {status_history.map((h) => (
              <View key={h.id} style={styles.histRow}>
                <MaterialIcons name="circle" size={8} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.histStatus}>{h.status}</Text>
                  {h.note ? <Text style={styles.histNote}>{h.note}</Text> : null}
                  <Text style={styles.histDate}>{timeAgo(h.created_at)}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ children }) {
  return <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyDisplay }]}>{children}</Text>;
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function TimelineStep({ label, reached, last, danger }) {
  return (
    <View style={tStyles.row}>
      <View style={[tStyles.dot, reached ? (danger ? tStyles.dotDanger : tStyles.dotActive) : tStyles.dotIdle]} />
      {!last ? <View style={[tStyles.line, reached && !danger ? tStyles.lineActive : null]} /> : null}
      <Text style={[tStyles.label, reached && !danger ? { color: colors.ice, fontWeight: '700' } : null, danger ? { color: colors.danger } : null]}>{label}</Text>
    </View>
  );
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
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  orderNum: { fontSize: 18, fontWeight: '900', color: colors.ice },
  date: { color: colors.muted, fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: 'row', marginTop: 14, flexWrap: 'wrap' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ice, marginBottom: 12 },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  itemImg: { width: 50, height: 50, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  itemName: { color: colors.ice, fontWeight: '600', fontSize: 13 },
  itemSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  itemTotal: { color: colors.ice, fontWeight: '700', marginLeft: 8 },

  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { color: colors.muted, fontSize: 13 },
  rowValue: { color: colors.ice, fontWeight: '600', fontSize: 13 },

  addrText: { color: colors.ice, lineHeight: 20 },

  histRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8 },
  histStatus: { color: colors.ice, fontWeight: '700' },
  histNote: { color: colors.muted, fontSize: 12, marginTop: 2 },
  histDate: { color: colors.muted, fontSize: 11, marginTop: 2 },
});

const tStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  dotActive: { backgroundColor: colors.primary },
  dotDanger: { backgroundColor: colors.danger },
  dotIdle: { backgroundColor: colors.surfaceTint, borderWidth: 1, borderColor: colors.border },
  line: { width: 2, height: 18, backgroundColor: colors.surfaceTint, position: 'absolute', left: 6, top: 16 },
  lineActive: { backgroundColor: colors.primary },
  label: { color: colors.muted, fontSize: 13 },
});
