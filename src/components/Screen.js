import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function Screen({
  children,
  scroll = false,
  padded = true,
  background = colors.background,
  refreshControl,
  contentContainerStyle,
  style,
  edges = ['top', 'left', 'right'],
}) {
  const Inner = scroll ? ScrollView : View;
  const innerProps = scroll
    ? {
        contentContainerStyle: [padded && styles.padded, contentContainerStyle],
        showsVerticalScrollIndicator: false,
        refreshControl,
      }
    : { style: [{ flex: 1 }, padded && styles.padded] };

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: background }, style]}>
      <Inner {...innerProps}>{children}</Inner>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  padded: { padding: 16 },
});
