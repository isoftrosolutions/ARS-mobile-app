import React, { useEffect, useState } from 'react';
import { Alert as RNAlert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { fetchMe, updateMe } from '../../api/user';
import { extractError } from '../../api/client';

export default function ProfileScreen({ navigation }) {
  const { user, signOut, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || user?.full_name || '', email: user?.email || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const fresh = await fetchMe();
        if (fresh) {
          setForm({
            name: fresh.name || fresh.full_name || '',
            email: fresh.email || '',
            address: fresh.address || '',
          });
        }
      } catch (err) {
        RNAlert.alert('Could not load profile', extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    setError(null);
    setSuccess(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      await updateMe({ name: form.name.trim(), email: form.email.trim(), address: form.address.trim() });
      await refreshUser();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(extractError(err, 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  };

  const initial = (form.name || 'U').charAt(0).toUpperCase();

  const ROWS = [
    { icon: 'receipt-long', label: 'My Orders', onPress: () => navigation.navigate('Orders') },
    { icon: 'favorite-border', label: 'Wishlist', onPress: () => navigation.navigate('Wishlist') },
    { icon: 'location-on', label: 'Addresses', onPress: () => navigation.navigate('Addresses') },
    { icon: 'lock-outline', label: 'Change Password', onPress: () => navigation.navigate('ChangePassword') },
    { icon: 'support-agent', label: 'Support', onPress: () => navigation.navigate('Support') },
    { icon: 'mail-outline', label: 'Contact Us', onPress: () => navigation.navigate('Contact') },
  ];

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>{initial}</Text></View>
          <Text style={[styles.name, { fontFamily: typography.fontFamilyDisplay }]}>{form.name || 'Customer'}</Text>
          <Text style={styles.email}>{form.email}</Text>
          {user?.phone ? <Text style={styles.email}>{user.phone}</Text> : null}
        </View>

        <View style={styles.list}>
          {ROWS.map((r, idx) => (
            <Pressable key={r.label} onPress={r.onPress} style={[styles.listRow, idx === ROWS.length - 1 && { borderBottomWidth: 0 }]}>
              <MaterialIcons name={r.icon} size={20} color={colors.ice} />
              <Text style={styles.listLabel}>{r.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={[styles.sectionTitle, { fontFamily: typography.fontFamilyDisplay }]}>Edit Profile</Text>

          {error ? <Alert tone="danger" message={error} /> : null}
          {success ? <Alert tone="success" message={success} /> : null}

          {loading ? (
            <>
              <Skeleton height={50} style={{ marginBottom: 10 }} />
              <Skeleton height={50} style={{ marginBottom: 10 }} />
              <Skeleton height={70} />
            </>
          ) : (
            <>
              <Field label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} maxLength={100} />
              <Field label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} keyboardType="email-address" autoCapitalize="none" maxLength={100} />
              <Field label="Default Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} multiline maxLength={200} />
              <Button label={saving ? 'Saving…' : 'Save changes'} icon="check" loading={saving} onPress={onSave} block style={{ marginTop: 8 }} />
            </>
          )}
        </View>

        <Button label="Sign Out" icon="logout" variant="outlineDanger" onPress={signOut} block style={{ marginTop: 16 }} />
      </ScrollView>
    </Screen>
  );
}

function Field({ label, value, onChange, ...rest }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChange}
        outlineColor={colors.borderSoft}
        activeOutlineColor={colors.primary}
        style={{ backgroundColor: colors.surface }}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    alignItems: 'center',
    padding: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontSize: 30, fontWeight: '900' },
  name: { marginTop: 12, fontSize: 20, fontWeight: '800', color: colors.ice },
  email: { color: colors.muted, marginTop: 4, fontSize: 13 },

  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 14,
    overflow: 'hidden',
    ...shadows.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  listLabel: { flex: 1, marginLeft: 12, color: colors.ice, fontSize: 14, fontWeight: '600' },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ice, marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ice,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
