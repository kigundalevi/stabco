import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Limits = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Limits</Text>
      </View>

      {/* Daily Limits Section */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Daily limits</Text>

        <View style={styles.limitsContainer}>
          {/* Deposits Row */}
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Deposits</Text>
            <Text style={styles.limitValue}>Under review</Text>
          </View>

          {/* Withdrawals Row */}
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Withdrawals</Text>
            <Text style={styles.limitValue}>Under review</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    height: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  limitsContainer: {
    gap: 16,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  limitLabel: {
    color: '#808080',
    fontSize: 16,
  },
  limitValue: {
    color: 'white',
    fontSize: 16,
  }
});

export default Limits;