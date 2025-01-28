import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ClerkProvider, ClerkLoaded, SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import { Slot, Redirect, Stack, Link, router } from 'expo-router';
import { tokenCache } from '@/cache';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const checkUserPin = async () => {
      if (isSignedIn && user) {
        try {
          const hasPin = await AsyncStorage.getItem(`userPin_${user.id}`);
          if (hasPin) {
            router.push('/(tabs)/home');
          } else {
            router.push('/pincreation');
          }
        } catch (error) {
          console.error('Error checking PIN:', error);
        }
      }
    };
    checkUserPin();
  }, [isSignedIn, user]);

  if (!isSignedIn) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
         <Stack.Screen name="signup" />
      </Stack>
    );
  }

  return <Slot />;
};

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default RootLayout;