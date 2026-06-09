import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

export default function SectionHeader({ eyebrow, title, subtitle, actionLabel, onAction, style }) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={[styles.eyebrow, { fontFamily: typography.fontFamilyBody }]}>{eyebrow}</Text> : null}
        {title ? (
          <Text style={[styles.title, { fontFamily: typography.fontFamilyDisplay }]}>{title}</Text>
        ) : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} style={styles.action}>
          <Text style={[styles.actionText, { fontFamily: typography.fontFamilyBody }]}>{actionLabel}</Text>
          <MaterialIcons name="arrow-forward" size={16} color={colors.ice} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.ice,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 13,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.18)',
  },
  actionText: { color: colors.ice, fontSize: 13, fontWeight: '600', marginRight: 6 },
});
