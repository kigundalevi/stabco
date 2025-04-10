import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  Image, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const Pay: React.FC<PayProps> = ({ onClose, balance, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [step, setStep] = useState<PaymentStep>('select');
  const [pin, setPin] = useState('');
  const { user } = useUser();
  const API_URL = 'https://hidden-eyrie-76070-9c205d882c7e.herokuapp.com'; // Replace with your API URL
  const [searchQuery, setSearchQuery] = useState('');
  const [friendResults, setFriendResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchFriends = async (query: string) => {
    if (query.length < 2) {
      setFriendResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const axiosInstance = axios.create({
        timeout: 8000 // 8 seconds timeout
      });

      try {
        const response = await axiosInstance.post(`${API_URL}/api/search`, { name: query });

        if (response.data.success) {
          const filteredResults = response.data.users
            .filter((user: any) => user.name !== user?.fullName)
            .map((user: any) => ({ name: user.name }));

          setFriendResults(filteredResults);
        } else {
          Alert.alert('Search Error', 'Unable to search friends');
        }
      } catch (apiError) {
        console.error('Friend search error:', apiError);

        if (axios.isAxiosError(apiError)) {
          if (apiError.code === 'ECONNABORTED') {
            Alert.alert('Connection Error', 'Search request timed out. Please check your internet connection.');
          } else if (!apiError.response) {
            Alert.alert('Network Error', 'Could not connect to the server.');
          } else {
            Alert.alert('Server Error', 'Could not retrieve user list. Please try again later.');
          }
        } else {
          Alert.alert('Error', 'An unexpected error occurred during search.');
        }

        setFriendResults([]);
      }
    } catch (error) {
      console.error('Friend search error:', error);
      setFriendResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePinSubmit = async (submittedPin: string) => {
    setIsLoading(true);
    console.log('PIN submitted for verification:', submittedPin);

    if (!/^\d{4}$/.test(submittedPin)) {
      setIsLoading(false);
      Alert.alert('Invalid PIN', 'Your PIN must be exactly 4 digits.');
      return;
    }

    const exchangeRate = 129; // from home.tsx
    const usdcAmount = parseFloat(amount) / exchangeRate;

    try {
      // First, try to get PIN from AsyncStorage (new method)
      let isValid = false;
      let storedPin = null;
      
      // Try to get PIN from AsyncStorage first (newer storage method)
      if (user?.id) {
        storedPin = await AsyncStorage.getItem(`userPin_${user.id}`);
        console.log('PIN from AsyncStorage:', storedPin ? '****' : 'not found');
        
        if (storedPin && submittedPin === storedPin) {
          isValid = true;
        }
      }
      
      // If not found or not matched in AsyncStorage, try SecureStore (older method)
      if (!isValid) {
        storedPin = await SecureStore.getItemAsync('userPIN');
        console.log('PIN from SecureStore:', storedPin ? '****' : 'not found');
        
        if (storedPin && submittedPin === storedPin) {
          isValid = true;
        }
      }

      if (!isValid) {
        setIsLoading(false);
        Alert.alert('Invalid PIN', 'The PIN you entered is incorrect. Please try again.');
        setPin('');
        return;
      }

      const payload = {
        senderName: user?.fullName,
        pin: submittedPin,
        recipientName: selectedFriend,
        amount: usdcAmount.toFixed(6)
      };

      const axiosInstance = axios.create({
        timeout: 15000 // 15 seconds timeout for transactions
      });

      try {
        console.log('Sending transaction payload:', {
          ...payload,
          pin: '****' // Mask PIN in logs
        });
        
        const response = await axiosInstance.post(`${API_URL}/api/send-usdc`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.success) {
          onSuccess(usdcAmount); // Call parent handler with amount
          setStep('success');
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          Alert.alert('Error', response.data.message || 'Transaction failed. Please try again.');
          setPin('');
        }
      } catch (apiError) {
        console.error('Payment API error:', apiError);

        if (axios.isAxiosError(apiError)) {
          if (apiError.code === 'ECONNABORTED') {
            Alert.alert('Transaction Error', 'Transaction request timed out. Your payment may still be processing.');
          } else if (apiError.response) {
            Alert.alert('Transaction Error', `Transaction failed: ${apiError.response.data.message || apiError.response.statusText || 'Server error'}`);
            console.error('Response data:', apiError.response.data);
          } else if (apiError.request) {
            Alert.alert('Transaction Error', 'No response from server. Please verify the transaction status later.');
          } else {
            Alert.alert('Transaction Error', 'Error preparing transaction request. Please try again.');
          }
        } else {
          Alert.alert('Transaction Error', 'An unexpected error occurred. Please try again.');
        }

        setPin('');
      }
    } catch (error) {
      console.error('PIN validation error:', error);
      setIsLoading(false);
      Alert.alert('Error', 'An error occurred while validating your PIN. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
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
                  {friend.name.split(' ')[0]?.charAt(0).toUpperCase() + friend.name.split(' ')[1]?.charAt(0).toUpperCase()}
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                { opacity: amount ? 1 : 0.5 }
              ]}
              onPress={() => {
                Keyboard.dismiss();
                setStep('confirm');
              }}
              disabled={!amount}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Keyboard.dismiss();
                setStep('select');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  const renderPinVerification = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loaderText}>Processing...</Text>
              </View>
            </View>
          )}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              Keyboard.dismiss();
              setStep('confirm');
            }}>
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Enter PIN</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.pinInstructionsContainer}>
            <Text style={styles.pinInstructions}>
              Enter your 4-digit PIN to confirm the transaction
            </Text>

            <PinInput
              value={pin}
              onChange={(value: string) => {
                console.log('RAW INPUT:', value);
                const newPin = value.replace(/[^0-9]/g, '');
                setPin(newPin);
                if (newPin.length === 4) {
                  handlePinSubmit(newPin);
                }
              }}
            />
          </View>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Keyboard.dismiss();
              setStep('confirm');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
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
    fontWeight: 700,
  },
  amountInput: {
    color: '#FFFFFF',
    fontSize: 40,
    textAlign: 'center',
    minWidth: 150,
    fontFamily: 'Poppins',
    fontWeight: 700,
  },
  balanceText: {
    color: '#888888',
    textAlign: 'center',
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', // Increased opacity for darker background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  loaderContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent white container
    alignItems: 'center'
  },
  loaderText: {
    color: '#FFFFFF',
    marginTop: 10
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pinInstructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default Pay;