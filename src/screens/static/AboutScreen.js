import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, radius, shadows, typography } from '../../theme';

const VALUES = [
  { icon: 'favorite', label: 'Integrity', desc: 'Honest business practices and transparent dealings with all stakeholders.', color: colors.primary },
  { icon: 'star', label: 'Quality', desc: 'Commitment to excellence in products, service, and customer experience.', color: colors.success },
  { icon: 'bolt', label: 'Innovation', desc: 'Continuously improving our platform and services to serve you better.', color: colors.info },
  { icon: 'groups', label: 'Community', desc: 'Building strong relationships and contributing to the local economy.', color: '#a855f7' },
];

const PILLARS = [
  { icon: 'target', label: 'Customer First', desc: 'Every decision we make is guided by our commitment to our customers.', color: colors.primary },
  { icon: 'verified', label: 'Authentic Products', desc: 'We carefully curate and verify all products to ensure authenticity and quality.', color: colors.success },
  { icon: 'local-shipping', label: 'Fast Delivery', desc: 'Quick and reliable delivery across Nepal with real-time tracking.', color: colors.info },
  { icon: 'headset-mic', label: '24/7 Support', desc: 'Round-the-clock customer support to assist you with any questions or concerns.', color: '#a855f7' },
];

export default function AboutScreen() {
  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <MaterialIcons name="shopping-bag" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { fontFamily: typography.fontFamilyDisplay }]}>About Easy Shopping A.R.S</Text>
          <Text style={styles.heroDesc}>
            Nepal's trusted online marketplace connecting quality products with discerning customers.
            We're committed to delivering exceptional shopping experiences with reliable service,
            authentic products, and unbeatable value.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.eyebrow}>Our Story</Text>
          <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyDisplay }]}>Mission & Vision</Text>
          <Text style={styles.paragraph}>
            To revolutionize online shopping in Nepal by providing a seamless, trustworthy, and enjoyable
            shopping experience that brings quality products closer to every home.
          </Text>
          <Text style={[styles.paragraph, { marginTop: 8 }]}>
            We believe that great shopping should be simple, secure, and satisfying. That's why we've built
            a platform that prioritizes customer satisfaction, product authenticity, and reliable service.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={styles.eyebrow}>What We Stand For</Text>
          <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyDisplay }]}>Core Values</Text>
          <View style={styles.grid}>
            {VALUES.map((v) => (
              <View key={v.label} style={styles.valueCard}>
                <View style={[styles.valueIcon, { backgroundColor: v.color + '18' }]}>
                  <MaterialIcons name={v.icon} size={22} color={v.color} />
                </View>
                <Text style={styles.valueLabel}>{v.label}</Text>
                <Text style={styles.valueDesc}>{v.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.eyebrow}>Our Approach</Text>
          <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyDisplay }]}>Key Pillars</Text>
          <View style={styles.pillarList}>
            {PILLARS.map((p) => (
              <View key={p.label} style={styles.pillarRow}>
                <View style={[styles.pillarIcon, { backgroundColor: p.color + '18' }]}>
                  <MaterialIcons name={p.icon} size={22} color={p.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pillarLabel}>{p.label}</Text>
                  <Text style={styles.pillarDesc}>{p.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primaryLight,
    padding: 32,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.md,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: colors.ice, textAlign: 'center', letterSpacing: -0.5 },
  heroDesc: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginTop: 12 },

  section: { padding: 20, paddingBottom: 28 },
  eyebrow: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: colors.ice, letterSpacing: -0.5, marginBottom: 12 },
  paragraph: { fontSize: 14, color: colors.muted, lineHeight: 22 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  valueCard: {
    width: '48%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  valueIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  valueLabel: { fontSize: 14, fontWeight: '700', color: colors.ice, marginBottom: 4 },
  valueDesc: { fontSize: 12, color: colors.muted, lineHeight: 17 },

  pillarList: { gap: 10 },
  pillarRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  pillarIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pillarLabel: { fontSize: 14, fontWeight: '700', color: colors.ice, marginBottom: 2 },
  pillarDesc: { fontSize: 12, color: colors.muted, lineHeight: 17 },
});
