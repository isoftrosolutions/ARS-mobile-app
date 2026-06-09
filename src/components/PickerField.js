import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, typography } from '../theme';

export default function PickerField({ label, value, options, onSelect, placeholder, error, disabled }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable onPress={() => !disabled && setVisible(true)}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            value={value || ''}
            placeholder={placeholder || `Select ${label}`}
            editable={false}
            outlineColor={error ? colors.danger : colors.borderSoft}
            activeOutlineColor={error ? colors.danger : colors.primary}
            right={<TextInput.Icon icon="chevron-down" />}
            style={styles.input}
          />
        </View>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>{label || 'Select'}</Text>
            <FlatList
              data={options}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item === value && styles.optionActive]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionTextActive]}>{item}</Text>
                  {item === value ? <MaterialIcons name="check" size={20} color={colors.primary} /> : null}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ice,
    marginBottom: 6,
    marginTop: 4,
  },
  input: { backgroundColor: colors.surface, fontSize: 15 },
  error: { fontSize: 12, color: colors.danger, marginTop: 2 },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl2,
    borderTopRightRadius: radius.xl2,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSoft,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ice,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: typography.fontFamilyDisplay,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  optionActive: { backgroundColor: colors.surfaceAlt },
  optionText: { fontSize: 15, color: colors.ice },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
});
