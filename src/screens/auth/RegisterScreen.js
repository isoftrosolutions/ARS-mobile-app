import React, { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import PickerField from '../../components/PickerField';
import { colors, radius, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../api/client';
import { PROVINCE_NAMES, getDistricts } from '../../data/nepal-address';

export default function RegisterScreen({ navigation }) {
  const { signUp, signIn } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    province: '',
    district: '',
    municipality: '',
    ward: '',
    street: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const districts = form.province ? getDistricts(form.province) : [];

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^9[78]\d{8}$/.test(form.phone.trim())) return 'Enter a valid 10-digit Nepali mobile (97/98…)';
    if (!form.province) return 'Province is required';
    if (!form.district) return 'District is required';
    if (!form.municipality.trim()) return 'Municipality is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!termsAccepted) return 'You must agree to the Terms & Conditions';
    return null;
  };

  const buildAddress = () => {
    const parts = [];
    if (form.street.trim()) parts.push(form.street.trim());
    parts.push(form.municipality.trim() + (form.ward.trim() ? '-' + form.ward.trim() : ''));
    parts.push(form.district);
    parts.push(form.province);
    return parts.join(', ');
  };

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        address: buildAddress(),
        province: form.province,
        district: form.district,
        municipality: form.municipality.trim(),
        ward: form.ward.trim(),
        street: form.street.trim(),
      });
      try {
        await signIn({ loginId: form.phone.trim(), password: form.password });
      } catch {
        setSuccess('Account created. Please sign in.');
        navigation.navigate('Login');
      }
    } catch (err) {
      setError(extractError(err, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen background={colors.surfaceAlt} padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={[styles.title, { fontFamily: typography.fontFamilyDisplay }]}>Join ARS</Text>
            <Text style={styles.subtitle}>Create an account to track orders and save your wishlist</Text>

            {error ? <Alert tone="danger" message={error} /> : null}
            {success ? <Alert tone="success" message={success} /> : null}

            <Text style={styles.label}>Full Name</Text>
            <TextInput mode="outlined" value={form.name} onChangeText={set('name')} placeholder="John Doe" maxLength={100} style={styles.input} outlineColor={colors.borderSoft} activeOutlineColor={colors.primary} />

            <Text style={styles.label}>Email Address</Text>
            <TextInput mode="outlined" value={form.email} onChangeText={set('email')} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" maxLength={100} style={styles.input} outlineColor={colors.borderSoft} activeOutlineColor={colors.primary} />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput mode="outlined" value={form.phone} onChangeText={set('phone')} placeholder="98XXXXXXXX" keyboardType="phone-pad" maxLength={10} style={styles.input} outlineColor={colors.borderSoft} activeOutlineColor={colors.primary} />

            <View style={styles.sectionTitle}>
              <MaterialIcons name="location-on" size={16} color={colors.primary} />
              <Text style={[styles.sectionLabel, { marginLeft: 6 }]}>Address</Text>
            </View>

            <PickerField
              label="Province"
              value={form.province}
              options={PROVINCE_NAMES}
              onSelect={set('province')}
              placeholder="Select Province"
            />

            <PickerField
              label="District"
              value={form.district}
              options={districts}
              onSelect={set('district')}
              placeholder={form.province ? 'Select District' : 'Select province first'}
              disabled={!form.province}
            />

            <Text style={styles.label}>Municipality / Rural Municipality</Text>
            <TextInput mode="outlined" value={form.municipality} onChangeText={set('municipality')} placeholder="E.g. Kathmandu" maxLength={100} style={styles.input} outlineColor={colors.borderSoft} activeOutlineColor={colors.primary} />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Ward No.</Text>
                <TextInput mode="outlined" value={form.ward} onChangeText={set('ward')} placeholder="Ward" keyboardType="number-pad" maxLength={3} style={styles.input} outlineColor={colors.borderSoft} activeOutlineColor={colors.primary} />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>Street / Locality</Text>
                <TextInput mode="outlined" value={form.street} onChangeText={set('street')} placeholder="E.g. Main Road" maxLength={200} style={styles.input} outlineColor={colors.borderSoft} activeOutlineColor={colors.primary} />
              </View>
            </View>

            <Text style={styles.label}>Password</Text>
            <TextInput
              mode="outlined"
              value={form.password}
              onChangeText={set('password')}
              placeholder="At least 8 characters"
              secureTextEntry={!showPassword}
              maxLength={128}
              right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword((s) => !s)} />}
              style={styles.input}
              outlineColor={colors.borderSoft}
              activeOutlineColor={colors.primary}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput mode="outlined" value={form.confirmPassword} onChangeText={set('confirmPassword')} placeholder="••••••••" secureTextEntry={!showPassword} maxLength={128} style={styles.input} outlineColor={colors.borderSoft} activeOutlineColor={colors.primary} />

            <Pressable style={styles.termsRow} onPress={() => setTermsAccepted((s) => !s)}>
              <MaterialIcons name={termsAccepted ? 'check-box' : 'check-box-outline-blank'} size={22} color={termsAccepted ? colors.primary : colors.muted} />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink} onPress={() => Linking.openURL('https://easyshoppingars.com/terms')}>
                  Terms & Conditions
                </Text>
              </Text>
            </Pressable>

            <Button
              label={submitting ? 'Creating account…' : 'Create Account'}
              onPress={onSubmit}
              loading={submitting}
              variant="primary"
              size="lg"
              iconRight="person-add"
              block
              style={{ marginTop: 4 }}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.link, { marginLeft: 6 }]}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingTop: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.ice, textAlign: 'center', marginBottom: 8 },
  subtitle: { color: colors.muted, textAlign: 'center', marginBottom: 24, fontSize: 14 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ice,
    marginBottom: 6,
    marginTop: 4,
  },
  input: { marginBottom: 12, backgroundColor: colors.surface, fontSize: 15 },
  link: { color: colors.primary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.muted },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSoft,
    paddingTop: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ice,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 13,
    color: colors.muted,
    marginLeft: 8,
    flex: 1,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
