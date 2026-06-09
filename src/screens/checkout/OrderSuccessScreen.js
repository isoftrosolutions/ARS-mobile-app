import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { colors, radius, shadows, typography } from '../../theme';
import { formatPrice } from '../../components/PriceTag';

export default function OrderSuccessScreen({ navigation, route }) {
  const { orderId, orderNumber, total } = route.params || {};

  return (
    <Screen background={colors.surfaceAlt} padded>
      <View style={styles.wrap}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="check-circle" size={88} color={colors.success} />
        </View>
        <Text style={[styles.title, { fontFamily: typography.fontFamilyDisplay }]}>Order placed!</Text>
        <Text style={styles.subtitle}>Thanks for shopping with Easy Shopping A.R.S. We'll be in touch soon.</Text>

        <View style={styles.card}>
          {orderNumber ? (
            <Row label="Order #" value={orderNumber} />
          ) : null}
          {orderId ? <Row label="Order ID" value={String(orderId)} /> : null}
          {total != null ? <Row label="Total" value={formatPrice(total)} highlight /> : null}
        </View>

        <Button
          label="View Order"
          icon="receipt-long"
          onPress={() => navigation.replace('OrderDetail', { id: orderId })}
          block
          style={{ marginTop: 16 }}
        />
        <Button
          label="Continue Shopping"
          variant="ghost"
          onPress={() => navigation.navigate('Shop', { screen: 'ProductList' })}
          block
          style={{ marginTop: 10 }}
        />
      </View>
    </Screen>
  );
}

function Row({ label, value, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && { color: colors.primary, fontSize: 18 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 32 },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.ice, marginBottom: 8, textAlign: 'center' },
  subtitle: { color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: 20, paddingHorizontal: 24 },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  rowLabel: { color: colors.muted, fontSize: 13 },
  rowValue: { color: colors.ice, fontWeight: '700', fontSize: 14 },
});
