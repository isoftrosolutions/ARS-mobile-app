import React, { useCallback, useEffect, useState } from 'react';
import { Alert as RNAlert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
import PriceTag from '../../components/PriceTag';
import { colors, radius, shadows, typography } from '../../theme';
import { fetchWishlist, removeWishlist } from '../../api/wishlist';
import { useCart } from '../../context/CartContext';
import { extractError } from '../../api/client';

export default function WishlistScreen({ navigation }) {
  const { add: addCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWishlist();
      setItems(data);
    } catch (err) {
      RNAlert.alert('Could not load wishlist', extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRemove = async (wid) => {
    try {
      await removeWishlist(wid);
      setItems((prev) => prev.filter((i) => i.id !== wid));
    } catch (err) {
      RNAlert.alert('Could not remove', extractError(err));
    }
  };

  const onAddToCart = async (item) => {
    try {
      await addCart(item.product_id, 1);
      RNAlert.alert('Added to cart', item.product_name);
    } catch (err) {
      RNAlert.alert('Could not add', extractError(err));
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate('Shop', { screen: 'ProductDetail', params: { id: item.product_id, name: item.product_name } })}
      style={styles.card}
    >
      {item.product_image ? (
        <Image source={item.product_image} style={styles.img} contentFit="contain" />
      ) : (
        <View style={[styles.img, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }]}>
          <MaterialIcons name="image" size={32} color={colors.muted} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{item.product_name}</Text>
        <PriceTag price={item.price} discountPrice={item.discount_price} size="sm" accent />
        <View style={styles.actionRow}>
          <Button label="Add to cart" icon="shopping-cart" size="sm" onPress={() => onAddToCart(item)} />
          <Pressable onPress={() => onRemove(item.id)} hitSlop={6} style={styles.heart}>
            <MaterialIcons name="favorite" size={20} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      {loading ? (
        <View style={{ padding: 16 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} radius={radius.xl} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="favorite-border"
              title="Your wishlist is empty"
              message="Tap the heart on any product to save it for later."
              actionLabel="Browse products"
              onAction={() => navigation.navigate('Shop', { screen: 'ProductList' })}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  img: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  body: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { color: colors.ice, fontWeight: '700', fontSize: 13, marginBottom: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  heart: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
