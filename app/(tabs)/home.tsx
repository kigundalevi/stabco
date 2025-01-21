import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform, StatusBar, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import React, { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useRef } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import Pay from '../components/Pay';

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [groupedTransactions, setGroupedTransactions] = useState<{ [key: string]: typeof sampleTransactions }>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState<'pay' | 'add' | 'withdraw' | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [balance, setBalance] = useState(5000); // Initial balance in KES

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

  // Sample transaction data
  const sampleTransactions = [
    {
      id: 1,
      date: '2025-01-19',
      name: 'Levi Kigunda',
      amount: 'US$0.05',
      type: 'debit'
    },
    {
      id: 2,
      date: '2025-01-21',
      name: 'Elvis karani',
      amount: 'US$100',
      type: 'credit'
    },
       {
      id: 3,
      date: '2024-11-01',
      name: 'Bank Of Am',
      amount: 'KES10,000.00',
      type: 'credit',
      status: 'Failed'
    },
    {
      id: 4,
      date: '2024-11-01',
      name: 'Shazam, Inc.',
      amount: 'KES10,000.00',
      type: 'credit',
      status: 'Failed'
    },
    {
      id: 5,
      date: '2024-10-01',
      name: 'Shazam, Inc.',
      amount: 'KES10,000.00',
      type: 'credit',
      status: 'Failed'
    },
    {
      id: 6,
      date: '2024-10-01',
      name: 'Shazam, Inc.',
      amount: 'KES10,000.00',
      type: 'credit',
      status: 'Failed'
    },
    {
      id: 7,
      date: '2024-10-01',
      name: 'Shazam, Inc.',
      amount: 'KES10,000.00',
      type: 'credit',
      status: 'Failed'
    }
  ];

  useEffect(() => {
    const formatDate = (dateString: string | number | Date) => {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const transactionDate = new Date(date.setHours(0, 0, 0, 0));
      
      if (transactionDate.getTime() === today.getTime()) {
        return 'Today';
      }
      
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    const grouped = sampleTransactions.reduce((groups: { [key: string]: typeof sampleTransactions }, transaction) => {
      const dateKey = formatDate(transaction.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
      return groups;
    }, {} as { [key: string]: typeof sampleTransactions });

    const sortedGroups = Object.keys(grouped)
      .sort((a, b) => {
        if (a === 'Today') return -1;
        if (b === 'Today') return 1;
        return new Date(b.replace('Today', new Date().toISOString())) - 
               new Date(a === 'Today' ? new Date().toISOString() : a);
      })
      .reduce((obj: { [key: string]: typeof sampleTransactions }, key) => {
        obj[key] = grouped[key];
        return obj;
      }, {});

    setGroupedTransactions(sortedGroups);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
                       onPress={() => router.push('/profile')}
          >
            {user?.imageUrl ? (
              <Image 
                source={{ uri: user.imageUrl }} 
                style={styles.profileImage} 
              />
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
            <Text style={styles.balance}>KES 5000</Text>
            <Text style={styles.subBalance}>0.05 USDP</Text>
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
      >
        {Object.entries(groupedTransactions).map(([date, transactions]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>
            {(transactions as any[]).map((transaction: { id: Key | null | undefined; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; status: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; type: string; amount: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) => (
              <TouchableOpacity  
                           key={transaction.id} 
                style={styles.transaction} disabled={true}  
                 >
                <View style={styles.transactionLeft}>
                  {(transaction.name ?? '').includes('Bank') || (transaction.name ?? '').includes('Shazam') ? (
                    <View style={styles.bankIcon}>
                      <Ionicons name="card" size={24} color="white" />
                    </View>
                  ) : (
                    <View style={[styles.userInitial, { backgroundColor: '#7C4DFF' }]}>
                      <Text style={styles.initialText}>
                        {(transaction.name ?? '').split(' ').map((n: any[]) => n[0]).join('')}
                      </Text>
                    </View>
                  )}
                  <View>
                    <Text style={styles.transactionName}>{transaction.name}</Text>
                    {transaction.status && (
                      <Text style={styles.transactionStatus}>{transaction.status}</Text>
                    )}
                  </View>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'credit' ? '#00C853' : '#FF3D00' }
                ]}>
                  {transaction.amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        {/* Add extra padding at bottom for Pay Button */}
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
              balance={balance}
              onSuccess={(amount: number) => {
                setBalance(prev => prev - amount);
                // Update transactions here if needed
                hideModal();
              }}
            />
          )}
          {activeModal === 'add' && (
            <AddMoney 
              onClose={hideModal}
              onSuccess={(amount: number) => {
                setBalance(prev => prev + amount);
                hideModal();
              }}
            />
          )}
          {activeModal === 'withdraw' && (
            <Withdraw 
              onClose={hideModal}
              balance={balance}
              onSuccess={(amount: number) => {
                setBalance(prev => prev - amount);
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding:10,
    borderRadius: 25,
    marginRight: 12,
      },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
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
    fontSize: 14,
    paddingHorizontal: 16,
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
    backgroundColor: 'white',
    borderRadius: 25,
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
});