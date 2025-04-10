import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as React from 'react';
import { router } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Define the types for the custom components
type DotProps = {
  selected: boolean;
};

// Match the expected types from react-native-onboarding-swiper
type SkipButtonProps = {
  skipLabel?: string | React.ReactElement;
  onPress: () => void;
};

type NextButtonProps = {
  nextLabel?: string | React.ReactElement;
  onPress: () => void;
};

type DoneButtonProps = {
  onPress: () => void;
};

// Custom components for the onboarding screens
const CustomDot = ({ selected }: DotProps) => {
  return (
    <View
      style={{
        width: selected ? 20 : 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
        backgroundColor: selected ? '#FF8A65' : '#E0E0E0',
      }}
    />
  );
};

const CustomSkipButton = ({ skipLabel, onPress }: SkipButtonProps) => (
  <TouchableOpacity 
    style={styles.skipButton} 
    onPress={onPress}
  >
    <Text style={styles.skipText}>{typeof skipLabel === 'string' ? skipLabel : 'Skip'}</Text>
  </TouchableOpacity>
);

const CustomNextButton = ({ onPress }: NextButtonProps) => (
  <TouchableOpacity 
    style={styles.nextButton} 
    onPress={onPress}
  >
    <Ionicons name="arrow-forward" size={24} color="white" />
  </TouchableOpacity>
);

const CustomDoneButton = ({ onPress }: DoneButtonProps) => (
  <TouchableOpacity 
    style={styles.nextButton} 
    onPress={onPress}
  >
    <Ionicons name="arrow-forward" size={24} color="white" />
  </TouchableOpacity>
);

const Index = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = React.useState(false);
  const [hasOnboarded, setHasOnboarded] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);

  React.useEffect(() => {
    checkIfAlreadyOnboarded();
  }, []);

  const checkIfAlreadyOnboarded = async () => {
    try {
      // Check if user has completed onboarding
      const onboardingCompleted = await OnboardingManager.hasCompletedOnboarding();
      
      // Check if onboarding should be forced to show
      const forceShow = await OnboardingManager.shouldForceShowOnboarding();
      
      setHasOnboarded(onboardingCompleted);
      
      if (onboardingCompleted && !forceShow) {
        // User has already onboarded and not forcing onboarding
        // Show option to view onboarding or continue to app
        Alert.alert(
          "Welcome Back!",
          "You've already completed onboarding. What would you like to do?",
          [
            {
              text: "Continue to App",
              onPress: () => router.replace('/signup')
            },
            {
              text: "View Onboarding Again",
              onPress: () => setShouldShowOnboarding(true)
            }
          ]
        );
      } else {
        // User hasn't onboarded or is forcing onboarding, show onboarding screens
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

  const clearOnboardingStatus = async () => {
    try {
      await OnboardingManager.clearOnboardingStatus();
      setHasOnboarded(false);
      setShouldShowOnboarding(true);
      Alert.alert("Success", "Onboarding data cleared. You'll see the onboarding screens on next app start.");
    } catch (error) {
      console.log('Error clearing onboarding status:', error);
      Alert.alert("Error", "Failed to clear onboarding data.");
    }
  };

  const handleDone = async () => {
    try {
      await OnboardingManager.markOnboardingComplete();
      router.replace('/signup');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await OnboardingManager.markOnboardingComplete();
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
    return (
      <View style={styles.optionsContainer}>
        <Text style={styles.headerText}>Welcome to StabApp</Text>
        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={() => setShouldShowOnboarding(true)}
        >
          <Text style={styles.optionButtonText}>View Onboarding</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={() => router.replace('/signup')}
        >
          <Text style={styles.optionButtonText}>Continue to App</Text>
        </TouchableOpacity>
        
        {hasOnboarded && (
          <TouchableOpacity 
            style={[styles.optionButton, styles.clearButton]} 
            onPress={clearOnboardingStatus}
          >
            <Text style={styles.clearButtonText}>Clear Onboarding Data</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Onboarding
        containerStyles={styles.onboardingContainer}
        bottomBarHighlight={false}
        onDone={handleDone}
        onSkip={handleSkip}
        DotComponent={CustomDot}
        SkipButtonComponent={CustomSkipButton}
        NextButtonComponent={CustomNextButton}
        DoneButtonComponent={CustomDoneButton}
        pageIndexCallback={(index) => setCurrentPage(index)}
        pages={[
          {
            backgroundColor: '#A5D6F1', // Light blue background
            image: (
              <View style={styles.imageContainer}>
                <Image
                  style={styles.onboardingImage}
                  source={require('../assets/images/rb_68859.png')}
                />
              </View>
            ),
            title: 'Find your place',
            subtitle: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#FFCDD2', // Light pink background
            image: (
              <View style={styles.imageContainer}>
                <Image
                  style={styles.onboardingImage}
                  source={require('../assets/images/rb_79797.png')}
                />
              </View>
            ),
            title: 'Contact us anytime',
            subtitle: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#D1C4E9', // Light purple background
            image: (
              <View style={styles.imageContainer}>
                <Image
                  style={styles.onboardingImage}
                  source={require('../assets/images/rb_7464.png')}
                />
              </View>
            ),
            title: 'Pick your food',
            subtitle: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
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
  onboardingContainer: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  skipButton: {
    padding: 15,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
  },
  nextButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FF8A65',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  resetButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  optionButton: {
    width: '80%',
    backgroundColor: '#FF8A65',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
  },
  clearButtonText: {
    color: '#666',
  }
});

export default Index;