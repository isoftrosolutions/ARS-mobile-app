const displayWeights = {
  '400': 'Fraunces_400Regular',
  '700': 'Fraunces_700Bold',
  '800': 'Fraunces_800ExtraBold',
  '900': 'Fraunces_900Black',
};

const bodyWeights = {
  '400': 'DMSans_400Regular',
  '500': 'DMSans_500Medium',
  '600': 'DMSans_600SemiBold',
  '700': 'DMSans_700Bold',
};

export const typography = {
  fontFamilyDisplay: displayWeights['800'],
  fontFamilyBody: bodyWeights['400'],

  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xl2: 24,
    xl3: 30,
    xl4: 36,
    xl5: 48,
  },

  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  display: (size = 30, weight = '800') => ({
    fontFamily: displayWeights[weight] || displayWeights['800'],
    fontSize: size,
    letterSpacing: -0.5,
  }),

  body: (size = 14, weight = '400') => ({
    fontFamily: bodyWeights[weight] || bodyWeights['400'],
    fontSize: size,
  }),

  eyebrow: {
    fontFamily: bodyWeights['700'],
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
};
