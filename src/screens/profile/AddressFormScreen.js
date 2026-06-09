import React, { useState, useMemo } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { colors, radius, shadows, typography } from '../../theme';
import { createAddress, updateAddress } from '../../api/addresses';
import { extractError } from '../../api/client';
import nepalData from '../../data/nepal.json';

const TAGS = ['Home', 'Office', 'Other'];
const CHEVRON_DOWN = '\u25BC';

export default function AddressFormScreen({ navigation, route }) {
  const isEdit = route.params?.mode === 'edit';
  const existing = route.params?.address || {};

  const [form, setForm] = useState({
    full_name: existing.full_name || '',
    phone: existing.phone || '',
    province: existing.province || '',
    district: existing.district || '',
    municipality: existing.municipality || '',
    ward: existing.ward ? String(existing.ward) : '',
    street: existing.street || '',
    tag: existing.tag || 'Home',
    is_default: !!existing.is_default,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [pickerType, setPickerType] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const provinces = useMemo(() => nepalData.provinces || [], []);

  const getDistricts = useMemo(() => {
    const p = provinces.find((p) => form.province && (p.name === form.province || p.id === form.province));
    return p ? p.districts : [];
  }, [provinces, form.province]);

  const getMunicipalities = useMemo(() => {
    const p = provinces.find((p) => form.province && (p.name === form.province || p.id === form.province));
    if (!p) return [];
    const d = p.districts.find((d) => d.name === form.district);
    return d ? d.municipalities : [];
  }, [provinces, form.province, form.district]);

  const pickerOptions = useMemo(() => {
    if (pickerType === 'province') return provinces.map((p) => p.name);
    if (pickerType === 'district') return getDistricts.map((d) => d.name);
    if (pickerType === 'municipality') return getMunicipalities;
    return [];
  }, [pickerType, provinces, getDistricts, getMunicipalities]);

  const openPicker = (type) => {
    setPickerType(type);
    setPickerVisible(true);
  };

  const selectOption = (value) => {
    if (pickerType === 'province') {
      set('province')(value);
      set('district')('');
      set('municipality')('');
    } else if (pickerType === 'district') {
      set('district')(value);
      set('municipality')('');
    } else if (pickerType === 'municipality') {
      set('municipality')(value);
    }
    setPickerVisible(false);
    setPickerType(null);
  };

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required';
    if (!/^9[78]\d{8}$/.test(form.phone.trim())) return 'Enter a valid 10-digit Nepali mobile (97/98…)';
    if (!form.province.trim()) return 'Province is required';
    if (!form.district.trim()) return 'District is required';
    if (!form.municipality.trim()) return 'Municipality is required';
    if (!form.ward.trim()) return 'Ward is required';
    return null;
  };

  const onSubmit = async () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setBusy(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        province: form.province.trim(),
        district: form.district.trim(),
        municipality: form.municipality.trim(),
        ward: form.ward.trim(),
        street: form.street.trim(),
        tag: form.tag,
        is_default: form.is_default ? 1 : 0,
      };
      if (isEdit) {
        await updateAddress(existing.id, payload);
      } else {
        await createAddress(payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(extractError(err, 'Could not save address'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false} background={colors.surfaceAlt}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <View style={styles.card}>
            <Text style={[styles.title, { fontFamily: typography.fontFamilyDisplay }]}>
              {isEdit ? 'Edit Address' : 'Add Address'}
            </Text>

            {error ? <Alert tone="danger" message={error} /> : null}

            <Field label="Full Name" value={form.full_name} onChange={set('full_name')} placeholder="John Doe" maxLength={100} />
            <Field label="Mobile Number" value={form.phone} onChange={set('phone')} placeholder="98XXXXXXXX" keyboardType="phone-pad" maxLength={10} />

            <PickerField label="Province" value={form.province} placeholder="Select province" onPress={() => openPicker('province')} />
            <PickerField label="District" value={form.district} placeholder="Select province first" onPress={() => form.province && openPicker('district')} />
            <PickerField label="Municipality / City" value={form.municipality} placeholder="Select district first" onPress={() => form.district && openPicker('municipality')} />

            <Field label="Ward Number" value={form.ward} onChange={set('ward')} placeholder="07" keyboardType="number-pad" maxLength={3} />
            <Field label="Street / Tole (optional)" value={form.street} onChange={set('street')} placeholder="Main Road, Block A" maxLength={200} />

            <Text style={styles.fieldLabel}>Tag</Text>
            <View style={styles.tagRow}>
              {TAGS.map((t) => (
                <Pressable key={t} onPress={() => set('tag')(t)} style={[styles.tag, form.tag === t && styles.tagActive]}>
                  <Text style={[styles.tagText, form.tag === t && { color: '#fff' }]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={() => set('is_default')(!form.is_default)} style={styles.defaultRow}>
              <View style={[styles.checkbox, form.is_default && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                {form.is_default ? <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{'\u2713'}</Text> : null}
              </View>
              <Text style={styles.defaultLabel}>Set as default address</Text>
            </Pressable>

            <Button label={busy ? 'Saving\u2026' : isEdit ? 'Save changes' : 'Add address'} loading={busy} onPress={onSubmit} block style={{ marginTop: 16 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setPickerVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {pickerType === 'province' ? 'Select Province' : pickerType === 'district' ? 'Select District' : 'Select Municipality'}
              </Text>
              <Pressable onPress={() => setPickerVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>{'\u2715'}</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.optionsList}>
              {pickerOptions.map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.optionRow, form[pickerType] === opt && styles.optionRowActive]}
                  onPress={() => selectOption(opt)}
                >
                  <Text style={[styles.optionText, form[pickerType] === opt && styles.optionTextActive]}>
                    {opt}
                  </Text>
                  {form[pickerType] === opt ? <Text style={styles.checkMark}>{'\u2713'}</Text> : null}
                </Pressable>
              ))}
              {pickerOptions.length === 0 ? (
                <Text style={styles.emptyText}>No options available</Text>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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

function PickerField({ label, value, placeholder, onPress }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable onPress={onPress} style={styles.pickerInput}>
        <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.pickerChevron}>{CHEVRON_DOWN}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
  },
  title: { fontSize: 22, fontWeight: '900', color: colors.ice, marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ice,
    marginBottom: 6,
    marginTop: 4,
  },
  tagRow: { flexDirection: 'row', marginBottom: 16 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginRight: 8,
    backgroundColor: colors.surfaceAlt,
  },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { color: colors.ice, fontWeight: '600', fontSize: 13 },

  defaultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  defaultLabel: { color: colors.ice, fontSize: 14, fontWeight: '500' },

  pickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  pickerValue: { fontSize: 15, color: colors.ice, flex: 1 },
  pickerPlaceholder: { color: colors.textSecondary },
  pickerChevron: { fontSize: 10, color: colors.ice, marginLeft: 8 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.ice },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: colors.ice },
  optionsList: { paddingHorizontal: 16 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  optionRowActive: { backgroundColor: colors.surfaceAlt, marginHorizontal: -16, paddingHorizontal: 16 },
  optionText: { fontSize: 15, color: colors.ice },
  optionTextActive: { fontWeight: '700', color: colors.primary },
  checkMark: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: colors.textSecondary, paddingVertical: 24 },
});
