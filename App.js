import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Fraunces_400Regular, Fraunces_700Bold, Fraunces_800ExtraBold, Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync, setupNotificationHandler } from './src/services/notification';
import { api } from './src/api/client';

setupNotificationHandler();

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
    Fraunces_800ExtraBold,
    Fraunces_900Black,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await AsyncStorage.setItem('ars.push.token', token);
          try {
            await api.post('/user/push-token', { token });
          } catch {
            // push token registration is best-effort
          }
        }
      } catch {
        // notifications permission denied or unavailable
      }
    })();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
