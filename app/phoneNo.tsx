import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const PhoneInput = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { user } = useUser();
  const inputRef = useRef<TextInput>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if we're returning from a failed PIN creation
    checkPreviousAttempt();
  }, []);

  const checkPreviousAttempt = async () => {
    try {
      const savedNumber = await AsyncStorage.getItem(`userPhone_${user?.id}`);
      if (savedNumber) {
        setPhoneNumber(savedNumber);
      }
    } catch (error) {
      console.error('Error checking previous attempt:', error);
    }
  };

  const validatePhoneNumber = (number: string) => {
    // Check if the number is a valid Kenyan format (must start with 254 followed by 9 digits)
    const phoneRegex = /^254[7]\d{8}$/;
    return phoneRegex.test(number);
  };

  const handlePhoneNumberChange = (text: string) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/[^\d]/g, '');
    
    // Always ensure the number starts with 254
    let formatted = cleaned;
    if (!cleaned.startsWith('254')) {
      // If user enters 7XXXXXXXX, prefix it with 254
      if (cleaned.startsWith('7')) {
        formatted = `254${cleaned}`;
      } else {
        // If user deletes into the 254 prefix, preserve it
        formatted = `254${cleaned.slice(Math.max(0, cleaned.length - 9))}`;
      }
    }
    
    // Update state with the formatted number
    setPhoneNumber(formatted);
  };

  const handleContinue = async () => {

    Keyboard.dismiss();

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Kenyan phone number starting with 7',
        [{ text: 'OK', onPress: () => inputRef.current?.focus() }]
      );
      return;
    }

    setIsLoading(true);
    try {
        console.log('Storing phone number:', phoneNumber);
        await AsyncStorage.setItem(`userPhone_${user?.id}`, phoneNumber);
        console.log('Storage key:', `userPhone_${user?.id}`);
      // Clear any previous error state
      await AsyncStorage.removeItem(`phoneInputError_${user?.id}`);
      
      // Store the phone number
           
      // Navigate to PIN creation
      router.push('/pincreation');
    } catch (error) {
      console.error('Error saving phone number:', error);
      Alert.alert(
        'Error',
        'Failed to process phone number. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Format the display number for the input field (removing the 254 prefix)
  const displayNumber = phoneNumber.replace(/^254/, '');
  const isButtonDisabled = !validatePhoneNumber(phoneNumber) || isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Enter Your Number</Text>
            <Text style={styles.subtitle}>
              We'll use this to secure your wallet and verify transactions
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <View 
              style={[
                styles.inputWrapper,
                isInputFocused && styles.inputWrapperFocused
              ]}
            >
              <Text style={styles.prefix}>🇰🇪 +254</Text>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={displayNumber}
                onChangeText={handlePhoneNumberChange}
                placeholder="7XXXXXXXX"
                keyboardType="phone-pad"
                maxLength={9}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholderTextColor="#A0A0A0"
              />
            </View>
            
            <Text style={styles.helperText}>
              Enter your Kenyan mobile number starting with 7
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.button,
              isButtonDisabled && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.privacyText}>
            By continuing, you agree to receive SMS messages for verification
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#F9F9F9',
  },
  inputWrapperFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  prefix: {
    fontSize: 18,
    color: '#000000',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#000000',
    padding: 0,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    marginLeft: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 40,
    lineHeight: 20,
  }
});

export default PhoneInput;