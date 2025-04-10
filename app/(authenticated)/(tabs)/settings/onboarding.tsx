import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import OnboardingManager from '../../../../utils/onboardingManager';

export default function OnboardingSettings() {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [forceShowOnboarding, setForceShowOnboarding] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const onboardingCompleted = await OnboardingManager.hasCompletedOnboarding();
      const shouldForceShow = await OnboardingManager.shouldForceShowOnboarding();
      
      setHasOnboarded(onboardingCompleted);
      setForceShowOnboarding(shouldForceShow);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleClearOnboarding = async () => {
    Alert.alert(
      'Clear Onboarding Data',
      'This will reset your onboarding status. You will see the onboarding screens next time you open the app. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await OnboardingManager.clearOnboardingStatus();
              setHasOnboarded(false);
              Alert.alert('Success', 'Onboarding data cleared successfully');
            } catch (error) {
              console.error('Error clearing onboarding:', error);
              Alert.alert('Error', 'Failed to clear onboarding data');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleViewOnboarding = () => {
    router.push('/');
  };

  const toggleForceShowOnboarding = async (value: boolean) => {
    try {
      await OnboardingManager.setForceShowOnboarding(value);
      setForceShowOnboarding(value);
    } catch (error) {
      console.error('Error toggling force show onboarding:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A65" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding Settings</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Onboarding Status: {hasOnboarded ? 'Completed' : 'Not Completed'}
        </Text>
      </View>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Always show onboarding</Text>
        <Switch
          value={forceShowOnboarding}
          onValueChange={toggleForceShowOnboarding}
          trackColor={{ false: '#767577', true: '#FF8A65' }}
          thumbColor={forceShowOnboarding ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleViewOnboarding}
      >
        <Text style={styles.buttonText}>View Onboarding Screens</Text>
      </TouchableOpacity>
      
      {hasOnboarded && (
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={handleClearOnboarding}
        >
          <Text style={styles.clearButtonText}>Clear Onboarding Data</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>About Onboarding</Text>
        <Text style={styles.infoBoxText}>
          The onboarding screens introduce you to the key features of the app.
          You can view them again at any time from this screen.
        </Text>
        <Text style={styles.infoBoxText}>
          Clearing onboarding data will reset your onboarding status, and you'll see the
          introduction screens the next time you open the app.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF8A65',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoBoxText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  }
});
