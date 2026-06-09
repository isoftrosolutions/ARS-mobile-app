import React, { useState } from 'react';
import { Alert as RNAlert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { colors, radius, shadows, typography } from '../../theme';

const FAQ_CATEGORIES = [
  {
    title: 'Orders & Shopping',
    icon: 'shopping-cart',
    items: [
      { q: 'How do I place an order?', a: 'Browse our products, add items to your cart, and proceed to checkout. You can pay using eSewa, bank transfer, or cash on delivery.' },
      { q: 'What payment methods do you accept?', a: 'We accept eSewa payments, bank transfers, and cash on delivery (COD) for orders within Nepal.' },
      { q: 'How long does delivery take?', a: 'Delivery typically takes 3-5 business days within Nepal. You will receive tracking information once your order ships.' },
    ],
  },
  {
    title: 'Returns & Refunds',
    icon: 'autorenew',
    items: [
      { q: 'What is your return policy?', a: 'We offer returns within 7 days of delivery for unused items in original packaging. Contact our support team to initiate a return.' },
      { q: 'How do I return an item?', a: 'Contact our support team with your order ID and reason for return. We\'ll provide return instructions and arrange pickup if eligible.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 3-5 business days after we receive the returned item. Amount will be credited to your original payment method.' },
    ],
  },
  {
    title: 'Account & Login',
    icon: 'person',
    items: [
      { q: 'How do I create an account?', a: 'Tap "Create Account" on the login screen and fill out the registration form with your details.' },
      { q: 'I forgot my password. What should I do?', a: 'Tap "Forgot Password" on the login screen and enter your email address. We\'ll send you a reset link.' },
      { q: 'How do I update my account information?', a: 'Go to your profile page after logging in to update your personal information, address, and preferences.' },
    ],
  },
  {
    title: 'Shipping & Delivery',
    icon: 'local-shipping',
    items: [
      { q: 'Do you ship outside Nepal?', a: 'Currently, we only ship within Nepal, primarily to Birgunj, Parsa, and surrounding areas.' },
      { q: 'What are the shipping charges?', a: 'Free shipping on orders over Rs. 5,000. Orders under Rs. 5,000 have a flat shipping rate of Rs. 100.' },
      { q: 'Can I track my order?', a: 'Yes, you\'ll receive tracking information via email and SMS once your order is shipped.' },
    ],
  },
];

export default function SupportScreen({ navigation }) {
  const [expanded, setExpanded] = useState(null);

  const toggle = (idx) => setExpanded((prev) => (prev === idx ? null : idx));

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <SectionHeader title="How Can We Help You?" subtitle="Find answers to common questions" style={{ marginBottom: 8 }} />

        <View style={styles.quickActions}>
          <QuickAction icon="email" label="Email Support" onPress={() => navigation.navigate('Contact')} />
          <QuickAction icon="phone" label="Call Us" onPress={() => RNAlert.alert('Call Support', 'Call +977 9820210361 for assistance.')} />
        </View>

        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

        {FAQ_CATEGORIES.map((cat, ci) => {
          const open = expanded === ci;
          return (
            <View key={cat.title} style={styles.accordionItem}>
              <Pressable onPress={() => toggle(ci)} style={styles.accordionHeader}>
                <MaterialIcons name={cat.icon} size={20} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={[styles.accordionTitle, { fontFamily: typography.fontFamilyBody }]}>{cat.title}</Text>
                <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={20} color={colors.muted} />
              </Pressable>
              {open ? (
                <View style={styles.accordionBody}>
                  {cat.items.map((item, ii) => (
                    <View key={ii} style={ii < cat.items.length - 1 ? styles.faqRow : undefined}>
                      <Text style={[styles.faqQ, { fontFamily: typography.fontFamilyBody }]}>{item.q}</Text>
                      <Text style={styles.faqA}>{item.a}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}

        <View style={styles.contactCard}>
          <Text style={[styles.contactTitle, { fontFamily: typography.fontFamilyDisplay }]}>Still Need Help?</Text>
          <Text style={styles.contactDesc}>Can't find what you're looking for? Our support team is here to help.</Text>
          <View style={styles.contactActions}>
            <Pressable style={styles.contactBtn} onPress={() => navigation.navigate('Contact')}>
              <MaterialIcons name="email" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.contactBtnText}>Contact Us</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.businessHours}>
          <Text style={[styles.bhTitle, { fontFamily: typography.fontFamilyDisplay }]}>Business Hours</Text>
          <Row day="Sunday - Friday" time="9:00 AM - 6:00 PM" />
          <Row day="Saturday" time="10:00 AM - 4:00 PM" />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({ day, time }) {
  return (
    <View style={styles.bhRow}>
      <Text style={styles.bhDay}>{day}</Text>
      <Text style={[styles.bhTime, time === 'Closed' && { color: colors.danger }]}>{time}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.qa}>
      <View style={styles.qaIcon}>
        <MaterialIcons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.qaLabel, { fontFamily: typography.fontFamilyBody }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  qa: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  qaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qaLabel: { fontSize: 12, fontWeight: '600', color: colors.ice, textAlign: 'center' },

  faqTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ice,
    marginBottom: 14,
    textAlign: 'center',
  },

  accordionItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 10,
    overflow: 'hidden',
    ...shadows.sm,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  accordionTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.ice },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: 12 },
  faqRow: { marginBottom: 14 },
  faqQ: { fontSize: 13, fontWeight: '700', color: colors.ice, marginBottom: 4 },
  faqA: { fontSize: 13, color: colors.muted, lineHeight: 19 },

  contactCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginTop: 8,
    marginBottom: 14,
    ...shadows.sm,
  },
  contactTitle: { fontSize: 20, fontWeight: '800', color: colors.ice, marginBottom: 8 },
  contactDesc: { color: colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 16 },
  contactActions: { flexDirection: 'row', gap: 10 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ice,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.md,
  },
  contactBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  businessHours: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  bhTitle: { fontSize: 16, fontWeight: '800', color: colors.ice, marginBottom: 12 },
  bhRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  bhDay: { fontSize: 13, color: colors.ice, fontWeight: '500' },
  bhTime: { fontSize: 13, color: colors.muted },
});
