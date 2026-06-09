import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import { colors, radius, shadows, typography } from '../../theme';

const SECTIONS = [
  {
    title: '1. Introduction',
    content: 'Welcome to Easy Shopping A.R.S ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. By using our website, you agree to the collection and use of information in accordance with this policy.',
  },
  {
    title: '2. Information We Collect',
    subsections: [
      {
        heading: 'Personal Information',
        content: 'We may collect: name and contact information (phone number, email address), billing and shipping addresses, payment information (processed securely by third-party providers), account credentials, and order history and preferences.',
      },
      {
        heading: 'Automatically Collected Information',
        content: 'We automatically collect: IP address and location information, browser type and version, device information, pages visited and time spent on our site, and referral sources.',
      },
      {
        heading: 'Cookies and Tracking Technologies',
        content: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser.',
      },
    ],
  },
  {
    title: '3. How We Use Your Information',
    content: 'We use the collected information for: order processing and fulfillment, account management, customer service and support, sending order updates and promotional offers (with consent), website improvement and analytics, and legal compliance.',
  },
  {
    title: '4. Information Sharing and Disclosure',
    content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist our operations (payment processors, shipping companies), when required by law, or in connection with a business transfer.',
  },
  {
    title: '5. Data Security',
    content: 'We implement appropriate technical and organizational measures to protect your personal information including SSL/TLS encryption, secure data storage and access controls, regular security audits, and employee training on data protection.',
    highlight: 'While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.',
  },
  {
    title: '6. Your Rights',
    content: 'You have the right to: access a copy of your personal information, request correction of inaccurate information, request deletion of your personal information, request transfer of your data to another service, and unsubscribe from marketing communications.',
  },
  {
    title: '7. Cookies Policy',
    content: 'We use essential cookies for website functionality, analytics cookies to understand how you use our site, marketing cookies to show relevant advertisements, and preference cookies to remember your settings.',
  },
  {
    title: '8. Third-Party Links',
    content: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites.',
  },
  {
    title: '9. Children\'s Privacy',
    content: 'Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.',
  },
  {
    title: '10. Changes to This Privacy Policy',
    content: 'We may update this Privacy Policy from time to time. We encourage you to review this Privacy Policy periodically.',
  },
];

export default function PrivacyScreen() {
  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { fontFamily: typography.fontFamilyDisplay }]}>Privacy Policy</Text>
          <Text style={styles.heroDesc}>Your privacy is important to us. Learn how we collect, use, and protect your information.</Text>
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
              ) : (
                <Text style={styles.paragraph}>{sec.content}</Text>
              )}
              {sec.highlight ? (
                <View style={styles.highlight}>
                  <Text style={styles.highlightText}>{sec.highlight}</Text>
                </View>
              ) : null}
            </View>
          ))}

          <View style={styles.contactBox}>
            <Text style={styles.contactTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>If you have any questions about this Privacy Policy, please contact us:</Text>
            <Text style={styles.contactLine}>Email: easyshoppinga.r.s1@gmail.com</Text>
            <Text style={styles.contactLine}>Phone: +977 9820210361</Text>
            <Text style={styles.contactLine}>Address: Birgunj, Parsa, Nepal</Text>
          </View>
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
  highlight: {
    backgroundColor: colors.surfaceAlt,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 14,
    borderRadius: radius.sm,
    marginTop: 8,
  },
  highlightText: { fontSize: 13, color: colors.text, lineHeight: 19 },
  contactBox: {
    backgroundColor: colors.infoLight,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
  },
  contactTitle: { fontSize: 15, fontWeight: '700', color: colors.ice, marginBottom: 8 },
  contactLine: { fontSize: 13, color: colors.muted, lineHeight: 20 },
});
