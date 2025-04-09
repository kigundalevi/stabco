import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type SettingItemProps = {
  title: string;
  icon: string;
  onPress: () => void;
  description?: string;
};

const SettingItem = ({ title, icon, onPress, description }: SettingItemProps) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingIconContainer}>
      <Ionicons name={icon as any} size={24} color="#FF8A65" />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {description && <Text style={styles.settingDescription}>{description}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#999" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        
        <SettingItem
          title="Onboarding"
          icon="layers-outline"
          description="Manage onboarding screens and tutorial"
          onPress={() => router.push('/settings/onboarding')}
        />
        
        <SettingItem
          title="Appearance"
          icon="color-palette-outline"
          description="Theme, colors, and display options"
          onPress={() => {}}
        />
        
        <SettingItem
          title="Notifications"
          icon="notifications-outline"
          description="Manage push notifications and alerts"
          onPress={() => {}}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <SettingItem
          title="Profile"
          icon="person-outline"
          description="Edit your profile information"
          onPress={() => {}}
        />
        
        <SettingItem
          title="Security"
          icon="shield-outline"
          description="PIN, biometrics, and security settings"
          onPress={() => {}}
        />
        
        <SettingItem
          title="Privacy"
          icon="lock-closed-outline"
          description="Manage your privacy preferences"
          onPress={() => {}}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <SettingItem
          title="Help Center"
          icon="help-circle-outline"
          description="Get help with using the app"
          onPress={() => {}}
        />
        
        <SettingItem
          title="About"
          icon="information-circle-outline"
          description="App version and legal information"
          onPress={() => {}}
        />
      </View>
      
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 138, 101, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutButtonText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  versionText: {
    color: '#999',
    fontSize: 14,
  },
});
