import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { defaultStyles } from '@/constants/styles'
import Colors from '@/constants/Colors';
import { Link } from 'expo-router';

const signup = () => { 
    const [countryCode, setCountryCode]=useState('+254');
    const [phoneNumber, setphoneNumber]=useState('');
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

    const onSignup = async() =>{}

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior='padding' keyboardVerticalOffset={keyboardVerticalOffset}>

    <View style={defaultStyles.container}>
      
      <Text style={defaultStyles.header}>Lets get started</Text>
      <Text style={defaultStyles.descriptionText}>Enter your phone number. We will send you a confirmation code there</Text>
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
          <Link href={'/login'} replace asChild>
          <TouchableOpacity>
            <Text style={defaultStyles.textLink}>Already have an account? Login</Text>
          </TouchableOpacity>
          </Link>
             
             <View style={{flex:1}}/>

          <TouchableOpacity
             style={[defaultStyles.pillButton,
                phoneNumber !== '' ? styles.enabled : styles.disabled,
                { marginBottom: 20 },
            ]}
             onPress={onSignup}>
                 <Text style={defaultStyles.buttonText}>Sign up</Text>
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