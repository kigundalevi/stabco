// app/index.js
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from "expo-web-browser";
import React from 'react';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
 

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Warm up the android browser to improve UX
    // https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();


export default function LoginScreen() {
  const [loading, setLoading] = useState(false);


useWarmUpBrowser()

const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

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
    const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
      redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
    });
    console.log('user created');

    if (createdSessionId) {
      setActive!({ session: createdSessionId });
      
      // Check if user has created PIN
      const hasPinCreated = await checkPinCreated(createdSessionId);
      
      if (hasPinCreated) {
        router.push('./(authenticated)/(tabs)/home');
      } else {
        router.push('/phoneNo');
      }
    }
  } catch (err) {
    console.error(JSON.stringify(err, null, 2));
  }
}, [])

  return (
    <View style={styles.container}>
      {/* Logo Circle */}
      <View style={styles.logoContainer}>
      <Image source={require('../../assets/images/ICON.png')} style = {styles.logoContainer}/>
      </View>

      {/* Title Text */}
      <Text style={styles.titleText}>LOW </Text>
      <Text style={styles.titleText}>TRANSACTION RATES</Text>
      <Text style={styles.titleText}>FOR ALL</Text>

      {/* Google Sign In Button */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={google}
        disabled={loading}
      >
        <Ionicons name="logo-google" size={24} color="white" style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Other Options Button */}
      <TouchableOpacity style={styles.otherOptionsButton}>
        <Text style={styles.otherOptionsText}>Other options</Text>
      </TouchableOpacity>

      {/* Privacy Policy and Terms */}
      <View style={styles.policyContainer}>
        <Text style={styles.policyText}>Read our </Text>
        <Link href="./privacy" style={styles.linkText} >
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
    backgroundColor: '#223F57',
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