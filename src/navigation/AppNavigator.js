import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import ProductListScreen from '../screens/shop/ProductListScreen';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import CategoriesScreen from '../screens/shop/CategoriesScreen';
import TodayDealScreen from '../screens/shop/TodayDealScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import AddressListScreen from '../screens/profile/AddressListScreen';
import AddressFormScreen from '../screens/profile/AddressFormScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import OrderSuccessScreen from '../screens/checkout/OrderSuccessScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import InvoiceScreen from '../screens/orders/InvoiceScreen';
import PaymentProofScreen from '../screens/orders/PaymentProofScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import SupportScreen from '../screens/support/SupportScreen';
import ContactScreen from '../screens/support/ContactScreen';
import AboutScreen from '../screens/static/AboutScreen';
import PrivacyScreen from '../screens/static/PrivacyScreen';
import TermsScreen from '../screens/static/TermsScreen';
import ShippingScreen from '../screens/static/ShippingScreen';
import ReturnsScreen from '../screens/static/ReturnsScreen';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import { colors, paperTheme } from '../theme';

const Tab = createBottomTabNavigator();
const ShopStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function ShopStackNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <ShopStack.Navigator
      screenOptions={{
        headerTintColor: colors.ice,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        headerStatusBarHeight: insets.top,
      }}
    >
      <ShopStack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Shop' }} />
      <ShopStack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
      <ShopStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({ title: route.params?.name || 'Product' })}
      />
      <ShopStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <ShopStack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ title: 'Order Placed', headerBackVisible: false }} />
      <ShopStack.Screen name="TodayDeal" component={TodayDealScreen} options={{ title: "Today's Deal" }} />
    </ShopStack.Navigator>
  );
}

function CartStackNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <CartStack.Navigator
      screenOptions={{
        headerTintColor: colors.ice,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        headerStatusBarHeight: insets.top,
      }}
    >
      <CartStack.Screen name="CartMain" component={CartScreen} options={{ title: 'Shopping Cart' }} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <CartStack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ title: 'Order Placed', headerBackVisible: false }} />
      <CartStack.Screen name="AddressForm" component={AddressFormScreen} options={({ route }) => ({ title: route.params?.mode === 'create' ? 'Add Address' : 'Edit Address' })} />
      <CartStack.Screen name="PaymentProof" component={PaymentProofScreen} options={{ title: 'Payment Proof' }} />
    </CartStack.Navigator>
  );
}

function AccountStackNavigator() {
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <AccountStack.Navigator
      screenOptions={{
        headerTintColor: colors.ice,
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800' },
        headerStatusBarHeight: insets.top,
      }}
    >
      {isAuthenticated ? (
        <>
          <AccountStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Account' }} />
          <AccountStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
          <AccountStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
          <AccountStack.Screen name="Invoice" component={InvoiceScreen} options={{ title: 'Invoice' }} />
          <AccountStack.Screen name="PaymentProof" component={PaymentProofScreen} options={{ title: 'Payment Proof' }} />
          <AccountStack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Wishlist' }} />
          <AccountStack.Screen name="Addresses" component={AddressListScreen} options={{ title: 'Addresses' }} />
          <AccountStack.Screen name="AddressForm" component={AddressFormScreen} options={({ route }) => ({ title: route.params?.mode === 'create' ? 'Add Address' : 'Edit Address' })} />
          <AccountStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
          <AccountStack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
          <AccountStack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact Us' }} />
          <AccountStack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
          <AccountStack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy Policy' }} />
          <AccountStack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms & Conditions' }} />
          <AccountStack.Screen name="Shipping" component={ShippingScreen} options={{ title: 'Shipping Info' }} />
          <AccountStack.Screen name="Returns" component={ReturnsScreen} options={{ title: 'Returns Policy' }} />
        </>
      ) : (
        <>
          <AccountStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
          <AccountStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
          <AccountStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
          <AccountStack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
        </>
      )}
    </AccountStack.Navigator>
  );
}

function CartBadge({ color, size, focused }) {
  const { count } = useCart();
  return (
    <View>
      <MaterialCommunityIcons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
      {count > 0 ? (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -8,
          backgroundColor: colors.danger,
          borderRadius: 9,
          minWidth: 18,
          height: 18,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{count > 99 ? '99+' : count}</Text>
        </View>
      ) : null}
    </View>
  );
}

function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSoft,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ color, size, focused }) => {
          const map = {
            HomeTab: { focused: 'home', unfocused: 'home-outline' },
            Shop: { focused: 'store', unfocused: 'store-outline' },
            CartTab: { focused: 'cart', unfocused: 'cart-outline' },
            CategoriesTab: { focused: 'shape', unfocused: 'shape-outline' },
            Account: { focused: 'account', unfocused: 'account-outline' },
          };
          const icons = map[route.name] || { focused: 'circle', unfocused: 'circle-outline' };
          return <MaterialCommunityIcons name={focused ? icons.focused : icons.unfocused} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Shop" component={ShopStackNavigator} options={{ title: 'Shop' }} />
      <Tab.Screen
        name="CartTab"
        component={CartStackNavigator}
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size, focused }) => <CartBadge color={color} size={size} focused={focused} />,
        }}
      />
      <Tab.Screen name="CategoriesTab" component={CategoriesScreen} options={{ title: 'Categories' }} />
      <Tab.Screen name="Account" component={AccountStackNavigator} options={{ title: 'Account' }} />
    </Tab.Navigator>
  );
}

function RootGate() {
  const { bootstrapping } = useAuth();
  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  return <RootTabs />;
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <RootGate />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
