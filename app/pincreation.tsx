import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [step, setStep] = useState(1); // 1 for initial PIN, 2 for confirmation
  const { user } = useUser();
  const navigation = useNavigation();
  const API_URL = 'YOUR_API_URL'; // Replace with your API URL

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

const validateAndCreateWallet = async (confirmedPin: string) => {
  if (pin !== confirmedPin) {
    Alert.alert(
      'PIN Mismatch',
      'The PINs do not match. Please try again.',
      [{ text: 'OK', onPress: () => resetPinCreation() }]
    );
    return;
  }

  try {
    // Store PIN securely using Expo SecureStore
    await SecureStore.setItemAsync('userPIN', pin);
    
    // Store PIN using AsyncStorage
    await AsyncStorage.setItem(`userPin_${user?.id}`, pin);

    // Navigate to home screen
    router.push('/(tabs)/home');
    
  } catch (error) {
    Alert.alert(
      'Error',
      'Failed to save PIN. Please try again.',
      [{ text: 'OK', onPress: () => resetPinCreation() }]
    );
  }
};

  const resetPinCreation = () => {
    setPin('');
    setConfirmPin('');
    setStep(1);
  };

  return (
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
});

export default pincreation;