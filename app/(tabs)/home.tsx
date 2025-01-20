// app/wallet.js
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useUser } from "@clerk/clerk-expo";
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';

export default function WalletScreen() {
  const { user } = useUser();

  const transactions = [
    {
      id: 1,
      name: "Levi Kigunda",
      amount: "US$0.05",
      date: "Today",
      type: "debit",
      initials: "LK"
    },
    {
      id: 2,
      name: "Levi Kigunda",
      amount: "US$0.01",
      date: "19 Jan 2025",
      type: "debit",
      initials: "LK"
    },
    {
      id: 3,
      name: "Bank Of Am...",
      amount: "+KES10,000.00",
      date: "1 Nov 2024",
      type: "credit",
      status: "Failed"
    },
    {
      id: 4,
      name: "Shazam, Inc.",
      amount: "+KES10,000.00",
      date: "1 Nov 2024",
      type: "credit",
      status: "Failed"
    },
    {
        id: 4,
        name: "Shazam, Inc.",
        amount: "+KES10,000.00",
        date: "1 Nov 2024",
        type: "credit",
        status: "Failed"
      },
      {
        id: 4,
        name: "Shazam, Inc.",
        amount: "+KES10,000.00",
        date: "1 Nov 2024",
        type: "credit",
        status: "Failed"
      },
      {
        id: 4,
        name: "Shazam, Inc.",
        amount: "+KES10,000.00",
        date: "1 Nov 2024",
        type: "credit",
        status: "Failed"
      },
      {
        id: 4,
        name: "Shazam, Inc.",
        amount: "+KES10,000.00",
        date: "1 Nov 2024",
        type: "credit",
        status: "Failed"
      },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileLeft}>
            <TouchableOpacity onPress={() => router.push('/profile')}>
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileInitials}>
                <Text style={styles.initialsText}>EK</Text>
              </View>
            )}
            </TouchableOpacity>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceTitle}>KSH 1000</Text>
              <Text style={styles.balanceSubtitle}>10 USDP</Text>
            </View>
          </View>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity>
            <Feather name="user-plus" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchIcon}>
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="remove-circle-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.transactionsList}>
        <Text style={styles.sectionTitle}>Today</Text>
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            {transaction.initials ? (
              <View style={styles.transactionInitials}>
                <Text style={styles.initialsText}>{transaction.initials}</Text>
              </View>
            ) : (
              <View style={styles.bankIcon}>
                <Ionicons name="card" size={24} color="white" />
              </View>
            )}
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionName}>{transaction.name}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={[
                styles.amountText,
                { color: transaction.type === 'credit' ? '#4CAF50' : '#FF4444' }
              ]}>
                {transaction.amount}
              </Text>
              {transaction.status && (
                <Text style={styles.statusText}>{transaction.status}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Fixed Pay Anyone Button */}
      <View style={styles.payAnyoneContainer}>
        <TouchableOpacity style={styles.payAnyoneButton}>
          <Text style={styles.payAnyoneText}>SEND NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceContainer: {
    justifyContent: 'center',
  },
  balanceTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginLeft: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 25,
    marginRight: 12,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
  },
  transactionInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7B68EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    color: '#888',
    fontSize: 14,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusText: {
    color: '#888',
    fontSize: 12,
  },
  payAnyoneContainer: {
    padding: 16,
    backgroundColor: 'black',
  },
  payAnyoneButton: {
    backgroundColor: '#4169E1',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  payAnyoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});