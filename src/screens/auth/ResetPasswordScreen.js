import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { colors, radius, typography } from '../../theme';
import * as AuthApi from '../../api/auth';
import { extractError } from '../../api/client';

export default function ResetPasswordScreen({ route, navigation }) {
  const initialEmail = route?.params?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!email.trim() || !otp.trim() || newPassword.length < 8) {
      setError('Fill all fields. Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await AuthApi.resetPassword({ email: email.trim(), otp: otp.trim(), newPassword });
      setSuccess('Password reset successfully. You can now sign in.');
      setTimeout(() => navigation.navigate('Login'), 800);
    } catch (err) {
      setError(extractError(err, 'Could not reset password'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen background={colors.surfaceAlt} padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.wrap}>
          <View style={styles.card}>
            <Text style={[styles.title, { fontFamily: typography.fontFamilyDisplay }]}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter the OTP sent to your email and choose a new password</Text>

            {error ? <Alert tone="danger" message={error} /> : null}
            {success ? <Alert tone="success" message={success} /> : null}

            <Text style={styles.label}>Email Address</Text>
            <TextInput mode="outlined" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" maxLength={100} style={styles.input} outlineColor={colors.borderSoft} activeOutlineColor={colors.primary} />

            <Text style={styles.label}>OTP Code</Text>
            <TextInput mode="outlined" value={otp} onChangeText={setOtp} placeholder="6-digit code" keyboardType="number-pad" maxLength={6} style={styles.input} outlineColor={colors.borderSoft} activeOutlineColor={colors.primary} />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              mode="outlined"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 8 characters"
              secureTextEntry={!showPassword}
              maxLength={128}
              right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword((s) => !s)} />}
              style={styles.input}
              outlineColor={colors.borderSoft}
              activeOutlineColor={colors.primary}
            />

            <Button
              label={submitting ? 'Resetting…' : 'Reset Password'}
              onPress={onSubmit}
              loading={submitting}
              variant="primary"
              size="lg"
              iconRight="check"
              block
            />

            <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 18 }}>
              <Text style={{ color: colors.muted, textAlign: 'center' }}>Back</Text>
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
  input: { marginBottom: 12, backgroundColor: colors.surface, fontSize: 15 },
});
