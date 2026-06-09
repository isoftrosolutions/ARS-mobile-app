import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, typography } from '../theme';

export default function QuantityStepper({ value, onChange, min = 1, max = 99, style }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <View style={[styles.wrap, style]}>
      <Pressable onPress={dec} disabled={atMin} style={[styles.btn, atMin && styles.disabled]} hitSlop={6} accessibilityLabel="Decrease quantity" accessibilityRole="button">
        <MaterialIcons name="remove" size={18} color={colors.ice} />
      </Pressable>
      <Text style={[styles.value, { fontFamily: typography.fontFamilyBody }]} accessibilityRole="text">{value}</Text>
      <Pressable onPress={inc} disabled={atMax} style={[styles.btn, atMax && styles.disabled]} hitSlop={6} accessibilityLabel="Increase quantity" accessibilityRole="button">
        <MaterialIcons name="add" size={18} color={colors.ice} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    marginHorizontal: 14,
    fontWeight: '700',
    fontSize: 15,
    color: colors.ice,
    minWidth: 24,
    textAlign: 'center',
  },
  disabled: { opacity: 0.4 },
});
