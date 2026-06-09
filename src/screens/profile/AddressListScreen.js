import React, { useCallback, useEffect, useState } from 'react';
import { Alert as RNAlert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, typography } from '../../theme';
import { deleteAddress, fetchAddresses, setDefaultAddress } from '../../api/addresses';
import { extractError } from '../../api/client';

export default function AddressListScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (err) {
      RNAlert.alert('Could not load addresses', extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      await load();
    } catch (err) {
      RNAlert.alert('Could not set default', extractError(err));
    }
  };

  const onDelete = (a) => {
    RNAlert.alert('Delete address?', 'This will remove the address permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(a.id);
            await load();
          } catch (err) {
            RNAlert.alert('Could not delete', extractError(err));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { fontFamily: typography.fontFamilyDisplay }]}>{item.full_name}</Text>
            {item.is_default ? <Badge label="Default" tone="success" /> : null}
            {item.tag ? <Badge label={item.tag} tone="muted" style={{ marginLeft: 6 }} /> : null}
          </View>
          <Text style={styles.line}>{item.phone}</Text>
          <Text style={styles.line}>
            {[item.street, `${item.municipality}-${item.ward}`, item.district, item.province].filter(Boolean).join(', ')}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        {!item.is_default ? (
          <Button label="Set default" variant="ghost" size="sm" onPress={() => onSetDefault(item.id)} />
        ) : null}
        <Button label="Edit" icon="edit" variant="ghost" size="sm" onPress={() => navigation.navigate('AddressForm', { mode: 'edit', address: item })} style={{ marginLeft: 8 }} />
        <Pressable onPress={() => onDelete(item)} style={styles.delete} hitSlop={6}>
          <MaterialIcons name="delete-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      {loading ? (
        <View style={{ padding: 16 }}>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={120} radius={radius.xl} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(a) => String(a.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="location-off"
              title="No addresses yet"
              message="Add a shipping address to speed up checkout."
              actionLabel="Add address"
              onAction={() => navigation.navigate('AddressForm', { mode: 'create' })}
            />
          }
        />
      )}

      {addresses.length > 0 ? (
        <View style={styles.fab}>
          <Button label="Add new address" icon="add" onPress={() => navigation.navigate('AddressForm', { mode: 'create' })} block />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  topRow: { flexDirection: 'row' },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '800', color: colors.ice, marginRight: 8 },
  line: { color: colors.muted, fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  delete: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fab: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
});
