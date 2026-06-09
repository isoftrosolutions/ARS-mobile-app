import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, typography } from '../theme';

const TONES = {
  success: { bg: colors.successLight, border: 'rgba(34,197,94,0.25)', fg: '#059669', icon: 'check-circle' },
  danger: { bg: colors.dangerLight, border: 'rgba(239,68,68,0.25)', fg: '#dc2626', icon: 'error' },
  warning: { bg: colors.warningLight, border: 'rgba(245,158,11,0.25)', fg: '#b45309', icon: 'warning' },
  info: { bg: colors.infoLight, border: 'rgba(59,130,246,0.25)', fg: '#2563eb', icon: 'info' },
};

export default function Alert({ tone = 'info', message, title, style }) {
  const t = TONES[tone] || TONES.info;
  if (!message && !title) return null;
  return (
    <View style={[styles.alert, { backgroundColor: t.bg, borderColor: t.border }, style]}>
      <MaterialIcons name={t.icon} size={20} color={t.fg} style={{ marginRight: 10, marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        {title ? <Text style={[styles.title, { color: t.fg, fontFamily: typography.fontFamilyBody }]}>{title}</Text> : null}
        {message ? (
          <Text style={[styles.message, { color: t.fg, fontFamily: typography.fontFamilyBody }]}>
            {Array.isArray(message) ? message.join('\n') : message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  title: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  message: { fontSize: 13, lineHeight: 18 },
});
