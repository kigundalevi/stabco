import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { defaultStyles } from '@/constants/styles'
import Colors from '@/constants/Colors';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

enum SigninType {
    Google,
    Apple,
    Phone
}

const signup = () => { 
    const [countryCode, setCountryCode]=useState('+254');
    const [phoneNumber, setphoneNumber]=useState('');
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

         const onSignIn = async(type:SigninType) =>{
          if(type === SigninType.Phone){
              console.log('Sign in with phone number');
         };
        }

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
             onPress={()=> onSignIn(SigninType.Phone)}>
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
              onPress={() =>onSignIn(SigninType.Google)}>
              <Ionicons name="logo-google" size={24} color="#000" />
              <Text style={[defaultStyles.buttonText, { color: '#000', marginLeft: 8 }]}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[defaultStyles.pillButton, { backgroundColor: '#fff',flexDirection:'row',alignItems:'center'}]}
              onPress={()=>onSignIn(SigninType.Apple)}>
              <Ionicons name="logo-apple" size={24} color="#000" />
              <Text style={[defaultStyles.buttonText, { color: '#000', marginLeft: 8 }]}>Sign in with Apple</Text>
            </TouchableOpacity>
      
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