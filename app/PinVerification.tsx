import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Animated, 
  TouchableOpacity,
  Dimensions,
  Alert,
  BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PinVerification = () => {
  const [pin, setPin] = useState('');
  const { user } = useUser();
  const shakingAnimation = useRef(new Animated.Value(0)).current;
  const dotScale = useRef([...Array(4)].map(() => new Animated.Value(1))).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const animateDot = (index: number) => {
    Animated.sequence([
      Animated.timing(dotScale[index], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(dotScale[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakingAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakingAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakingAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakingAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const verifyPin = async (inputPin: string) => {
    try {
      const storedPin = await AsyncStorage.getItem(`userPin_${user?.id}`);
      if (inputPin === storedPin) {
        router.replace('/(authenticated)/(tabs)/home');
      } else {
        shakeAnimation();
        setPin('');
        Alert.alert('Invalid PIN', 'Please try again');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handlePinChange = (value: string) => {
    if (value.length <= 4) {
      setPin(value);
      if (value.length > pin.length) {
        animateDot(value.length - 1);
      }
      if (value.length === 4) {
        verifyPin(value);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={50} color="#007AFF" />
        <Text style={styles.title}>Enter PIN</Text>
        <Text style={styles.subtitle}>
          Please enter your PIN to access the app
        </Text>
      </View>

      <Animated.View 
        style={[
          styles.pinContainer,
          { transform: [{ translateX: shakingAnimation }] }
        ]}
      >
        {[...Array(4)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.pinDot,
              { transform: [{ scale: dotScale[index] }] },
              pin.length > index && styles.pinDotFilled
            ]}
          />
        ))}
      </Animated.View>

      <TextInput
        ref={inputRef}
        value={pin}
        onChangeText={handlePinChange}
        maxLength={4}
        keyboardType="numeric"
        style={styles.hiddenInput}
        secureTextEntry
        autoFocus
      />

      <TouchableOpacity 
        style={styles.forgotButton}
        onPress={() => Alert.alert('Contact Support', 'Please contact support to reset your PIN')}
      >
        <Text style={styles.forgotButtonText}>Forgot PIN?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    margin: 10,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#007AFF',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  forgotButton: {
    marginTop: 30,
    padding: 10,
  },
  forgotButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default PinVerification;