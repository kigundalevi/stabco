// app/index.js
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from "expo-web-browser";
import React from 'react';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
 

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

const google = React.useCallback(async () => {
  try {
    const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
      redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
    })

    // If sign in was successful, set the active session
    if (createdSessionId) {
      setActive!({ session: createdSessionId })
    } else {
      // Use signIn or signUp returned from startOAuthFlow
      // for next steps, such as MFA
    }
  } catch (err) {
    // See https://clerk.com/docs/custom-flows/error-handling
    // for more info on error handling
    console.error(JSON.stringify(err, null, 2))
  }
}, [])

  return (
    <View style={styles.container}>
      {/* Logo Circle */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <View style={styles.innerCircle} />
        </View>
      </View>

      {/* Title Text */}
      <Text style={styles.titleText}>FAST </Text>
      <Text style={styles.titleText}>FREE</Text>
      <Text style={styles.titleText}>SECURE</Text>

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
        <Link href="/privacy" style={styles.linkText}>
          Privacy Policy
        </Link>
        <Text style={styles.policyText}> & </Text>
        <Link href="/biometric-privacy" style={styles.linkText}>
          Biometric Privacy Notice
        </Link>
      </View>
      <View style={styles.termsContainer}>
        <Text style={styles.policyText}>Continue to accept the </Text>
        <Link href="/terms" style={styles.linkText}>
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
    marginBottom: 30,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    textAlign: 'center',
    marginVertical: 5,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#4169E1',
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