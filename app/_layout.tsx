import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ClerkProvider, ClerkLoaded, SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import { Slot, Redirect, Stack, Link ,router} from 'expo-router';
import { tokenCache } from '@/cache';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

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
        <RootLayoutNav />
      </ClerkLoaded>
    </ClerkProvider>
  );
};

const RootLayoutNav = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const checkPinCreated = async (userId: string) => {
    try {
      const hasPin = await AsyncStorage.getItem(`userPin_${userId}`);
      return hasPin !== null;
    } catch (error) {
      console.error('Error checking PIN:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkUserPin = async () => {
      if (isSignedIn && user) {
        const hasPinCreated = await checkPinCreated(user.id);
        if (!hasPinCreated) {
          router.push('/pincreation');
        }
      }
    };
    
    checkUserPin();
  }, [isSignedIn, user]);

  if (isSignedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Not signed in - show public routes without headers
  return (

    <Stack>
      <Stack.Screen name="signup" options={{
        statusBarBackgroundColor: 'black',
         title: '',
         headerBackTitle: '',
         headerShadowVisible: false,
         headerStyle: { backgroundColor: 'black' },
         headerRight: () => (
           <Link href={'/help'} asChild>
             <TouchableOpacity>
               <Ionicons name="help-circle-outline" size={34} color= "white" />
             </TouchableOpacity>
           </Link>
         ),
      }} />
        <Stack.Screen 
        name="PinCreation" 
        options={{ 
          headerShown: false ,
          headerBackTitle: '',
          headerShadowVisible: false,
          headerRight: () => (
            <Link href={'/help'} asChild>
              <TouchableOpacity>
                <Ionicons name="help-circle-outline" size={34} color= "white" />
              </TouchableOpacity>
            </Link>)
        }}
      />
    </Stack>
  );
};

export default RootLayout;