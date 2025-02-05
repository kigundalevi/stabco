import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';


interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}
 interface Friend {
  name: string;
 }

const PinInput = ({ value, onChange, maxLength = 4 }: PinInputProps) => {
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
  const API_URL = 'https://hidden-eyrie-76070-9c205d882c7e.herokuapp.com';   // Replace with your API URL
  const [searchQuery, setSearchQuery] = useState('');
  const [friendResults, setFriendResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchFriends = async (query: string) => {
    if (query.length < 2) {
      setFriendResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.post(`${API_URL}/api/search`, { name: query });
      
      if (response.data.success) {
        // Map to extract only names and filter out current user
        const filteredResults = response.data.users
          .filter((user: any) => user.name !== user?.fullName)
          .map((user: any) => ({ name: user.name }));

        setFriendResults(filteredResults);
      } else {
        Alert.alert('Search Error', 'Unable to search friends');
      }
    } catch (error) {
      console.error('Friend search error:', error);
      Alert.alert('Error', 'Failed to search friends');
    } finally {
      setIsSearching(false);
    }
  };


  const handlePinSubmit = async (submittedPin: string) => {

    if (!/^\d{4}$/.test(submittedPin)) {
      Alert.alert('Invalid PIN', 'Your PIN must be exactly 4 digits.');
      return;
    }
   
    // Convert KES to USDC using the exchange rate
    const exchangeRate = 129; // from home.tsx
    const usdcAmount = parseFloat(amount) / exchangeRate;
     
    const storedPin = await SecureStore.getItemAsync('userPIN');

    if (submittedPin !== storedPin) {
      Alert.alert('Invalid PIN', 'The PIN you entered is incorrect');
      return;
    }

         console.log('FINAL PIN FOR SUBMISSION:', submittedPin);
  console.log('FINAL PIN LENGTH:', submittedPin.length);

    // Detailed logging of the payload
    console.log('Sending payload:', {
      senderName: user?.fullName,
      pin: pin, // Be careful not to log actual PINs in production
      recipientName: selectedFriend,
      amount: usdcAmount
    });
     
    const payload = {
      senderName: user?.fullName,
      pin: submittedPin,
      recipientName: selectedFriend,
      amount: usdcAmount.toFixed(6)
    };
     try {
  
      // Call your send-usdc endpoint with USDC amount
      const response = await axios.post(`${API_URL}/api/send-usdc`, payload, {
        headers: { 'Content-Type': 'application/json' },
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
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
  
        // More informative error message
        Alert.alert(
          'Transaction Error', 
          error.response?.data?.message || 
          'Failed to process transaction. Please check your details and try again.'
        );
      } else {
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
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
        placeholder="Search friends by username"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          searchFriends(text);
        }}
      />

      {isSearching && (
        <Text style={styles.searchStatus}>Searching...</Text>
      )}

      <View style={styles.friendsList}>
        {friendResults.length > 0 ? (
          friendResults.map((friend: Friend) => (
            <TouchableOpacity 
              key={friend.name}
              style={styles.friendItem}
              onPress={() => {
                setSelectedFriend(friend.name);
                setStep('amount');
              }}
            >
              <View style={styles.friendAvatar}>
                <Text style={styles.avatarText}>
                  {friend.name.charAt(0).toLowerCase()}
                </Text>
              </View>
              <Text style={styles.friendName}>{friend.name}</Text>
            </TouchableOpacity>
          ))
        ) : searchQuery.length > 1 && !isSearching ? (
          <Text style={styles.noResultsText}>No friends found</Text>
        ) : null}
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
              onChange={(value: string) => {
                console.log('RAW INPUT:', value);
                // Remove any non-numeric characters
                const newPin = value.replace(/[^0-9]/g, '');
                console.log('PROCESSED PIN:', newPin);
                console.log('PROCESSED PIN LENGTH:', newPin.length);
                setPin(newPin);
                // When exactly 4 digits are entered, immediately submit.
                if (newPin.length === 4) {
                  console.log('ATTEMPTING SUBMIT WITH:', newPin);
                  handlePinSubmit(newPin);
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
          <Text style={styles.confirmValue}>{amount}</Text>
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
      KES {amount} (${(parseFloat(amount) / 129).toFixed(2)} USDC) sent to {selectedFriend}
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
      <View style={styles.gradientOverlay} />
      {renderStep()}
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
   gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#151414',
    opacity: 0.8, // Adjust for desired gradient effect
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
  searchStatus: {
    color: '#888888',
    textAlign: 'center',
    marginVertical: 10,
  },
  noResultsText: {
    color: '#888888',
    textAlign: 'center',
    marginVertical: 10,
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