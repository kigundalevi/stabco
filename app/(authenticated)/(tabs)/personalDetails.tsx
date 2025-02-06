import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';

const PersonalDetails = () => {
  const { user } = useUser();
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    emailAddress: ''
  });

  useEffect(() => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      
      setPersonalInfo({
        firstName: firstName,
        lastName: lastName,
        username: `${firstName}${lastName}`.toLowerCase(),
        phoneNumber: user.phoneNumbers[0]?.phoneNumber || '',
        emailAddress: user.emailAddresses[0]?.emailAddress || ''
      });
    }
  }, [user]);

  const handlePhonePress = () => {
    if (personalInfo.phoneNumber) {
      Linking.openURL(`tel:${personalInfo.phoneNumber}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your details</Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>First name</Text>
        <Text style={styles.value}>{personalInfo.firstName}</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Last name</Text>
        <Text style={styles.value}>{personalInfo.lastName}</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{personalInfo.username}</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Phone number</Text>
        <TouchableOpacity onPress={handlePhonePress}>
          <Text style={[styles.value, styles.phone]}>
            {personalInfo.phoneNumber}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email address</Text>
        <Text style={styles.value}>{personalInfo.emailAddress}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#000000',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
  },
  phone: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  }
});

export default PersonalDetails;