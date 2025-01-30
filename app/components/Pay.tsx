import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';


const PinInput = ({ value, onChange, maxLength = 4 }) => {
  return (
    <View style={styles.pinContainer}>
      {[...Array(maxLength)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            value.length > index && styles.pinDotFilled
          ]}
        />
      ))}
      <TextInput
        value={value}
        onChangeText={onChange}
        maxLength={maxLength}
        keyboardType="numeric"
        style={styles.hiddenInput}
        secureTextEntry
        autoFocus
      />
    </View>
  );
};

type PayProps = {

    onClose: () => void;
  
    balance: number;
  
    onSuccess: (amount: number) => void;
  
  };
  

  type PaymentStep = 'select' | 'amount' | 'confirm' | 'pin' | 'success';

const Pay: React.FC<PayProps> = ({ onClose, balance }) => {
  const [amount, setAmount] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [step, setStep] = useState<PaymentStep>('select');
  const [pin, setPin] = useState('');
  const { user } = useUser();
  const API_URL = 'YOUR_API_URL'; // Replace with your API URL

  const handlePinSubmit = async () => {
    try {
      // Call your send-usdc endpoint
      const response = await axios.post(`${API_URL}/send-usdc`, {
        senderName: user?.firstName, // or however you store the user's name
        pin: pin,
        recipientName: selectedFriend,
        amount: parseFloat(amount)
      });

      if (response.data.success) {
        setStep('success');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        Alert.alert('Error', 'Transaction failed. Please try again.');
        setPin('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process transaction. Please try again.');
      setPin('');
    }
  };

  const renderFriendSelection = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
        <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Send Money</Text>
        <View style={{ width: 24 }} />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search friends"
        placeholderTextColor="#888"
      />

      <View style={styles.friendsList}>
        <TouchableOpacity 
          style={styles.friendItem}
          onPress={() => {
            setSelectedFriend('Levi Kigunda');
            setStep('amount');
          }}
        >
          <View style={styles.friendAvatar}>
            <Text style={styles.avatarText}>LK</Text>
          </View>
          <Text style={styles.friendName}>Levi Kigunda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAmountInput = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('select')}>
        <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Enter Amount</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>KES</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          placeholderTextColor="#888"
          autoFocus
        />
      </View>

      <Text style={styles.balanceText}>Available balance: KES{balance}</Text>

      <TouchableOpacity 
        style={[
          styles.nextButton,
          { opacity: amount ? 1 : 0.5 }
        ]}
        onPress={() => setStep('confirm')}
        disabled={!amount}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
     
  const renderPinVerification = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('confirm')}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Enter PIN</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.pinVerificationContainer}>
        <Text style={styles.pinInstructions}>
          Enter your 4-digit PIN to confirm the transaction
        </Text>
        
        <PinInput
          value={pin}
          onChange={(value) => {
            setPin(value);
            if (value.length === 4) {
              handlePinSubmit();
            }
          }}
        />
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('amount')}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.confirmationCard}>
        <View style={styles.confirmationDetail}>
          <Text style={styles.confirmLabel}>Sending to</Text>
          <Text style={styles.confirmValue}>{selectedFriend}</Text>
        </View>
        
        <View style={styles.confirmationDetail}>
          <Text style={styles.confirmLabel}>Amount</Text>
          <Text style={styles.confirmValue}>${amount}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.sendButton}
        onPress={() => setStep('pin')} // Changed to go to PIN verification
      >
        <Icon name="send" size={20} color="#FFFFFF" style={styles.sendIcon} />
        <Text style={styles.sendButtonText}>Confirm & Enter PIN</Text>
      </TouchableOpacity>
    </View>
  );
 

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <Text style={styles.successTitle}>Payment Sent!</Text>
      <Text style={styles.successText}>
        ${amount} has been sent to {selectedFriend}
      </Text>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 'select':
        return renderFriendSelection();
      case 'amount':
        return renderAmountInput();
      case 'confirm':
        return renderConfirmation();
        case 'pin':
          return renderPinVerification();
      case 'success':
        return renderSuccess();
      default:
        return renderFriendSelection();
    }
  };

  return (
    <View style={styles.modalContainer}>
      {renderStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 25,
   },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  friendsList: {
    marginTop: 10,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: 'row',
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
  amountInput: {
    color: '#FFFFFF',
    fontSize: 40,
    textAlign: 'center',
    minWidth: 150,
    fontFamily: 'Poppins',
    fontWeight:700,
  },
  balanceText: {
    color: '#888888',
    textAlign: 'center',
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: '#223F57',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 'auto',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationCard: {
    backgroundColor: '#333333',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  confirmationDetail: {
    marginBottom: 20,
  },
  confirmLabel: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 5,
  },
  confirmValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: '#223F57',
    padding: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  sendIcon: {
    marginRight: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pinVerificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pinInstructions: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    margin: 10,
  },
  pinDotFilled: {
    backgroundColor: '#FFFFFF',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconText: {
    color: '#FFFFFF',
    fontSize: 40,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Pay;