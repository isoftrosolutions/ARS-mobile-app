import { Platform } from 'react-native';

const shadow = (offsetY, blur, opacity, elevation) =>
  Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation },
    default: {},
  });

export const shadows = {
  none: {},
  sm: shadow(1, 2, 0.05, 1),
  md: shadow(4, 6, 0.07, 3),
  lg: shadow(10, 15, 0.10, 6),
  card: shadow(8, 32, 0.10, 8),
  hover: shadow(20, 60, 0.12, 14),
};
