import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert as RNAlert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Searchbar, TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ProductCard from '../../components/ProductCard';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, typography } from '../../theme';
import { fetchCategories, fetchProducts, fetchFeaturedProducts, fetchNewArrivals } from '../../api/products';
import { addToCart } from '../../api/cart';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../api/client';

const SORTS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'popular', label: 'Most Popular' },
];

export default function ProductListScreen({ navigation, route }) {
  const { isAuthenticated } = useAuth();
  const initial = route?.params || {};
  const isSpecialFeed = initial.featured || initial.newArrivals || initial.deals;

  const [query, setQuery] = useState(initial.search || '');
  const [category, setCategory] = useState(initial.category || null);
  const [categoryName, setCategoryName] = useState(initial.categoryName || null);
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [clearFlag, setClearFlag] = useState(0);

  useEffect(() => {
    fetchCategories().then(setAllCategories).catch(() => setAllCategories([]));
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: initial.deals
        ? 'Special Deals'
        : initial.newArrivals
        ? 'New Arrivals'
        : initial.featured
        ? 'Featured'
        : categoryName
        ? categoryName
        : 'Shop',
    });
  }, [navigation, categoryName, initial.deals, initial.newArrivals, initial.featured]);

  const buildParams = useCallback(
    (p = 1) => {
      const params = { page: p, limit: 20, sort };
      if (query) params.search = query;
      if (category) params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      return params;
    },
    [query, category, sort, minPrice, maxPrice],
  );

  const load = useCallback(
    async (resetPage = true) => {
      if (resetPage) setLoading(true);
      try {
        if (initial.featured) {
          const data = await fetchFeaturedProducts();
          setProducts(data);
          setPagination(null);
          return;
        }
        if (initial.newArrivals) {
          const data = await fetchNewArrivals();
          setProducts(data);
          setPagination(null);
          return;
        }
        const result = await fetchProducts(buildParams(1));
        let data = result.data;
        if (initial.deals) data = data.filter((p) => p.discount_price && Number(p.discount_price) > 0);
        setProducts(data);
        setPagination(result.pagination);
        setPage(1);
      } catch (err) {
        RNAlert.alert('Could not load products', extractError(err));
      } finally {
        setLoading(false);
      }
    },
    [buildParams, initial.deals, initial.featured, initial.newArrivals],
  );

  useEffect(() => {
    load();
  }, [load]);

  const onLoadMore = async () => {
    if (loadingMore || isSpecialFeed) return;
    if (!pagination || page >= pagination.last_page) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const result = await fetchProducts(buildParams(next));
      setProducts((prev) => [...prev, ...result.data]);
      setPagination(result.pagination);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onSubmitSearch = () => load();

  const onClear = () => {
    setQuery('');
    setCategory(null);
    setCategoryName(null);
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setClearFlag((c) => c + 1);
  };

  useEffect(() => {
    if (clearFlag > 0) load();
  }, [clearFlag]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    RNAlert.alert('Sign in required', 'Please sign in to continue.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In', onPress: () => navigation.navigate('Account', { screen: 'Login' }) },
    ]);
    return false;
  };

  const handleAdd = async (product) => {
    if (!requireAuth()) return;
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      RNAlert.alert('Added to cart', `${product.name} added.`);
    } catch (err) {
      RNAlert.alert('Could not add', extractError(err));
    }
  };

  const headerCount = useMemo(() => {
    if (loading) return 'Loading…';
    if (pagination?.total) return `${pagination.total} Items Found`;
    return `${products.length} Items`;
  }, [loading, pagination, products.length]);

  return (
    <Screen padded={false} background={colors.background}>
      <View style={styles.toolbar}>
        <Searchbar
          placeholder="Search products"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSubmitSearch}
          maxLength={100}
          style={styles.searchbar}
          inputStyle={{ fontSize: 14 }}
          iconColor={colors.muted}
        />
        <View style={styles.subToolbar}>
          <Text style={styles.count}>{headerCount}</Text>
          <Pressable onPress={() => setFiltersVisible(true)} style={styles.filterBtn}>
            <MaterialIcons name="tune" size={16} color={colors.ice} />
            <Text style={styles.filterBtnText}>Filters</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 10, flexDirection: 'row', flexWrap: 'wrap' }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ width: '50%', padding: 6 }}>
              <Skeleton height={240} radius={radius.xl2} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 10 }}
          contentContainerStyle={{ paddingVertical: 6, paddingBottom: 24 }}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.gridCell}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { id: item.id, name: item.name })}
                onAddPress={() => handleAdd(item)}
              />
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          onEndReachedThreshold={0.4}
          onEndReached={onLoadMore}
          ListEmptyComponent={
            <EmptyState
              icon="sentiment-dissatisfied"
              title="No products found"
              message="Try clearing filters or searching for something else."
              actionLabel="Clear filters"
              onAction={onClear}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Skeleton height={20} width={120} />
              </View>
            ) : null
          }
        />
      )}

      <FiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        sort={sort}
        setSort={setSort}
        category={category}
        setCategory={(id, name) => {
          setCategory(id);
          setCategoryName(name);
        }}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        categories={allCategories}
        onApply={() => {
          setFiltersVisible(false);
          load();
        }}
        onClear={() => {
          onClear();
          setFiltersVisible(false);
        }}
      />
    </Screen>
  );
}

function FiltersSheet({
  visible,
  onClose,
  sort,
  setSort,
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  categories,
  onApply,
  onClear,
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={sheetStyles.backdrop}>
        <View style={[sheetStyles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={sheetStyles.handle} />
          <View style={sheetStyles.header}>
            <Text style={[sheetStyles.title, { fontFamily: typography.fontFamilyDisplay }]}>Filters & Sorting</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" size={24} color={colors.ice} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={sheetStyles.section}>Sort by</Text>
            {SORTS.map((s) => (
              <Pressable key={s.key} onPress={() => setSort(s.key)} style={sheetStyles.row}>
                <Text style={[sheetStyles.rowText, sort === s.key && { color: colors.primary, fontWeight: '700' }]}>{s.label}</Text>
                {sort === s.key ? <MaterialIcons name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}

            <Text style={sheetStyles.section}>Categories</Text>
            <Pressable onPress={() => setCategory(null, null)} style={sheetStyles.row}>
              <Text style={[sheetStyles.rowText, !category && { color: colors.primary, fontWeight: '700' }]}>All categories</Text>
              {!category ? <MaterialIcons name="check" size={18} color={colors.primary} /> : null}
            </Pressable>
            {categories.map((c) => (
              <Pressable key={c.id} onPress={() => setCategory(c.id, c.name)} style={sheetStyles.row}>
                <Text style={[sheetStyles.rowText, category === c.id && { color: colors.primary, fontWeight: '700' }]}>{c.name}</Text>
                {category === c.id ? <MaterialIcons name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}

            <Text style={sheetStyles.section}>Price range</Text>
            <View style={sheetStyles.priceRow}>
              <TextInput
                mode="outlined"
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="Min"
                keyboardType="numeric"
                maxLength={10}
                outlineColor={colors.borderSoft}
                activeOutlineColor={colors.primary}
                style={{ flex: 1, backgroundColor: colors.surface, marginRight: 8 }}
              />
              <TextInput
                mode="outlined"
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder="Max"
                keyboardType="numeric"
                maxLength={10}
                outlineColor={colors.borderSoft}
                activeOutlineColor={colors.primary}
                style={{ flex: 1, backgroundColor: colors.surface, marginLeft: 8 }}
              />
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          <View style={sheetStyles.footer}>
            <Button label="Clear" variant="ghost" onPress={onClear} block style={{ flex: 1, marginRight: 8 }} />
            <Button label="Apply" variant="primary" onPress={onApply} block style={{ flex: 1, marginLeft: 8 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  searchbar: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, elevation: 0 },
  subToolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  count: { color: colors.muted, fontSize: 13 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  filterBtnText: { marginLeft: 6, color: colors.ice, fontSize: 13, fontWeight: '600' },
  gridCell: { width: '50%', padding: 6 },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    ...shadows.lg,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 99, backgroundColor: colors.border, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 20, fontWeight: '900', color: colors.ice },
  section: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginTop: 14,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  rowText: { fontSize: 14, color: colors.ice },
  priceRow: { flexDirection: 'row', marginTop: 4 },
  footer: { flexDirection: 'row', paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.borderSoft, marginTop: 10 },
});
