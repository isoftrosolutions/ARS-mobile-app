import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, radius, shadows, typography } from '../../theme';

const ELIGIBILITY = [
  'Unused and in the same condition that you received it.',
  'In its original packaging with all tags and labels intact.',
  'Accompanied by the original receipt or proof of purchase.',
];

const NON_RETURNABLE = [
  'Personal Care Products (Undergarments, Swimwear, etc.)',
  'Consumable items (Food, Beverages)',
  'Customized or Personalized Items',
  'Software/Digital Goods',
];

export default function ReturnsScreen() {
  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { fontFamily: typography.fontFamilyDisplay }]}>Returns & Refunds</Text>
        <Text style={styles.pageDesc}>Simple, transparent policies for your peace of mind.</Text>

        <View style={styles.card}>
          <Section icon="undo" title="7-Day Easy Return" iconColor={colors.primary}>
            <Text style={styles.paragraph}>
              At Easy Shopping A.R.S, we want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within <Text style={{ fontWeight: '700' }}>7 days</Text> of delivery for a full refund or exchange.
            </Text>
          </Section>

          <View style={styles.divider} />

          <Section icon="check-circle" title="Eligibility Criteria" iconColor={colors.success}>
            <Text style={styles.paragraph}>To be eligible for a return, your item must be:</Text>
            {ELIGIBILITY.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <MaterialIcons name="check" size={18} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </Section>

          <View style={styles.divider} />

          <Section icon="cancel" title="Non-Returnable Items" iconColor={colors.danger}>
            <Text style={styles.paragraph}>Some items are not eligible for return due to hygiene and health safety reasons:</Text>
            {NON_RETURNABLE.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <MaterialIcons name="close" size={16} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
            <Text style={[styles.paragraph, { marginTop: 8, fontStyle: 'italic' }]}>*We only replace items if they are defective or damaged upon arrival.</Text>
          </Section>

          <View style={styles.divider} />

          <Section icon="account-balance-wallet" title="Refund Process" iconColor={colors.info}>
            <Text style={styles.paragraph}>Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed via your original payment method within 3-5 business days.</Text>
            <Text style={styles.paragraph}>For Cash on Delivery (COD) orders, we will issue a bank transfer or mobile wallet (eSewa) transfer.</Text>
          </Section>

          <View style={styles.divider} />

          <Section icon="info" title="How to Start a Return" iconColor={colors.primary}>
            <Text style={styles.paragraph}>To initiate a return, please contact our support team at support@easyshoppingars.com or call us at +977 9820210361 with your order ID and the reason for the return.</Text>
          </Section>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Section({ icon, title, iconColor, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: (iconColor || colors.primary) + '18' }]}>
          <MaterialIcons name={icon} size={20} color={iconColor || colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyBody }]}>{title}</Text>
      </View>
      {children}
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
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ice, flex: 1 },
  paragraph: { fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bulletText: { fontSize: 13, color: colors.text, lineHeight: 19, flex: 1 },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: 16 },
});
