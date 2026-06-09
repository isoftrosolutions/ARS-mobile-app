import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

export default function Skeleton({ height = 16, width = '100%', radius: r = radius.sm, style }) {
  return <View style={[styles.box, { height, width, borderRadius: r }, style]} />;
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surfaceTint },
});
