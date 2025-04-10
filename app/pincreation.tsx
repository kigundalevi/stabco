import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Custom PIN Input component
const PinInput = ({ value, onChange, maxLength = 4 }: { value: string; onChange: (text: string) => void; maxLength?: number }) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const showKeyboard = () => {
    inputRef.current?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={showKeyboard}>
      <View style={styles.pinContainer}>
        {[...Array(maxLength)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              value.length > index && styles.pinDotFilled
            ]}
          />
        ))}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          maxLength={maxLength}
          keyboardType="numeric"
          style={[
            styles.hiddenInput,
            { position: 'absolute', opacity: 0 }
          ]}
          secureTextEntry
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const pincreation = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Create PIN, Step 2: Confirm PIN
  const { user } = useUser();
  const navigation = useNavigation();
  const router = useRouter();
  const API_URL = 'https://hidden-eyrie-76070-9c205d882c7e.herokuapp.com';  

  const handlePinChange = (value: string): void => {
    if (step === 1) {
      setPin(value);
      if (value.length === 4) {
        setStep(2);
      }
    } else {
      setConfirmPin(value);
      if (value.length === 4) {
        validateAndCreateWallet(value);
      }
    }
  };

  const resetPinCreation = () => {
    setPin('');
    setConfirmPin('');
    setStep(1);
  };

  const validateAndCreateWallet = async (confirmedPin: string) => {
    // Add debugging to see the actual values
    console.log('Original PIN:', pin);
    console.log('Confirmed PIN:', confirmedPin);
    
    if (pin !== confirmedPin) {
      // Show the actual PIN values in the alert to debug
      Alert.alert(
        'PIN Mismatch',
        `The PINs do not match. First PIN: ${pin}, Second PIN: ${confirmedPin}`,
        [{ text: 'OK', onPress: () => resetPinCreation() }]
      );
      return;
    }
  
    // Retrieve the user's name and stored phone number
    const name = user?.fullName;
    const phoneNumber = await AsyncStorage.getItem(`userPhone_${user?.id}`);
      
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not found. Please try again.');
      router.replace('/phoneNo'); // Use replace instead of push
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/create`, { 
        name, 
        pin,
        phoneNumber
      });

       
      // Only proceed if the API call was successful
      if (response.data.success) {
        // Securely store the PIN
        await SecureStore.setItemAsync('userPIN', pin);
        await AsyncStorage.setItem(`userPin_${user?.id}`, pin);
        
         
        // Navigate to the home screen
        router.replace('./(authenticated)/(tabs)/home');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to create wallet. Please try again.';
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ 
          text: 'OK', 
          onPress: () => {
            resetPinCreation();
            router.replace('/phoneNo');
          }
        }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>
    {isLoading && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )}
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 1 ? 'Create Your PIN' : 'Confirm Your PIN'}
      </Text>
      <Text style={styles.subtitle}>
        {step === 1 
          ? 'Enter a 4-digit PIN to secure your wallet'
          : 'Re-enter your PIN to confirm'
        }
      </Text>
      <PinInput
        value={step === 1 ? pin : confirmPin}
        onChange={handlePinChange}
      />
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    margin: 10,
  },
  pinDotFilled: {
    backgroundColor: '#000',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default pincreation;