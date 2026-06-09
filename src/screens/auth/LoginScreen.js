import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { colors, radius, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../api/client';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async () => {
    setError(null);
    if (!loginId.trim() || !password.trim()) {
      setError('Please enter your email/phone and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn({ loginId: loginId.trim(), password, rememberMe });
    } catch (err) {
      setError(extractError(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen background={colors.surfaceAlt} padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.wrap}>
          <View style={styles.card}>
            <Text style={[styles.title, { fontFamily: typography.fontFamilyDisplay }]}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to access your account and orders</Text>

            {error ? <Alert tone="danger" message={error} /> : null}

            <Text style={styles.label}>Email or Mobile Number</Text>
            <TextInput
              mode="outlined"
              value={loginId}
              onChangeText={setLoginId}
              placeholder="example@mail.com or 98XXXXXXXX"
              autoCapitalize="none"
              keyboardType="email-address"
              maxLength={100}
              outlineColor={colors.borderSoft}
              activeOutlineColor={colors.primary}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              maxLength={128}
              outlineColor={colors.borderSoft}
              activeOutlineColor={colors.primary}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword((s) => !s)}
                />
              }
              style={styles.input}
            />

            <View style={styles.actionRow}>
              <Pressable style={styles.rememberRow} onPress={() => setRememberMe((s) => !s)}>
                <MaterialIcons name={rememberMe ? 'check-box' : 'check-box-outline-blank'} size={20} color={rememberMe ? colors.primary : colors.muted} />
                <Text style={[styles.rememberText, rememberMe && { color: colors.ice }]}>Remember me</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>
            </View>

            <Button
              label={submitting ? 'Signing in…' : 'Sign In'}
              onPress={onSubmit}
              loading={submitting}
              variant="primary"
              size="lg"
              iconRight="login"
              block
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.link, { marginLeft: 6 }]}>Create Account</Text>
              </Pressable>
            </View>
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
  input: { marginBottom: 14, backgroundColor: colors.surface, fontSize: 15 },
  link: { color: colors.primary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.muted },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 13,
    color: colors.muted,
    marginLeft: 6,
  },
});
