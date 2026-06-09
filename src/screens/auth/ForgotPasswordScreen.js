import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { colors, radius, typography } from '../../theme';
import * as AuthApi from '../../api/auth';
import { extractError } from '../../api/client';

export default function ForgotPasswordScreen({ navigation }) {
  const [loginId, setLoginId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = (v) => /^9[78]\d{8}$/.test(v);

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);
    const trimmed = loginId.trim();
    if (!trimmed) {
      setError('Please enter your email or phone number');
      return;
    }
    if (!isEmail(trimmed) && !isPhone(trimmed)) {
      setError('Enter a valid email or 10-digit Nepali mobile number');
      return;
    }
    setSubmitting(true);
    try {
      await AuthApi.forgotPassword({ email: trimmed });
      setSuccess('If your information is registered, an OTP has been sent.');
      setTimeout(() => navigation.navigate('ResetPassword', { email: trimmed }), 600);
    } catch (err) {
      setError(extractError(err, 'Could not send OTP'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen background={colors.surfaceAlt} padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.wrap}>
          <View style={styles.card}>
            <Text style={[styles.title, { fontFamily: typography.fontFamilyDisplay }]}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email and we'll send a verification code</Text>

            {error ? <Alert tone="danger" message={error} /> : null}
            {success ? <Alert tone="success" message={success} /> : null}

            <Text style={styles.label}>Email or Mobile Number</Text>
            <TextInput
              mode="outlined"
              value={loginId}
              onChangeText={setLoginId}
              placeholder="you@example.com or 98XXXXXXXX"
              autoCapitalize="none"
              keyboardType="email-address"
              maxLength={100}
              outlineColor={colors.borderSoft}
              activeOutlineColor={colors.primary}
              style={styles.input}
            />

            <Button
              label={submitting ? 'Sending…' : 'Send OTP'}
              onPress={onSubmit}
              loading={submitting}
              variant="primary"
              size="lg"
              iconRight="send"
              block
            />

            <Pressable onPress={() => navigation.navigate('ResetPassword', { email: loginId.trim() })} style={{ marginTop: 18 }}>
              <Text style={[styles.link, { textAlign: 'center' }]}>Already have an OTP? Reset password</Text>
            </Pressable>

            <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
              <Text style={{ color: colors.muted, textAlign: 'center' }}>Back to login</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 16 },
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
  input: { marginBottom: 16, backgroundColor: colors.surface, fontSize: 15 },
  link: { color: colors.primary, fontWeight: '600' },
});
