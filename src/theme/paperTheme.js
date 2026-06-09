import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';
import { radius } from './radius';

export const paperTheme = {
  ...MD3LightTheme,
  roundness: radius.lg / 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.textOnPrimary,
    primaryContainer: colors.primaryLight,
    onPrimaryContainer: colors.primary,
    secondary: colors.secondary,
    onSecondary: '#ffffff',
    background: colors.background,
    onBackground: colors.text,
    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: colors.surfaceAlt,
    onSurfaceVariant: colors.muted,
    outline: colors.border,
    outlineVariant: colors.borderSoft,
    error: colors.danger,
    onError: '#ffffff',
    errorContainer: colors.dangerLight,
    onErrorContainer: colors.danger,
  },
};
