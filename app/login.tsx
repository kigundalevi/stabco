import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Button, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { defaultStyles } from '@/constants/styles'
import * as WebBrowser from 'expo-web-browser'
import Colors from '@/constants/Colors';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOAuth , useUser} from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { ClerkProvider, SignedIn, useClerk } from '@clerk/clerk-react';


  export const useWarmUpBrowser = () => {
        React.useEffect(() => {
          // Warm up the android browser to improve UX
          // https://docs.expo.dev/guides/authentication/#improving-user-experience
          void WebBrowser.warmUpAsync()
          return () => {
            void WebBrowser.coolDownAsync()
          }
        }, [])
      }

      WebBrowser.maybeCompleteAuthSession();

const signup = () => { 
  const { signOut } = useClerk();
  useWarmUpBrowser();
    const [countryCode, setCountryCode]=useState('+254');
    const [phoneNumber, setphoneNumber]=useState('');
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

    const [isLoading,setIsLoading] = useState(false);

    const onsocilaloginpress = React.useCallback(async () => {
      try {
        setIsLoading(true)
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
      } finally {
        setIsLoading(false)
      }
    }, [])
  
    
  return (
    <KeyboardAvoidingView style={{flex:1}} behavior='padding' keyboardVerticalOffset={keyboardVerticalOffset}>

    <View style={defaultStyles.container}>
      
      <Text style={defaultStyles.header}>Welcome back!</Text>
      <Text style={defaultStyles.descriptionText}>Enter your phone number associated with ac</Text>
      <View style={styles.inputContainer}>
      <TextInput
           style={styles.input}
           placeholder='country code'
           placeholderTextColor={Colors.gray}
           value={countryCode}
           keyboardType='numeric'/>
        <TextInput
           style={[styles.input,{ flex:1 }]}
           placeholder='Mobile number'
           keyboardType='numeric'
           value={phoneNumber}
           onChangeText={setphoneNumber}
           />
      </View>
          <TouchableOpacity
             style={[defaultStyles.pillButton,
                phoneNumber !== '' ? styles.enabled : styles.disabled,
                { marginBottom: 20 },
            ]}
             >
                 <Text style={defaultStyles.buttonText}>Continue</Text>
             </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View
              style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor:'black' }}
            />
            <Text style={{ color: Colors.gray, fontSize: 20 }}>or</Text>
            <View
              style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor:'black' }}
            />
          </View>
          <TouchableOpacity
              style={[defaultStyles.pillButton, { backgroundColor: '#fff', marginBottom: 20 ,flexDirection:'row',alignItems:'center'}]}  
              onPress={onsocilaloginpress}>
                {isLoading ? <ActivityIndicator color={Colors.dark} /> : null}
              <Ionicons name="logo-google" size={24} color="#000" />
              <Text style={[defaultStyles.buttonText, { color: '#000', marginLeft: 8 }]}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[defaultStyles.pillButton, { backgroundColor: '#fff',flexDirection:'row',alignItems:'center'}]}
            >
              <Ionicons name="logo-apple" size={24} color="#000" />
              <Text style={[defaultStyles.buttonText, { color: '#000', marginLeft: 8 }]}>Sign in with Apple</Text>
            </TouchableOpacity>
          <SignedIn>
            <Text style={defaultStyles.textLink}>you have signed in</Text>
            <Button title='Sign out' onPress={() =>signOut()} />
          </SignedIn>
    </View>
    </KeyboardAvoidingView>
  );
  };
       const styles = StyleSheet.create({
        inputContainer:{
            marginVertical:40,
            flexDirection:'row',
        },
        input:{ 
           backgroundColor:'white',
           padding:20,
           borderRadius:16,
           fontSize:20,
           marginRight:10,
        },
        enabled:{
            backgroundColor:'black',
        },
        disabled:{
            backgroundColor:'gray',
        }
       });

export default signup;