import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const InvitePeople = () => {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/profile')}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Invite people to Stab</Text>
        
        {/* User Icon */}
        <View style={styles.userIcon}>
          <Ionicons name="person-outline" size={40} color="#666" />
        </View>

        <Text style={styles.mainText}>
          Pay anyone instantly with zero charges anywhere in the country
        </Text>

        <Text style={styles.subText}>
          Invite your friends over to enjoy seamless and free transactions
        </Text>

        {/* Invite Button */}
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>Invite Friends</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  userIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  mainText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  inviteButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InvitePeople;