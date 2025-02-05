import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform, StatusBar, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import React, { useState, useEffect, useRef } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import Pay from '../../components/Pay';
import Withdraw from '../../components/Withdraw';
import AddMoney from '../../components/AddMoney';
import axios from 'axios';
import { BackHandler } from 'react-native';

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [groupedTransactions, setGroupedTransactions] = useState<{ [key: string]: any[] }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState<'pay' | 'add' | 'withdraw' | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balances, setBalances] = useState({
    kes: 0,
    usdc: 0,
    rate: 129 // Initial hardcoded rate
  });
  const API_URL = 'https://hidden-eyrie-76070-9c205d882c7e.herokuapp.com';  

  
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const showModal = (type: 'pay' | 'add' | 'withdraw') => {
    setActiveModal(type);
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setActiveModal(null);
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [transactionsRes, balanceRes] = await Promise.all([
        axios.get(`${API_URL}/api/transactions/${user?.fullName}`),
        axios.get(`${API_URL}/api/usdc-balance/${user?.fullName}`)
      ]);

      const transactions = transactionsRes.data.transactions;
      const usdcBalance = balanceRes.data.balance;

      // Format transactions
      const formattedTransactions = transactions.map((tx: any) => ({
        id: tx._id,
        date: tx.date,
        name: tx.counterparty || 'System',
        amount: tx.amount,
        type: tx.type === 'send' ? 'sent' : 'received',
        status: tx.status,
        currency: tx.currency
      }));

      // Group transactions
      const grouped = groupTransactions(formattedTransactions);
      setGroupedTransactions(grouped);

      // Update balances with hardcoded rate
      setBalances(prev => ({
        ...prev,
        kes: usdcBalance * prev.rate,
        usdc: usdcBalance
      }));

    } catch (err) {
      setError('Failed to load data. Please pull to refresh.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupTransactions = (transactions: any[]) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const transactionDate = new Date(date);
      transactionDate.setHours(0, 0, 0, 0);
      
      if (transactionDate.getTime() === today.getTime()) {
        return 'Today';
      }
      
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };
     

    const grouped = transactions.reduce((groups: { [key: string]: any[] }, transaction) => {
      const dateKey = formatDate(transaction.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
      return groups;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => {
        if (a === 'Today') return -1;
        if (b === 'Today') return 1;
        return new Date(b).getTime() - new Date(a).getTime();
      })
      .reduce((obj: { [key: string]: any[] }, key) => {
        obj[key] = grouped[key];
        return obj;
      }, {});
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleTransactionSuccess = () => {
    fetchData();
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileInitial}>
                <Text style={styles.initialText}>
                  {user?.firstName?.[0] || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#4285f4" />
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.balance}>
              KES {balances.kes.toLocaleString('en-KE', { maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.subBalance}>
              {balances.usdc.toFixed(2)} USDC
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.adduserIcon}>
            <Feather name="user-plus" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => showModal('add')}
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.actionButtonText}>Add Money</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => showModal('withdraw')}
        >
          <Ionicons name="remove-circle-outline" size={24} color="white" />
          <Text style={styles.actionButtonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchData}
            tintColor="#fff"
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : Object.entries(groupedTransactions).length === 0 ? (
          <Text style={styles.noTransactions}>No transactions found</Text>
        ) : (
          Object.entries(groupedTransactions).map(([date, transactions]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {(transactions as any[]).map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transaction}
                  disabled={true}
                >
                  <View style={styles.transactionLeft}>
                    {(transaction.name.includes('Bank') || transaction.name.includes('Shazam')) ? (
                      <View style={styles.bankIcon}>
                        <Ionicons name="card" size={24} color="white" />
                      </View>
                    ) : (
                      <View style={[styles.userInitial, { backgroundColor: '#7C4DFF' }]}>
                        <Text style={styles.initialText}>
                          {transaction.name.split(' ').map((n: string) => n[0]).join('')}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.transactionName}>{transaction.name}</Text>
                      {transaction.status && transaction.status !== 'completed' && (
                        <Text style={styles.transactionStatus}>{transaction.status}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'sent' ? '#FF3D00' : '#00C853' }
                  ]}>
                    {/* {transaction.type === 'sent' ? '-' : '+'} */}
                    {transaction.currency === 'KES' ? 'KES' : '$'}
                    {transaction.amount.toLocaleString('en-KE')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.payButtonContainer}>
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => showModal('pay')}
        >
          <Text style={styles.payButtonText}>Pay anyone</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Container */}
      {modalVisible && (
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {activeModal === 'pay' && (
            <Pay 
              onClose={hideModal} 
              balance={balances.kes}
              onSuccess={(amount: number) => {
                handleTransactionSuccess();
                hideModal();
              }}
            />
          )}
          {activeModal === 'add' && (
            <AddMoney 
              onClose={hideModal}
              onSuccess={(amount: number) => {
                handleTransactionSuccess();
                hideModal();
              }}
            />
          )}
          {activeModal === 'withdraw' && (
            <Withdraw 
              onClose={hideModal}
              balance={balances.kes}
              onSuccess={(amount: number) => {
                handleTransactionSuccess();
                hideModal();
              }}
            />
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  profileInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  balance: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    // fontFamily:'Inter'
  },
  subBalance: {
    color: '#888',
    fontSize: 14,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginLeft: 20,
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 25,
  },
  adduserIcon: {
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 25,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 8,
    borderRadius: 25,
    marginRight: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    flex: 1,
    padding: 10,
  },
  dateGroup: {
    marginBottom: 10,
  },
  dateHeader: {
    color: '#888',
    fontSize: 18,
    paddingHorizontal: 16,
    fontWeight:800,
    paddingVertical: 8,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  transactionStatus: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 80,
  },
  payButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  payButton: {
    backgroundColor: '#223F57',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: '#FF3D00',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  noTransactions: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});