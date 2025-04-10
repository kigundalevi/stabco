import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const ONBOARDING_KEY = 'hasOnboarded';

/**
 * Utility functions to manage onboarding state
 */
export const OnboardingManager = {
  /**
   * Check if the user has already completed onboarding
   * @returns Promise<boolean> - True if user has completed onboarding
   */
  hasCompletedOnboarding: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  /**
   * Mark onboarding as completed
   * @returns Promise<void>
   */
  markOnboardingComplete: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      throw error;
    }
  },

  /**
   * Clear onboarding status (user will see onboarding again)
   * @returns Promise<void>
   */
  clearOnboardingStatus: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      console.error('Error clearing onboarding status:', error);
      throw error;
    }
  },

  /**
   * Force show onboarding regardless of previous completion
   * This can be used for debugging or when a user wants to see onboarding again
   * @param forceShow - Whether to force show onboarding
   * @returns Promise<void>
   */
  setForceShowOnboarding: async (forceShow: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem('forceShowOnboarding', forceShow ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting force show onboarding:', error);
      throw error;
    }
  },

  /**
   * Check if onboarding should be forcefully shown
   * @returns Promise<boolean>
   */
  shouldForceShowOnboarding: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem('forceShowOnboarding');
      return value === 'true';
    } catch (error) {
      console.error('Error checking force show onboarding:', error);
      return false;
    }
  }
};

export default OnboardingManager;
