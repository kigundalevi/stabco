import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    checkIfAlreadyOnboarded();
  }, [isLoading]);

  const checkIfAlreadyOnboarded = async () => {
    try {
      const value = await AsyncStorage.getItem('hasOnboarded');
      
      if (value !== null && value === 'true') {
        // User has already onboarded, redirect to signup
        router.replace('/signup');
      } else {
        // User hasn't onboarded, show onboarding screens
        setShouldShowOnboarding(true);
      }
    } catch (error) {
      console.log('Error checking onboarding status:', error);
      // If there's an error, show onboarding as fallback
      setShouldShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.replace('/signup');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.replace('/signup');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C4DFF" />
      </SafeAreaView>
    );
  }

  if (!shouldShowOnboarding) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
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
            subtitle: 'Send and receive money instantly with zero fees',
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
            subtitle: 'Secure your account with a personalized pin and wallet system',
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  lottie: {
    width: width * 0.9,
    resizeMode: 'contain',
    height: width,
  },
});

export default Index;