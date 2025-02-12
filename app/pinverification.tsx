import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = width * 0.2;

const PinVerification = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const segments = useSegments();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const loadingAnimations = [...Array(4)].map(() => useRef(new Animated.Value(1)).current);

  // Check if we're already in the authenticated group
  useEffect(() => {
    const inAuthGroup = segments[0] === '(authenticated)';
    if (inAuthGroup) {
      // If we're already in auth group, go to home
      router.replace('/(authenticated)/(tabs)/home');
    }
  }, [segments]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startLoadingAnimation = () => {
    const animations = loadingAnimations.map((animation, index) => {
      return Animated.sequence([
        Animated.delay(index * 200),
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.loop(
      Animated.stagger(200, animations)
    ).start();
  };

  const stopLoadingAnimation = () => {
    loadingAnimations.forEach(animation => {
      animation.stopAnimation();
      animation.setValue(1);
    });
  };

  const handleNumberPress = (number: string) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (!isLoading) {
      setPin(pin.slice(0, -1));
    }
  };

  const verifyPin = async (inputPin: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    startLoadingAnimation();

    try {
      const storedPin = await AsyncStorage.getItem(`userPin_${user.id}`);
      
      if (inputPin === storedPin) {
        // Small delay to show the loading animation
        await new Promise(resolve => setTimeout(resolve, 800));
        router.replace('/(authenticated)/(tabs)/home');
      } else {
        setIsLoading(false);
        stopLoadingAnimation();
        shake();
        setPin('');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setIsLoading(false);
      stopLoadingAnimation();
      setPin('');
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
    }
  };

  const handleForgotPin = async () => {
    if (!user?.id) return;
    
    try {
      // Clear the PIN
      await AsyncStorage.removeItem(`userPin_${user.id}`);
      // Navigate to PIN creation
      router.replace('/pincreation');
    } catch (error) {
      console.error('Error handling forgot PIN:', error);
      Alert.alert('Error', 'Failed to reset PIN. Please try again.');
    }
  };

  const renderNumber = (number: string) => (
    <TouchableOpacity
      style={styles.numberButton}
      onPress={() => !isLoading && handleNumberPress(number)}
      disabled={isLoading}
    >
      <Text style={[styles.numberText, isLoading && styles.disabledText]}>
        {number}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={50} color="#007AFF" />
        <Text style={styles.title}>Enter your PIN</Text>
      </View>

      <Animated.View 
        style={[
          styles.pinContainer,
          {
            transform: [{
              translateX: shakeAnimation
            }]
          }
        ]}
      >
        {loadingAnimations.map((animation, index) => (
          <Animated.View
            key={index}
            style={[
              styles.pinDot,
              pin.length > index && styles.pinDotFilled,
              {
                transform: [{
                  scale: animation
                }]
              }
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.keypadContainer}>
        <View style={styles.keypadRow}>
          {renderNumber('1')}
          {renderNumber('2')}
          {renderNumber('3')}
        </View>
        <View style={styles.keypadRow}>
          {renderNumber('4')}
          {renderNumber('5')}
          {renderNumber('6')}
        </View>
        <View style={styles.keypadRow}>
          {renderNumber('7')}
          {renderNumber('8')}
          {renderNumber('9')}
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.numberButton} disabled={isLoading}>
            <Text style={styles.numberText}></Text>
          </TouchableOpacity>
          {renderNumber('0')}
          <TouchableOpacity 
            style={styles.numberButton}
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Ionicons 
              name="backspace-outline" 
              size={24} 
              color={isLoading ? "#666" : "#fff"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.forgotButton}
        onPress={handleForgotPin}
        disabled={isLoading}
      >
        <Text style={[styles.forgotButtonText, isLoading && styles.disabledText]}>
          Forgot PIN?
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginTop: 20,
    fontWeight: '500',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    margin: 10,
  },
  pinDotFilled: {
    backgroundColor: '#007AFF',
  },
  keypadContainer: {
    width: width * 0.8,
    aspectRatio: 3/4,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  numberButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
  },
  disabledText: {
    color: '#666',
  },
  forgotButton: {
    marginTop: 30,
    padding: 10,
  },
  forgotButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PinVerification;