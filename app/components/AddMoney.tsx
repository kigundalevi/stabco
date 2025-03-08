import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface AddMoneyProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const AddMoney: React.FC<AddMoneyProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  
  const API_URL = 'https://hidden-eyrie-76070-9c205d882c7e.herokuapp.com';

  const handleNumberPress = (num: string) => {
    setAmount(prevAmount => {
      const currentAmount = prevAmount.replace('.00', '').replace(/^0+/, '');
      const newAmount = currentAmount + num;
      return `${newAmount}.00`;
    });
  };

  const handleBackspace = () => {
    setAmount(prevAmount => {
      const currentAmount = prevAmount.replace('.00', '').replace(/^0+/, '');
      const newAmount = currentAmount.slice(0, -1) || '0';
      return `${newAmount}.00`;
    });
  };

  const handleAddMoney = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    try {
      setLoading(true);
      const phoneNumber = await AsyncStorage.getItem(`userPhone_${user?.id}`);
      
      if (!phoneNumber) {
        throw new Error('Phone number not found');
      }

      const response = await axios.post(`${API_URL}/api/v1/mpesa/stk-push`, {
        phoneNumber,
        amountKES: numAmount
      });

      if (response.data.success) {
        onSuccess(numAmount);
        onClose();
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
     <View style={styles.modalContainer}>

    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add money</Text>
      </View>

      <View style={styles.amountWrapper}>
        <Text style={styles.amount}>KES {amount}</Text>
        <View style={styles.currencyPill}>
          <Text style={styles.currencyText}>KES</Text>
        </View>
      </View>

      <View style={styles.keypadContainer}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => handleNumberPress('1')} style={styles.keyButton}>
            <Text style={styles.keyText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNumberPress('2')} style={styles.keyButton}>
            <Text style={styles.keyText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNumberPress('3')} style={styles.keyButton}>
            <Text style={styles.keyText}>3</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity onPress={() => handleNumberPress('4')} style={styles.keyButton}>
            <Text style={styles.keyText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNumberPress('5')} style={styles.keyButton}>
            <Text style={styles.keyText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNumberPress('6')} style={styles.keyButton}>
            <Text style={styles.keyText}>6</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity onPress={() => handleNumberPress('7')} style={styles.keyButton}>
            <Text style={styles.keyText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNumberPress('8')} style={styles.keyButton}>
            <Text style={styles.keyText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNumberPress('9')} style={styles.keyButton}>
            <Text style={styles.keyText}>9</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.keyButton}>
            <Text style={styles.keyText}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNumberPress('0')} style={styles.keyButton}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBackspace} style={styles.keyButton}>
            <Text style={styles.keyText}>←</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, { opacity: loading ? 0.5 : 1 }]}
        onPress={handleAddMoney}
        disabled={loading || amount === '0.00'}
      >{loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.nextButtonText}>Processing...</Text>
        </View>
      ) : (
        <Text style={styles.nextButtonText}>Add</Text>
      )}
        
      </TouchableOpacity>
    </View>
     </View>
   
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
   borderTopRightRadius:25,
   borderTopLeftRadius:25,
    overflow: 'hidden',
   },
   container: {
    flex: 1,
    backgroundColor: '#151414',
    padding: 20,
    borderTopRightRadius:20,
    borderTopLeftRadius:20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,

  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginRight: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  amountWrapper: {
    alignItems: 'center',
    marginBottom: 60,
    flexDirection:'row',
    justifyContent:'center',
    gap:10
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currencyPill: {
    backgroundColor: '#333333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom:10
  },
  currencyText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  keypadContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  keyButton: {
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '400',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 30,
    marginTop: 'auto',
     },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default AddMoney;