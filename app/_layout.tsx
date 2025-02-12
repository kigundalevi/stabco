import { useEffect, useState } from 'react';
import { BackHandler, ToastAndroid, Platform, ActivityIndicator, View } from 'react-native';
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenCache } from '@/cache';

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
  // Modify your useEffect for auth state management
// Modify your useEffect for auth state management
useEffect(() => {
  if (!isLoaded) return;

  const inAuthGroup = segments[0] === '(authenticated)';

  const checkAuthState = async () => {
    if (isSignedIn && user) {
      try {
        const hasPin = await AsyncStorage.getItem(`userPin_${user.id}`);
        const currentRoute = segments[0] as string;
        
        // If user has a PIN set
        if (hasPin) {
          // User is in auth group but needs to verify PIN first
          if (!inAuthGroup && currentRoute !== 'pinverification') {
            router.replace('./pinverification');
            return;
          }
          
          // User has verified PIN and can access authenticated routes
          if (inAuthGroup && currentRoute === 'pinverification') {
            router.replace('/(authenticated)/(tabs)/home');
            return;
          }
        } else {
          // No PIN set - handle PIN creation flow
          
          // Allow user to stay on PIN creation screen if they're there
          if (currentRoute === 'pincreation') {
            return;
          }
          
          // Check if phone number exists
          const hasPhone = await AsyncStorage.getItem(`userPhone_${user.id}`);
          
          if (!hasPhone) {
            // No phone number - send to phone number input
            if (currentRoute !== 'phoneNo') {
              router.replace('/phoneNo');
            }
          } else {
            // Has phone but no PIN - send to PIN creation
            router.replace('/pincreation');
          }
        }
      } catch (error) {
        console.error('Error checking PIN:', error);
      }
    } else if (!isSignedIn) {
      // Not signed in - send to signup
      router.replace('/signup');
    }
  };

  checkAuthState();
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
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default RootLayout;