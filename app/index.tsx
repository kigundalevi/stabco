import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { Link, router } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const index = () => {
  useEffect(() => {
    checkIfAlreadyOnboarded();
  }, []);

  const checkIfAlreadyOnboarded = async () => {
    try {
      const value = await AsyncStorage.getItem('hasOnboarded');
      
      if (value !== null && value === 'true') {
        // User has already onboarded, redirect to signup
        router.push('/signup');
      }
    } catch (error) {
      console.log('Error checking onboarding status:', error);
    }
  };

  const handleDone = async () => {
    try {
      // Set the flag indicating user has completed onboarding
      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.push('/signup');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const handleSkip = async () => {
    try {
      // Even if user skips, we still mark them as onboarded
      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.push('/signup');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Onboarding
        containerStyles={{ paddingHorizontal: 15 }}
        bottomBarHighlight={false}
        onDone={handleDone}
        onSkip={handleSkip}
        pages={[
          {
            backgroundColor: 'whitesmoke',
            image: (
              <View>
                <Image
                  style={styles.lottie}
                  source={require('../assets/images/rb_68859.png')}
                />
              </View>
            ),
            title: 'Instant',
            subtitle: 'Send and revieve money instantly with zero fees',
          },
          {
            backgroundColor: '#C5C8FF',
            image: (
              <View>
                <Image
                  style={styles.lottie}
                  source={require('../assets/images/rb_79797.png')}
                />
              </View>
            ),
            title: 'Secure',
            subtitle: 'secure your accouunt with a personalized pin and wallet system',
          },
          {
            backgroundColor: '#385A64',
            image: (
              <View>
                <Image
                  style={styles.lottie}
                  source={require('../assets/images/rb_7464.png')}
                />
              </View>
            ),
            title: 'Realtime',
            subtitle: 'Manage your money with real time tracking and analytics',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lottie: {
    width: width * 0.9,
    resizeMode: 'contain',
    height: width,
  },
  donebtn: {
    color: 'white',
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: '100%',
    borderBottomLeftRadius: '100%',
  },
});

export default index;