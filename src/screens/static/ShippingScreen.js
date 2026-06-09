import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, radius, shadows, typography } from '../../theme';

export default function ShippingScreen() {
  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { fontFamily: typography.fontFamilyDisplay }]}>Shipping & Delivery</Text>
        <Text style={styles.pageDesc}>Everything you need to know about how we get your orders to you.</Text>

        <View style={styles.card}>
          <Section icon="local-shipping" title="Delivery Timelines">
            <Text style={styles.paragraph}>We strive to deliver your orders as quickly as possible. Our standard delivery timelines are:</Text>
            <Row label="Inside Birgunj" value="24 - 48 Hours" />
            <Row label="Major Cities (Kathmandu, Pokhara, etc.)" value="2 - 4 Business Days" />
            <Row label="Remote Areas" value="5 - 7 Business Days" />
          </Section>

          <View style={styles.divider} />

          <Section icon="payments" title="Shipping Charges">
            <Text style={styles.paragraph}>Our shipping rates are flat and affordable:</Text>
            <Row label="Local Delivery (Birgunj)" value="Rs. 50" />
            <Row label="Outside Birgunj" value="Rs. 150" />
            <View style={[styles.row, { backgroundColor: colors.successLight, borderRadius: radius.md, padding: 10 }]}>
              <Text style={[styles.rowLabel, { color: colors.success, fontWeight: '700' }]}>Orders above Rs. 5000</Text>
              <Text style={[styles.rowValue, { color: colors.success, fontWeight: '700' }]}>FREE</Text>
            </View>
          </Section>

          <View style={styles.divider} />

          <Section icon="my-location" title="Order Tracking">
            <Text style={styles.paragraph}>Once your order is shipped, you will receive a notification with a tracking ID. You can track your order status directly from your "My Orders" page in your account dashboard.</Text>
          </Section>

          <View style={styles.divider} />

          <Section icon="info" title="Delivery Policy">
            <Text style={styles.paragraph}>Please ensure someone is available to receive the package at the provided address. If our delivery partner is unable to reach you after three attempts, the order will be returned to our warehouse.</Text>
            <Text style={[styles.paragraph, { marginTop: 8 }]}>For any urgent queries regarding your delivery, please call us at +977 9820210361.</Text>
          </Section>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Section({ icon, title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon} size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyBody }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 24, fontWeight: '900', color: colors.ice, textAlign: 'center', letterSpacing: -0.5 },
  pageDesc: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  section: { marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ice },
  paragraph: { fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  rowLabel: { fontSize: 13, color: colors.text, flex: 1 },
  rowValue: { fontSize: 13, fontWeight: '700', color: colors.ice },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: 16 },
});
