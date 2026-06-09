import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography } from '../theme';
import Button from './Button';

export default function EmptyState({ icon = 'inbox', title, message, actionLabel, onAction, style }) {
  return (
    <View style={[styles.wrap, style]}>
      <MaterialIcons name={icon} size={72} color={colors.muted} style={{ opacity: 0.3 }} />
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel ? (
        <Button label={actionLabel} onPress={onAction} variant="primary" pill style={{ marginTop: 16 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    color: colors.muted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});
