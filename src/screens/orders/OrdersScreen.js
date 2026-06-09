import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, typography } from '../../theme';
import { fetchOrders } from '../../api/orders';
import { formatPrice } from '../../components/PriceTag';

function statusTone(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'delivered') return 'success';
  if (s === 'cancelled') return 'danger';
  if (s === 'return requested') return 'warning';
  if (s === 'shipped' || s === 'out for delivery') return 'info';
  return 'warning';
}

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const { data, pagination: p } = await fetchOrders({ page: pageNum, limit: 20 });
      setPagination(p);
      setOrders((prev) => (pageNum === 1 ? data : [...prev, ...data]));
      setPage(pageNum);
    } finally {
      if (pageNum === 1) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(1);
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (loadingMore || !pagination || page >= pagination.last_page) return;
    setLoadingMore(true);
    try {
      await load(page + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable onPress={() => navigation.navigate('OrderDetail', { id: item.id })} style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderNum}>{item.order_number || `Order #${item.id}`}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <Badge label={item.status} tone={statusTone(item.status)} />
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.thumbRow}>
          {(item.items_preview || []).slice(0, 3).map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={[styles.thumb, { marginLeft: idx === 0 ? 0 : -10, zIndex: 10 - idx }]} />
          ))}
          <Text style={styles.itemCount}>{item.item_count || 0} item{(item.item_count || 0) === 1 ? '' : 's'}</Text>
        </View>
        <Text style={[styles.total, { fontFamily: typography.fontFamilyDisplay }]}>{formatPrice(item.total ?? item.total_amount)}</Text>
        <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
      </View>
    </Pressable>
  );

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      {loading ? (
        <View style={{ padding: 16 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={110} radius={radius.xl} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => String(o.id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          onEndReachedThreshold={0.4}
          onEndReached={onLoadMore}
          ListEmptyComponent={
            <EmptyState
              icon="shopping-bag"
              title="No orders yet"
              message="When you place an order it'll show up here."
              actionLabel="Start Shopping"
              onAction={() => navigation.navigate('Shop', { screen: 'ProductList' })}
            />
          }
          ListFooterComponent={loadingMore ? <Skeleton height={20} width={120} style={{ alignSelf: 'center', marginTop: 12 }} /> : null}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderNum: { fontWeight: '800', color: colors.ice, fontSize: 14 },
  date: { color: colors.muted, fontSize: 12, marginTop: 2 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  thumbRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  thumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceTint, borderWidth: 2, borderColor: colors.surface },
  itemCount: { marginLeft: 8, color: colors.muted, fontSize: 13 },
  total: { fontSize: 16, fontWeight: '900', color: colors.ice, marginRight: 4 },
});
