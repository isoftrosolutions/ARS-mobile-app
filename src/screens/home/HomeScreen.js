import React, { useCallback, useEffect, useState } from 'react';
import { Alert as RNAlert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import ProductCard from '../../components/ProductCard';
import CategoryTile from '../../components/CategoryTile';
import SectionHeader from '../../components/SectionHeader';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { fetchCategories, fetchFeaturedProducts, fetchNewArrivals } from '../../api/products';
import { addToCart } from '../../api/cart';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../api/client';

const chunk = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
};

const FEATURES = [
  { icon: 'local-shipping', tint: '#3b82f6', title: 'Free Shipping', sub: 'Orders over Rs. 1,000' },
  { icon: 'shield', tint: '#22c55e', title: 'Secure Payment', sub: '100% Protected' },
  { icon: 'autorenew', tint: '#ea6c00', title: 'Easy Returns', sub: '5-Day Replacement' },
  { icon: 'headset-mic', tint: '#a855f7', title: '24/7 Support', sub: 'Expert Help' },
];

export default function HomeScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cats, feat, fresh] = await Promise.all([
        fetchCategories().catch(() => []),
        fetchFeaturedProducts().catch(() => []),
        fetchNewArrivals().catch(() => []),
      ]);
      setCategories(cats || []);
      setFeatured(feat || []);
      setNewArrivals(fresh || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openProductList = (params) => {
    navigation.navigate('Shop', { screen: 'ProductList', params });
  };

  const openProduct = (product) => {
    navigation.navigate('Shop', {
      screen: 'ProductDetail',
      params: { id: product.id, name: product.name },
    });
  };

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

  const renderHero = () => (
    <View style={styles.hero}>
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={[styles.liveText, { fontFamily: typography.fontFamilyBody }]}>Nepal's #1 Online Store</Text>
      </View>
      <View style={styles.outlineWrap}>
        <Text style={[styles.heroH1OutlineBg, { fontFamily: typography.fontFamilyDisplay }]}>Shop</Text>
        <Text style={[styles.heroH1Outline, { fontFamily: typography.fontFamilyDisplay }]}>Shop</Text>
      </View>
      <Text style={[styles.heroH1Grad, { fontFamily: typography.fontFamilyDisplay }]}>Beyond</Text>
      <Text style={[styles.heroH1Solid, { fontFamily: typography.fontFamilyDisplay }]}>Limits.</Text>
      <Text style={styles.heroDesc}>
        Your destination for curated products delivered across Nepal — Birgunj, Parsa and beyond. eSewa & COD accepted.
      </Text>
      <View style={styles.heroCtas}>
        <Button label="Explore Shop" iconRight="arrow-forward" onPress={() => openProductList({})} />
        <Button label="View Deals" variant="ghost" onPress={() => openProductList({ deals: true })} style={{ marginLeft: 10 }} />
      </View>
      <View style={styles.statsRow}>
        <Stat value="500+" label="Products" />
        <View style={styles.statsSep} />
        <Stat value="10K+" label="Customers" />
        <View style={styles.statsSep} />
        <Stat value="24/7" label="Support" />
      </View>
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.features}>
      {FEATURES.map((f) => (
        <View key={f.title} style={styles.featCell}>
          <View style={[styles.featIco, { backgroundColor: f.tint + '15' }]}>
            <MaterialIcons name={f.icon} size={18} color={f.tint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featTitle} numberOfLines={1}>{f.title}</Text>
            <Text style={styles.featSub} numberOfLines={1}>{f.sub}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <SectionHeader
        eyebrow="Discover"
        title="Shop by Category"
        subtitle="Every need, one place"
        actionLabel="All"
        onAction={() => openProductList({})}
      />
      {loading ? (
        <View style={styles.catGrid}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.catCell}>
              <Skeleton height={86} radius={radius.xl2} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.catGrid}>
          {categories.slice(0, 8).map((cat, index) => (
            <View key={cat.id} style={styles.catCell}>
              <CategoryTile category={cat} index={index} onPress={() => openProductList({ category: cat.id, categoryName: cat.name })} />
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderProductRow = (title, eyebrow, items, params) => {
    if (!loading && items.length === 0) return null;
    const rows = items.slice(0, 6);
    return (
      <View style={styles.section}>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          actionLabel="All"
          onAction={() => openProductList(params)}
        />
        {loading ? (
          <View style={styles.productGrid}>
            {[0, 1].map((r) => (
              <View key={r} style={styles.productCell}><Skeleton height={220} radius={radius.xl2} /></View>
            ))}
          </View>
        ) : (
          <View style={styles.productGrid}>
            {chunk(rows, 2).map((pair, ri) => (
              <View key={`row-${ri}`} style={styles.productRow}>
                {pair.map((p) => (
                  <View key={p.id} style={[styles.productCell, pair.length === 1 && { flex: 1 }]}>
                    <ProductCard product={p} onPress={() => openProduct(p)} onAddPress={() => handleAdd(p)} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCta = () => (
    <View style={styles.ctaCard}>
      <Text style={[styles.ctaTitle, { fontFamily: typography.fontFamilyDisplay }]}>
        Experience <Text style={{ color: colors.primary }}>Premium</Text> Shopping in Nepal.
      </Text>
      <Text style={styles.ctaSub}>Join 10,000+ satisfied customers. Exclusive deals, fast delivery, 24/7 support.</Text>
      {!isAuthenticated ? (
        <Button
          label="Create Account"
          icon="person-add"
          onPress={() => navigation.navigate('Account', { screen: 'Register' })}
          style={{ marginTop: 14 }}
        />
      ) : null}
    </View>
  );

  return (
    <Screen padded={false} background={colors.background}>
      <FlatList
        data={[]}
        keyExtractor={() => 'x'}
        renderItem={null}
        ListHeaderComponent={
          <View>
            {renderHero()}
            {renderFeatures()}
            {renderCategories()}
            {renderProductRow('Featured Products', 'Trending Now', featured, { featured: true })}
            {renderProductRow('New Arrivals', 'Just In', newArrivals, { newArrivals: true })}
            {renderCta()}
            <View style={{ height: spacing.xl2 }} />
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      />
    </Screen>
  );
}

function Stat({ value, label }) {
  return (
    <View>
      <Text style={[styles.statVal, { fontFamily: typography.fontFamilyDisplay }]}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#fffbf5',
    padding: 24,
    paddingTop: 36,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15,23,42,0.07)',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(249,115,22,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.28)',
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: 8 },
  liveText: { fontSize: 10, color: colors.primary, fontWeight: '800', letterSpacing: 2 },
  outlineWrap: { height: 56, position: 'relative', marginBottom: 0 },
  heroH1Outline: { fontSize: 56, lineHeight: 56, fontWeight: '900', color: colors.background, letterSpacing: -2, position: 'absolute', top: -2, left: 0, textShadowColor: colors.ice, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  heroH1OutlineBg: { fontSize: 56, lineHeight: 56, fontWeight: '900', color: colors.background, letterSpacing: -2, position: 'absolute', top: 0, left: 0, textShadowColor: colors.ice, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  heroH1Grad: { fontSize: 56, lineHeight: 56, fontWeight: '900', color: colors.primary, letterSpacing: -2 },
  heroH1Solid: { fontSize: 56, lineHeight: 56, fontWeight: '900', color: colors.ice, letterSpacing: -2 },
  heroDesc: { color: 'rgba(15,23,42,0.55)', marginTop: 16, lineHeight: 22, fontSize: 14, maxWidth: 320 },
  heroCtas: { flexDirection: 'row', marginTop: 22, alignItems: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 28, alignItems: 'center' },
  statsSep: { width: 1, height: 28, backgroundColor: 'rgba(15,23,42,0.10)', marginHorizontal: 16 },
  statVal: { fontSize: 22, fontWeight: '900', color: colors.gold, lineHeight: 24 },
  statLbl: { fontSize: 11, color: colors.muted, marginTop: 2 },

  features: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15,23,42,0.07)',
  },
  featCell: { width: '50%', flexDirection: 'row', alignItems: 'center', padding: 8 },
  featIco: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  featTitle: { fontSize: 13, fontWeight: '700', color: colors.ice },
  featSub: { fontSize: 11, color: colors.muted, marginTop: 1 },

  section: { paddingHorizontal: 16, paddingTop: 28 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  catCell: { width: '33.333%', padding: 6 },

  productGrid: { marginHorizontal: -6 },
  productRow: { flexDirection: 'row' },
  productCell: { width: '50%', padding: 6 },

  ctaCard: {
    margin: 16,
    marginTop: 32,
    padding: 24,
    backgroundColor: '#fffbf5',
    borderRadius: radius.xl2,
    borderWidth: 1,
    borderColor: 'rgba(234,108,0,0.18)',
    ...shadows.sm,
  },
  ctaTitle: { fontSize: 24, fontWeight: '900', color: colors.ice, lineHeight: 30, letterSpacing: -0.5 },
  ctaSub: { color: colors.muted, marginTop: 10, lineHeight: 20, fontSize: 13 },
});
