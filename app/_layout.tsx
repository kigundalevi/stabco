import { useEffect, useState } from 'react';
import { BackHandler, ToastAndroid, Platform, ActivityIndicator, View } from 'react-native';
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const [exitApp, setExitApp] = useState(false);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      const inAuthGroup = segments[0] === '(authenticated)';
      
      if (inAuthGroup) {
        if (exitApp) {
          BackHandler.exitApp();
          return false;
        }
        if (Platform.OS === 'android') {
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        }
        setExitApp(true);
        setTimeout(() => setExitApp(false), 2000);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [exitApp, segments]);
     
  // Auth state management combined with PIN check:
  useEffect(() => {
    if (!isLoaded) return;

    // Determine if we are in the authenticated group
    const inAuthGroup = segments[0] === '(authenticated)';

    if (isSignedIn && user) {
      // Check for a stored PIN
      const checkUserPin = async () => {
        try {
          const hasPin = await AsyncStorage.getItem(`userPin_${user.id}`);
          if (hasPin) {
            // If a PIN exists and we are not already in the authenticated group, push to home.
            if (!inAuthGroup) {
              router.replace('/(authenticated)/(tabs)/home');
            }
          } else {
            // No PIN found – push to pincreation.
            router.replace('/pincreation');
          }
        } catch (error) {
          console.error('Error checking PIN:', error);
        }
      };
      checkUserPin();
    } else if (!isSignedIn && segments[0] !== '(public)') {
      router.replace('/(public)/signup');
    }
  }, [isLoaded, isSignedIn, user, segments, router]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
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

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default RootLayout;