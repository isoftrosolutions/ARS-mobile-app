import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import PriceTag from '../../components/PriceTag';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, typography } from '../../theme';
import { fetchProducts } from '../../api/products';

function discountPercent(price, discountPrice) {
  const p = Number(price);
  const d = Number(discountPrice);
  if (!p || !d || d >= p) return 0;
  return Math.round(((p - d) / p) * 100);
}

function calcRemaining() {
  const now = new Date();
  const eod = new Date(now);
  eod.setHours(23, 59, 59, 999);
  return Math.max(0, eod - now);
}

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TodayDealScreen({ navigation }) {
  const [deal, setDeal] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [remaining, setRemaining] = useState(calcRemaining());

  const load = useCallback(async () => {
    try {
      const { data } = await fetchProducts({ sort: 'popular', limit: 20 });
      const discounted = data
        .filter((p) => Number(p.discount_price) > 0)
        .sort((a, b) => discountPercent(b.price, b.discount_price) - discountPercent(a.price, a.discount_price));
      if (discounted.length > 0) {
        setDeal(discounted[0]);
        setDeals(discounted.slice(1, 7));
      }
    } catch (e) {
      // silently handled — empty state shown below
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await load();
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  const expired = remaining <= 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRemaining(calcRemaining());
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <Screen padded background={colors.surfaceAlt}>
        <Skeleton height={300} radius={radius.xl} style={{ marginBottom: 16 }} />
        <Skeleton height={100} radius={radius.lg} style={{ marginBottom: 16 }} />
        <Skeleton height={200} radius={radius.xl} />
      </Screen>
    );
  }

  if (!deal) {
    return (
      <Screen padded background={colors.surfaceAlt}>
        <View style={styles.empty}>
          <MaterialIcons name="clock" size={64} color={colors.muted} />
          <Text style={[styles.emptyTitle, { fontFamily: typography.fontFamilyBody }]}>No Deal Today</Text>
          <Text style={[styles.emptySub, { fontFamily: typography.fontFamilyBody }]}>Check back tomorrow for new deals!</Text>
          <Button label="Continue Shopping" variant="dark" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
        </View>
      </Screen>
    );
  }

  const pct = discountPercent(deal.price, deal.discount_price);

  return (
    <Screen scroll background={colors.surfaceAlt} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroBadgeRow}>
          <Badge label="TODAY'S DEAL" tone="danger" solid />
          {pct > 0 ? <Badge label={`-${pct}%`} tone="success" solid /> : null}
        </View>

        <View style={styles.imgWrap}>
          {deal.image_url || deal.image ? (
            <Image source={deal.image_url || deal.image} style={styles.heroImg} contentFit="contain" />
          ) : (
            <MaterialIcons name="image" size={80} color={colors.muted} style={{ opacity: 0.3 }} />
          )}
        </View>

        <Text style={[styles.dealName, { fontFamily: typography.fontFamilyDisplay }]} numberOfLines={2}>
          {deal.name}
        </Text>

        <PriceTag price={deal.price} discountPrice={deal.discount_price} size="lg" accent />

        {deal.description ? (
          <Text style={[styles.desc, { fontFamily: typography.fontFamilyBody }]} numberOfLines={3}>
            {deal.description}
          </Text>
        ) : null}

        {/* Countdown */}
        <View style={styles.timerBox}>
          <MaterialIcons name="timer" size={20} color={colors.primary} />
          <Text style={[styles.timerLabel, { fontFamily: typography.fontFamilyBody }]}>Deal ends in:</Text>
          <Text style={[styles.timerValue, { fontFamily: typography.fontFamilyDisplay }]}>
            {expired ? 'Expired' : formatTime(remaining)}
          </Text>
        </View>

        <Button
          label="View Details"
          variant="dark"
          icon="arrow-forward"
          iconRight
          block
          onPress={() => navigation.navigate('ProductDetail', { id: deal.id, name: deal.name })}
        />
      </View>

      {/* More Deals */}
      {deals.length > 0 ? (
        <View style={styles.moreSection}>
          <Text style={[styles.moreTitle, { fontFamily: typography.fontFamilyDisplay }]}>More Deals</Text>
          <View style={styles.grid}>
            {deals.map((item) => {
              const ipct = discountPercent(item.price, item.discount_price);
              return (
                <Pressable
                  key={item.id}
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('ProductDetail', { id: item.id, name: item.name })}
                >
                  <View style={styles.gridImgBox}>
                    {item.image_url || item.image ? (
                      <Image source={item.image_url || item.image} style={styles.gridImg} contentFit="contain" />
                    ) : (
                      <MaterialIcons name="image" size={32} color={colors.muted} style={{ opacity: 0.3 }} />
                    )}
                    {ipct > 0 ? <Badge label={`-${ipct}%`} tone="danger" solid style={styles.gridBadge} /> : null}
                  </View>
                  <Text style={[styles.gridName, { fontFamily: typography.fontFamilyBody }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <PriceTag price={item.price} discountPrice={item.discount_price} size="sm" />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    padding: 20,
    ...shadows.card,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  imgWrap: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroImg: { width: '90%', height: '90%' },
  dealName: {
    fontSize: typography.size.xl2,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  desc: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: 14,
    borderRadius: radius.lg,
    marginBottom: 16,
    gap: 8,
  },
  timerLabel: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  timerValue: {
    fontSize: typography.size.xl,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  moreSection: {
    marginTop: 24,
    paddingBottom: 32,
  },
  moreTitle: {
    fontSize: typography.size.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridCard: {
    width: '50%',
    padding: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gridImgBox: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridImg: { width: '80%', height: '80%' },
  gridBadge: { position: 'absolute', top: 8, left: 8, zIndex: 1 },
  gridName: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 10,
    paddingTop: 10,
    marginBottom: 4,
    lineHeight: 18,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: typography.size.xl2,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
  },
  emptySub: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
