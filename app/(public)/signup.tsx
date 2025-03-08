import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from "expo-web-browser";
import React from 'react';
import { useOAuth, useUser } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useWarmUpBrowser();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  // Check for existing user session and PIN on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        if (user?.id) {
          const hasPin = await AsyncStorage.getItem(`userPin_${user.id}`);
          if (hasPin) {
            router.replace('./pin-verification');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkExistingSession();
  }, [user]);

  const checkPinCreated = async (userId: string) => {
    try {
      const hasPin = await AsyncStorage.getItem(`userPin_${userId}`);
      return hasPin !== null;
    } catch (error) {
      console.error('Error checking PIN:', error);
      return false;
    }
  };

  const google = React.useCallback(async () => {
    try {
      setLoading(true);
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        
        // Store the user ID for PIN verification
        await AsyncStorage.setItem('lastSignedInUser', createdSessionId);
        
        // Check if user has created PIN
        const hasPinCreated = await checkPinCreated(createdSessionId);
        
        if (hasPinCreated) {
          // User has PIN, go to verification
          router.replace('./pin-verification');
        } else {
          // User needs to set up PIN, go to phone number entry first
          router.replace('/phoneNo');
        }
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Rest of your component remains the same
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/images/ICON.png')} style={styles.logoContainer}/>
      </View>

      <Text style={styles.titleText}>LOW </Text>
      <Text style={styles.titleText}>TRANSACTION RATES</Text>
      <Text style={styles.titleText}>FOR ALL</Text>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={google}
        disabled={loading}
      >
        <Ionicons name="logo-google" size={24} color="white" style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.otherOptionsButton}>
        <Text style={styles.otherOptionsText}>Other options</Text>
      </TouchableOpacity>

      <View style={styles.policyContainer}>
        <Text style={styles.policyText}>Read our </Text>
        <Link href="./privacy" style={styles.linkText}>
          Privacy Policy
        </Link>
        <Text style={styles.policyText}> & </Text>
        <Link href="./biometric-privacy" style={styles.linkText}>
          Biometric Privacy Notice
        </Link>
      </View>
      <View style={styles.termsContainer}>
        <Text style={styles.policyText}>Continue to accept the </Text>
        <Link href="./terms" style={styles.linkText}>
          Terms of service
        </Link>
        <Text style={styles.policyText}>.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  logoCircle: {
    width: 60,
    height: 60,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000000',
    position: 'absolute',
    right: 5,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    width: '100%',
    maxWidth: 300,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  otherOptionsButton: {
    marginTop: 15,
    padding: 12,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    backgroundColor:'#223F5738',
    borderRadius:25
  },
  otherOptionsText: {
    color: '#4169E1',
    fontSize: 16,
    fontWeight: '500',
  },
  policyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 40,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 5,
  },
  policyText: {
    color: '#808080',
    fontSize: 14,
  },
  linkText: {
    color: '#4169E1',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});