import React, { useEffect, useState } from 'react';
import {
  Alert as RNAlert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput as PaperTextInput } from 'react-native-paper';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import PriceTag from '../../components/PriceTag';
import QuantityStepper from '../../components/QuantityStepper';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, typography } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchProductDetails } from '../../api/products';
import { submitReview } from '../../api/reviews';
import { addToCart } from '../../api/cart';
import { addToWishlist, checkWishlist, removeWishlist } from '../../api/wishlist';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../api/client';

export default function ProductDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { id } = route.params || {};

  const [data, setData] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlistInfo, setWishlistInfo] = useState({ inWishlist: false, id: null });
  const [loading, setLoading] = useState(true);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const reloadProduct = async () => {
    setLoading(true);
    try {
      const result = await fetchProductDetails(id);
      setData(result);
      const product = result?.product || result;
      setActiveImage(product?.image_url || product?.image || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const result = await fetchProductDetails(id);
        if (!alive) return;
        setData(result);
        const product = result?.product || result;
        setActiveImage(product?.image_url || product?.image || null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const product = data?.product || data;
    if (!product?.id) return;
    (async () => {
      const info = await checkWishlist(product.id);
      if (info) {
        setWishlistInfo({
          inWishlist: !!(info.in_wishlist || info.exists || info.wishlist_id),
          id: info.wishlist_id || info.id || null,
        });
      }
    })();
  }, [isAuthenticated, data]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    RNAlert.alert('Sign in required', 'Please sign in to continue.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In', onPress: () => navigation.navigate('Account', { screen: 'Login' }) },
    ]);
    return false;
  };

  const product = data?.product || data;
  const stock = Number(product?.stock || 0);
  const outOfStock = stock <= 0;

  const handleAddToCart = async () => {
    if (!product || outOfStock) return;
    if (!requireAuth()) return;
    setAdding(true);
    try {
      await addToCart({ productId: product.id, quantity: qty });
      setQty(1);
      RNAlert.alert('Added to cart', `${qty} × ${product.name} added.`);
    } catch (err) {
      RNAlert.alert('Could not add', extractError(err));
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!requireAuth()) return;
    try {
      if (wishlistInfo.inWishlist && wishlistInfo.id) {
        await removeWishlist(wishlistInfo.id);
        setWishlistInfo({ inWishlist: false, id: null });
      } else {
        const r = await addToWishlist(product.id);
        const newId = r?.data?.id || r?.data?.wishlist_id || null;
        setWishlistInfo({ inWishlist: true, id: newId });
      }
    } catch (err) {
      RNAlert.alert('Wishlist', extractError(err));
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      RNAlert.alert('Select rating', 'Please select a star rating before submitting.');
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview(product.id, { rating: reviewRating, comment: reviewComment });
      RNAlert.alert('Review submitted', 'Your review has been submitted for approval.');
      setReviewVisible(false);
      setReviewRating(0);
      setReviewComment('');
      await reloadProduct();
    } catch (err) {
      RNAlert.alert('Could not submit', extractError(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Screen background={colors.background} padded={false} scroll>
        <Skeleton height={320} radius={0} />
        <View style={{ padding: 16 }}>
          <Skeleton height={20} width="60%" />
          <View style={{ height: 8 }} />
          <Skeleton height={28} width="80%" />
          <View style={{ height: 16 }} />
          <Skeleton height={20} width="40%" />
          <View style={{ height: 24 }} />
          <Skeleton height={120} />
        </View>
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen>
        <Text style={{ textAlign: 'center', marginTop: 40, color: colors.muted }}>Product unavailable.</Text>
      </Screen>
    );
  }

  const gallery = (() => {
    const set = new Set();
    const arr = [];
    if (product.image_url) {
      set.add(product.image_url);
      arr.push(product.image_url);
    }
    if (product.image && !set.has(product.image)) {
      set.add(product.image);
      arr.push(product.image);
    }
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((g) => {
        const u = g.image_url || g.url || g;
        if (u && !set.has(u)) {
          set.add(u);
          arr.push(u);
        }
      });
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((g) => {
        const u = g.image_url || g.url || g;
        if (u && !set.has(u)) {
          set.add(u);
          arr.push(u);
        }
      });
    }
    return arr;
  })();

  const hasDiscount = product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.price);
  const pct = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
  const reviews = data?.reviews || [];
  const related = product.related_products || data?.related_products || [];

  return (
    <Screen background={colors.background} padded={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 96 }} showsVerticalScrollIndicator={false}>
        <View style={styles.galleryWrap}>
          {activeImage ? (
            <Image source={activeImage} style={styles.mainImage} contentFit="contain" />
          ) : (
            <View style={[styles.mainImage, { alignItems: 'center', justifyContent: 'center' }]}>
              <MaterialIcons name="image" size={80} color={colors.muted} style={{ opacity: 0.3 }} />
            </View>
          )}
          {pct > 0 ? <Badge label={`-${pct}%`} tone="danger" solid style={styles.discount} /> : null}
        </View>

        {gallery.length > 1 ? (
          <FlatList
            data={gallery}
            horizontal
            keyExtractor={(uri, idx) => `${uri}-${idx}`}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable onPress={() => setActiveImage(item)} style={[styles.thumb, activeImage === item && styles.thumbActive]}>
                <Image source={item} style={styles.thumbImg} contentFit="contain" />
              </Pressable>
            )}
          />
        ) : null}

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{(product.category_name || product.category || 'GENERAL').toUpperCase()}</Text>
            <Badge
              label={outOfStock ? 'Out of stock' : `In stock${stock > 0 ? ` (${stock})` : ''}`}
              tone={outOfStock ? 'danger' : 'success'}
              solid={outOfStock}
            />
          </View>

          <Text style={[styles.title, { fontFamily: typography.fontFamilyDisplay }]} accessibilityRole="header">
            {product.name}
          </Text>

          {product.sku ? <Text style={styles.sku}>SKU: {product.sku}</Text> : null}

          <View style={styles.priceCard}>
            <LinearGradient colors={['#fffbf5', '#fff5e6']} style={StyleSheet.absoluteFill} />
            <PriceTag price={product.price} discountPrice={product.discount_price} size="xl" accent />
          </View>

          {product.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          {reviews.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyDisplay }]}>Customer Reviews</Text>
              {reviews.slice(0, 5).map((r, idx) => (
                <View key={r.id || idx} style={styles.reviewRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewer}>{r.full_name || r.user_name || 'Customer'}</Text>
                    <Text style={styles.reviewText}>{r.comment || r.review || ''}</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    <MaterialIcons name="star" size={14} color={colors.warning} />
                    <Text style={styles.ratingText}>{r.rating ?? '-'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {isAuthenticated ? (
            <View style={styles.section}>
              <Button label="Write a Review" icon="rate-review" variant="ghost" onPress={() => setReviewVisible(true)} />
            </View>
          ) : null}

          {/* Review Modal */}
          <Modal visible={reviewVisible} transparent animationType="slide" onRequestClose={() => setReviewVisible(false)}>
            <View style={styles.reviewOverlay}>
              <View style={styles.reviewModal}>
                <Text style={[styles.reviewModalTitle, { fontFamily: typography.fontFamilyDisplay }]}>Write a Review</Text>

                <View style={styles.starPicker}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => setReviewRating(star)} hitSlop={8}>
                      <MaterialIcons
                        name={star <= reviewRating ? 'star' : 'star-border'}
                        size={36}
                        color={star <= reviewRating ? colors.warning : colors.muted}
                      />
                    </Pressable>
                  ))}
                </View>

                <PaperTextInput
                  mode="outlined"
                  placeholder="Share your experience with this product…"
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={4}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  maxLength={1000}
                  outlineColor={colors.borderSoft}
                  activeOutlineColor={colors.primary}
                  style={styles.reviewInput}
                />

                <View style={styles.reviewActions}>
                  <Button label="Cancel" variant="ghost" onPress={() => setReviewVisible(false)} style={{ flex: 1 }} />
                  <Button label="Submit" loading={submittingReview} onPress={handleSubmitReview} style={{ flex: 1, marginLeft: 12 }} />
                </View>
              </View>
            </View>
          </Modal>

          {related.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyDisplay }]}>You May Also Like</Text>
              <FlatList
                data={related}
                horizontal
                keyExtractor={(p, idx) => String(p.id || idx)}
                contentContainerStyle={{ paddingVertical: 4 }}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => navigation.push('ProductDetail', { id: item.id, name: item.name })}
                    style={styles.relatedCard}
                  >
                    {item.image_url || item.image ? (
                      <Image source={item.image_url || item.image} style={styles.relatedImg} contentFit="contain" />
                    ) : (
                      <View style={[styles.relatedImg, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }]}>
                        <MaterialIcons name="image" size={24} color={colors.muted} />
                      </View>
                    )}
                    <Text style={styles.relatedName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <PriceTag price={item.price} discountPrice={item.discount_price} size="sm" />
                  </Pressable>
                )}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={handleToggleWishlist} hitSlop={8} style={styles.heart}>
          <MaterialIcons
            name={wishlistInfo.inWishlist ? 'favorite' : 'favorite-border'}
            size={24}
            color={wishlistInfo.inWishlist ? colors.danger : colors.ice}
          />
        </Pressable>
        <QuantityStepper value={qty} onChange={setQty} min={1} max={Math.max(1, stock)} />
        <Button
          label={outOfStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
          icon="shopping-cart"
          onPress={handleAddToCart}
          variant="primary"
          loading={adding}
          disabled={outOfStock}
          pill
          style={{ flex: 1, marginLeft: 12 }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  galleryWrap: {
    backgroundColor: colors.surfaceAlt,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: { width: '90%', height: '90%' },
  discount: { position: 'absolute', top: 16, left: 16 },

  thumb: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginRight: 10,
    backgroundColor: colors.surface,
  },
  thumbActive: { borderColor: colors.primary, ...shadows.md },
  thumbImg: { width: '100%', height: '100%' },

  body: { paddingHorizontal: 16, paddingTop: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  title: { fontSize: 26, fontWeight: '900', color: colors.ice, lineHeight: 30, marginTop: 10, letterSpacing: -0.5 },
  sku: { color: colors.muted, fontSize: 12, marginTop: 6 },

  priceCard: {
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    marginTop: 18,
  },
  description: { color: colors.text, marginTop: 18, lineHeight: 22, fontSize: 14 },

  section: { marginTop: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.ice, marginBottom: 12 },

  reviewRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  reviewer: { fontWeight: '700', color: colors.ice, marginBottom: 2 },
  reviewText: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  ratingText: { marginLeft: 4, color: colors.warning, fontWeight: '700' },

  relatedCard: { width: 140, marginRight: 12 },
  relatedImg: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    marginBottom: 8,
  },
  relatedName: { fontSize: 12, color: colors.ice, marginBottom: 4 },

  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingTop: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    ...shadows.lg,
  },
  heart: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },

  reviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  reviewModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl2,
    borderTopRightRadius: radius.xl2,
    padding: 24,
    paddingBottom: 40,
  },
  reviewModalTitle: { fontSize: 20, fontWeight: '900', color: colors.ice, marginBottom: 16, textAlign: 'center' },
  starPicker: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 6 },
  reviewInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 14,
    color: colors.text,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewActions: { flexDirection: 'row', marginTop: 20 },
});
