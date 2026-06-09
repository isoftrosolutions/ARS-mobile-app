import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, typography } from '../theme';

const ICONS = {
  Electronics: 'memory',
  Fashion: 'checkroom',
  Home: 'home',
  Beauty: 'star',
  Sports: 'directions-bike',
  Books: 'menu-book',
  Toys: 'toys',
  Grocery: 'local-grocery-store',
};
const TINTS = ['#f97316', '#a855f7', '#3b82f6', '#ec4899', '#22c55e', '#f59e0b'];

export default function CategoryTile({ category, index = 0, onPress }) {
  const tint = TINTS[index % TINTS.length];
  const icon = ICONS[category.name] || 'category';

  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <View style={[styles.icoWrap, { backgroundColor: tint + '15' }]}>
        <MaterialIcons name={icon} size={22} color={tint} />
      </View>
      <Text style={[styles.name, { fontFamily: typography.fontFamilyBody }]} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.07)',
    borderRadius: radius.xl2,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  icoWrap: {
    width: 50,
    height: 50,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  name: { fontSize: 12, fontWeight: '600', color: colors.ice },
});
