import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import { colors, radius, shadows, typography } from '../../theme';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using Easy Shopping A.R.S ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service. These terms apply to all visitors, users, and others who access or use our services.',
  },
  {
    title: '2. Use License',
    content: 'Permission is granted to temporarily access the materials on Easy Shopping A.R.S for personal, non-commercial transitory viewing only. Under this license you may not: modify or copy the materials, use the materials for any commercial purpose, attempt to decompile or reverse engineer any software, or remove any copyright or proprietary notations.',
  },
  {
    title: '3. User Accounts',
    subsections: [
      { heading: 'Account Creation', content: 'To access certain features, you must create an account. You must provide accurate, complete, and current information during registration and keep your account information updated.' },
      { heading: 'Account Security', content: 'You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use.' },
      { heading: 'Account Termination', content: 'We reserve the right to terminate or suspend your account at our sole discretion, without prior notice, for conduct that violates these Terms.' },
    ],
  },
  {
    title: '4. Products and Services',
    subsections: [
      { heading: 'Product Information', content: 'We strive to provide accurate product descriptions, pricing, and availability information. However, we do not warrant that product descriptions are accurate, complete, or error-free.' },
      { heading: 'Pricing', content: 'All prices are subject to change without notice. We reserve the right to modify or discontinue products or services without notice at any time.' },
      { heading: 'Product Availability', content: 'We make reasonable efforts to display the availability of our products. However, we cannot guarantee that products will be available when you place an order.' },
    ],
  },
  {
    title: '5. Orders and Payment',
    subsections: [
      { heading: 'Order Acceptance', content: 'Your order is an offer to purchase. We reserve the right to accept or decline your order for any reason, including limitations on quantities or errors in product information.' },
      { heading: 'Payment', content: 'Payment must be made at the time of order placement. We accept eSewa, bank transfer, and cash on delivery. All payments are processed securely.' },
      { heading: 'Payment Security', content: 'We use industry-standard encryption to protect your payment information. We do not store your payment details on our servers.' },
    ],
  },
  {
    title: '6. Shipping and Delivery',
    content: 'We currently deliver to Birgunj, Parsa, and surrounding areas in Nepal. Delivery times vary depending on location and product availability. Shipping costs are calculated based on order value and delivery location. Free shipping is available on orders over specified thresholds.',
  },
  {
    title: '7. Returns and Refunds',
    content: 'We offer a return policy for most items within the specified period. Items must be in original condition and packaging. Refunds are processed within a few business days after we receive the returned item.',
  },
  {
    title: '8. User Conduct',
    content: 'You agree not to use our service for any unlawful purpose, to violate any regulations, to infringe upon intellectual property rights, to harass or abuse others, to submit false information, or to interfere with the security features of the service.',
  },
  {
    title: '9. Intellectual Property',
    content: 'The service and its original content, features, and functionality are and will remain the exclusive property of Easy Shopping A.R.S and its licensors. The service is protected by copyright, trademark, and other laws.',
  },
  {
    title: '10. Limitation of Liability',
    content: 'In no event shall Easy Shopping A.R.S be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed the amount paid by you for the products purchased.',
    important: true,
  },
  {
    title: '11. Disclaimer',
    content: 'The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, Easy Shopping A.R.S excludes all representations, warranties, conditions, and terms.',
  },
  {
    title: '12. Governing Law',
    content: 'These Terms shall be interpreted and governed by the laws of Nepal, without regard to its conflict of law provisions.',
  },
  {
    title: '13. Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. Your continued use of the service after such modifications constitutes acceptance of the updated terms.',
  },
  {
    title: '14. Contact Information',
    content: '',
    contact: true,
  },
];

export default function TermsScreen() {
  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { fontFamily: typography.fontFamilyDisplay }]}>Terms & Conditions</Text>
          <Text style={styles.heroDesc}>Please read these terms carefully before using Easy Shopping A.R.S</Text>
        </View>

        <View style={styles.content}>
          {SECTIONS.map((sec, i) => (
            <View key={i} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyBody }]}>{sec.title}</Text>
              {sec.subsections ? (
                sec.subsections.map((sub, j) => (
                  <View key={j}>
                    <Text style={styles.subheading}>{sub.heading}</Text>
                    <Text style={styles.paragraph}>{sub.content}</Text>
                  </View>
                ))
              ) : sec.contact ? (
                <View>
                  <Text style={styles.paragraph}>If you have any questions about these Terms & Conditions, please contact us:</Text>
                  <Text style={styles.paragraph}>Email: easyshoppinga.r.s1@gmail.com</Text>
                  <Text style={styles.paragraph}>Phone: +977 9820210361</Text>
                  <Text style={styles.paragraph}>Address: Birgunj, Parsa, Nepal</Text>
                </View>
              ) : (
                <Text style={styles.paragraph}>{sec.content}</Text>
              )}
              {sec.important ? (
                <View style={styles.importantBox}>
                  <Text style={styles.importantText}>{sec.content}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 28,
    paddingTop: 36,
    paddingBottom: 36,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: colors.ice, textAlign: 'center', letterSpacing: -0.5 },
  heroDesc: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  content: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginHorizontal: 16,
    padding: 20,
    ...shadows.sm,
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ice, marginBottom: 8 },
  subheading: { fontSize: 14, fontWeight: '600', color: colors.navy, marginTop: 12, marginBottom: 4 },
  paragraph: { fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 8 },
  importantBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: 14,
    borderRadius: radius.sm,
    marginTop: 8,
  },
  importantText: { fontSize: 13, color: colors.text, lineHeight: 19 },
});
