import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, typography } from '../theme';

const VARIANTS = {
  primary: {
    bg: colors.primary,
    bgPressed: colors.primaryHover,
    fg: '#ffffff',
    borderColor: 'transparent',
  },
  ghost: {
    bg: 'transparent',
    bgPressed: 'rgba(15,23,42,0.05)',
    fg: colors.ice,
    borderColor: 'rgba(15,23,42,0.18)',
  },
  dark: {
    bg: colors.ice,
    bgPressed: '#1e293b',
    fg: '#ffffff',
    borderColor: 'transparent',
  },
  danger: {
    bg: colors.danger,
    bgPressed: '#dc2626',
    fg: '#ffffff',
    borderColor: 'transparent',
  },
  outlineDanger: {
    bg: 'transparent',
    bgPressed: colors.dangerLight,
    fg: colors.danger,
    borderColor: colors.danger,
  },
};

const SIZES = {
  sm: { paddingV: 8, paddingH: 14, font: 13, iconSize: 16, height: 36 },
  md: { paddingV: 12, paddingH: 22, font: 14, iconSize: 18, height: 46 },
  lg: { paddingV: 14, paddingH: 28, font: 15, iconSize: 20, height: 52 },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  block = false,
  pill = false,
  style,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  const isGradient = variant === 'primary';

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isGradient ? undefined : (pressed ? v.bgPressed : v.bg),
          borderColor: v.borderColor,
          borderWidth: v.borderColor === 'transparent' ? 0 : 1,
          paddingVertical: s.paddingV,
          paddingHorizontal: s.paddingH,
          minHeight: s.height,
          borderRadius: pill ? 999 : radius.md,
          opacity: isDisabled ? 0.6 : 1,
          width: block ? '100%' : undefined,
          overflow: isGradient ? 'hidden' : undefined,
        },
        style,
      ]}
    >
      {isGradient ? (
        <LinearGradient colors={['#ea6c00', '#d97706']} style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={v.fg} size="small" />
        ) : (
          <>
            {icon ? <MaterialIcons name={icon} size={s.iconSize} color={v.fg} style={{ marginRight: 8 }} /> : null}
            <Text style={[styles.label, { color: v.fg, fontSize: s.font, fontFamily: typography.fontFamilyBody }]}>{label}</Text>
            {iconRight ? <MaterialIcons name={iconRight} size={s.iconSize} color={v.fg} style={{ marginLeft: 8 }} /> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '700', letterSpacing: 0.3 },
});
