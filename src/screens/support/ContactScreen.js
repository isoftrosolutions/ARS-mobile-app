import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { colors, radius, shadows, typography } from '../../theme';
import { submitContact } from '../../api/contact';
import { extractError } from '../../api/client';

export default function ContactScreen({ navigation }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onSend = async () => {
    setError(null);
    setSuccess(false);
    if (!subject.trim()) { setError('Please enter a subject.'); return; }
    if (!message.trim()) { setError('Please enter a message.'); return; }
    setSending(true);
    try {
      await submitContact({ subject: subject.trim(), message: message.trim() });
      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(extractError(err, 'Could not send message'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>Birgunj, Parsa, Nepal</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>+977 9820210361</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>support@easyshoppingars.com</Text>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={[styles.formTitle, { fontFamily: typography.fontFamilyDisplay }]}>Send a Message</Text>

          {error ? <Alert tone="danger" message={error} /> : null}
          {success ? <Alert tone="success" message="Thank you for contacting us! We'll get back to you soon." /> : null}

          <Text style={styles.fieldLabel}>Subject</Text>
          <TextInput
            mode="outlined"
            value={subject}
            onChangeText={setSubject}
            placeholder="How can we help you?"
            maxLength={200}
            outlineColor={colors.borderSoft}
            activeOutlineColor={colors.primary}
            style={{ backgroundColor: colors.surface, marginBottom: 12 }}
          />

          <Text style={styles.fieldLabel}>Message</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue or question..."
            maxLength={1000}
            outlineColor={colors.borderSoft}
            activeOutlineColor={colors.primary}
            style={{ backgroundColor: colors.surface, marginBottom: 16 }}
          />

          <Button
            label={sending ? 'Sending…' : 'Send Message'}
            icon="send"
            variant="primary"
            loading={sending}
            onPress={onSend}
            block
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  infoLabel: { fontSize: 11, fontWeight: '700', color: colors.ice, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, color: colors.muted, marginTop: 2 },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  formTitle: { fontSize: 18, fontWeight: '800', color: colors.ice, marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ice,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
