import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { colors, radius, shadows, typography } from '../../theme';
import * as AuthApi from '../../api/auth';
import { extractError } from '../../api/client';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await AuthApi.changePassword({ currentPassword, newPassword });
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      setTimeout(() => navigation.goBack(), 700);
    } catch (err) {
      setError(extractError(err, 'Could not change password'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.wrap}>
          <View style={styles.card}>
            <Text style={[styles.title, { fontFamily: typography.fontFamilyDisplay }]}>Change Password</Text>
            <Text style={styles.subtitle}>Choose a strong password (min. 8 characters).</Text>

            {error ? <Alert tone="danger" message={error} /> : null}
            {success ? <Alert tone="success" message={success} /> : null}

            <Text style={styles.label}>Current Password</Text>
            <TextInput
              mode="outlined"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
              secureTextEntry={!showCurrent}
              maxLength={128}
              right={<TextInput.Icon icon={showCurrent ? 'eye-off' : 'eye'} onPress={() => setShowCurrent((s) => !s)} />}
              outlineColor={colors.borderSoft}
              activeOutlineColor={colors.primary}
              style={styles.input}
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              mode="outlined"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 8 characters"
              secureTextEntry={!showNew}
              maxLength={128}
              right={<TextInput.Icon icon={showNew ? 'eye-off' : 'eye'} onPress={() => setShowNew((s) => !s)} />}
              outlineColor={colors.borderSoft}
              activeOutlineColor={colors.primary}
              style={styles.input}
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              mode="outlined"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              secureTextEntry={!showNew}
              maxLength={128}
              outlineColor={colors.borderSoft}
              activeOutlineColor={colors.primary}
              style={styles.input}
            />

            <Button label={busy ? 'Saving…' : 'Update Password'} loading={busy} onPress={onSubmit} block style={{ marginTop: 8 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, justifyContent: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  title: { fontSize: 22, fontWeight: '900', color: colors.ice, marginBottom: 4 },
  subtitle: { color: colors.muted, marginBottom: 18, fontSize: 13 },
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
