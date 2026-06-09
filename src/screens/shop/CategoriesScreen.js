import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import CategoryTile from '../../components/CategoryTile';
import SectionHeader from '../../components/SectionHeader';
import Skeleton from '../../components/Skeleton';
import { colors, radius } from '../../theme';
import { fetchCategories } from '../../api/products';

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen padded background={colors.background}>
      <SectionHeader eyebrow="Discover" title="All Categories" subtitle="Tap to filter the shop" />
      {loading ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.cell}>
              <Skeleton height={86} radius={radius.xl2} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={categories}
          numColumns={3}
          columnWrapperStyle={{ marginHorizontal: -6 }}
          keyExtractor={(c) => String(c.id)}
          renderItem={({ item, index }) => (
            <View style={styles.cell}>
              <CategoryTile
                category={item}
                index={index}
                onPress={() => {
                  const params = { category: item.id, categoryName: item.name };
                  const inShopStack = navigation.getState?.()?.routes?.some?.((r) => r.name === 'ProductList');
                  if (inShopStack) {
                    navigation.navigate('ProductList', params);
                  } else {
                    navigation.navigate('Shop', { screen: 'ProductList', params });
                  }
                }}
              />
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>No categories yet.</Text>}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '33.333%', padding: 6 },
});
