import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../theme';

const TONES = {
  primary: { bg: colors.primaryLight, fg: colors.primary },
  gold: { bg: colors.goldLight, fg: colors.gold },
  success: { bg: colors.successLight, fg: colors.success },
  danger: { bg: colors.danger, fg: '#ffffff' },
  warning: { bg: colors.warningLight, fg: colors.warning },
  info: { bg: colors.infoLight, fg: colors.info },
  muted: { bg: colors.surfaceTint, fg: colors.muted },
};

export default function Badge({ label, tone = 'primary', solid = false, style, textStyle }) {
  const t = TONES[tone] || TONES.primary;
  const bg = solid ? t.fg : t.bg;
  const fg = solid ? '#ffffff' : t.fg;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg, fontFamily: typography.fontFamilyBody }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
