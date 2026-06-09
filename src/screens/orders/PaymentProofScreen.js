import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
import { colors, radius, shadows, typography } from '../../theme';
import { fetchOrderDetail, uploadPaymentProof } from '../../api/orders';
import { extractError } from '../../api/client';
import { formatPrice } from '../../components/PriceTag';

export default function PaymentProofScreen({ navigation, route }) {
  const { id } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const d = await fetchOrderDetail(id);
        if (!alive) return;
        setOrder(d);
      } catch (e) {
        Alert.alert('Error', extractError(e, 'Failed to load order'));
        navigation.goBack();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required to select a payment screenshot.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select a payment screenshot first.');
      return;
    }
    setUploading(true);
    try {
      await uploadPaymentProof(id, image);
      Alert.alert('Success', 'Payment proof uploaded successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Upload Failed', extractError(e, 'Could not upload payment proof.'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Screen padded background={colors.surfaceAlt}>
        <Skeleton height={200} radius={radius.xl} style={{ marginBottom: 16 }} />
        <Skeleton height={80} radius={radius.lg} />
      </Screen>
    );
  }

  return (
    <Screen scroll background={colors.surfaceAlt}>
      {/* Order Info */}
      <View style={styles.infoCard}>
        <Text style={[styles.infoTitle, { fontFamily: typography.fontFamilyBody }]}>Order Details</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { fontFamily: typography.fontFamilyBody }]}>Order</Text>
          <Text style={[styles.infoValue, { fontFamily: typography.fontFamilyBody }]}>{order?.order?.order_number || `#${id}`}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { fontFamily: typography.fontFamilyBody }]}>Amount</Text>
          <Text style={[styles.infoValue, { fontFamily: typography.fontFamilyBody }]}>{formatPrice(order?.order?.total)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { fontFamily: typography.fontFamilyBody }]}>Payment</Text>
          <Text style={[styles.infoValue, { fontFamily: typography.fontFamilyBody }]}>{order?.payment?.method || order?.order?.payment_method}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionCard}>
        <MaterialIcons name="info-outline" size={20} color={colors.primary} />
        <Text style={[styles.instructionText, { fontFamily: typography.fontFamilyBody }]}>
          Upload a clear screenshot of your eSewa payment as proof. Only JPG/PNG under 5MB.
        </Text>
      </View>

      {/* Image Picker */}
      <Button
        label={image ? 'Change Screenshot' : 'Select Screenshot'}
        variant="ghost"
        icon="image"
        block
        onPress={pickImage}
      />

      {/* Preview */}
      {image ? (
        <View style={styles.previewBox}>
          <Image source={image} style={styles.previewImg} contentFit="contain" />
        </View>
      ) : null}

      {/* Upload Button */}
      <Button
        label="Upload Proof"
        variant="primary"
        icon="cloud-upload"
        block
        loading={uploading}
        disabled={!image}
        onPress={handleUpload}
        style={{ marginTop: 8 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  infoTitle: {
    fontSize: typography.size.lg,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.size.sm,
    fontWeight: '700',
    color: colors.text,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    padding: 14,
    borderRadius: radius.lg,
    marginBottom: 16,
    gap: 10,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text,
    lineHeight: 20,
  },
  previewBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    overflow: 'hidden',
    marginTop: 16,
    ...shadows.sm,
  },
  previewImg: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
});
