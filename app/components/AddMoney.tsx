import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddMoneyProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const AddMoney: React.FC<AddMoneyProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMoney = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate successful addition
    setTimeout(() => {
      onSuccess(numAmount);
      setLoading(false);
      onClose();
    }, 2000);
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
            <Text style={styles.addButtonText}>Processing...</Text>
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
    justifyContent:'center',
      },
  closeButton: {
    marginRight: 16,
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
     flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 40,
    marginRight: 10,
    fontWeight:700,
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
});

export default AddMoney;