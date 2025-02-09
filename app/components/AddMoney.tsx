import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';

interface AddMoneyProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const AddMoney: React.FC<AddMoneyProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  
  const API_URL = 'https://hidden-eyrie-76070-9c205d882c7e.herokuapp.com';

  const handleAddMoney = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Retrieve the stored phone number
      const phoneNumber = await AsyncStorage.getItem(`userPhone_${user?.id}`);
      
      if (!phoneNumber) {
        throw new Error('Phone number not found. Please try again.');
      }

      // Make API call to initiate STK push
      const response = await axios.post(`${API_URL}/api/v1/mpesa/stk-push`, {
        phoneNumber,
        amountKES: numAmount
      });

      if (response.data.success) {
        onSuccess(numAmount);
        Alert.alert(
          'Success',
          'Please check your phone for the MPesa prompt',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.error || 
        error.message || 
        'Failed to process payment. Please try again.';
      
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Money</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>KES</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#CCCCCC"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            editable={!loading}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: amount ? '#7C4DFF' : '#333333',
              opacity: loading ? 0.5 : 1,
            },
          ]}
          onPress={handleAddMoney}
          disabled={!amount || loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.addButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    gap: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 40,
    marginRight: 10,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3D00',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#7C4DFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default AddMoney;