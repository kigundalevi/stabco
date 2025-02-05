import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface CurrencyOption {
  flag: string;
  name: string;
  code: string;
}

const DisplayCurrency = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('KSH');

  useEffect(() => {
    const loadCurrency = async () => {
      const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      if (savedCurrency) {
        setSelectedCurrency(savedCurrency);
      }
    };
    loadCurrency();
  }, []);

  const saveCurrency = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    await AsyncStorage.setItem('selectedCurrency', currencyCode);
  };

  const currencies: CurrencyOption[] = [
    { flag: '🇰🇪', name: 'Kenyan Shilling', code: 'KSH' },
    { flag: '🇹🇿', name: 'Tanzanian Shilling', code: 'TZH' },
    { flag: '🇺🇬', name: 'Ugandan Shilling', code: 'UGX' },
    { flag: '🇺🇸', name: 'US Dollar', code: 'USD' },
  ];

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Display Currency</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.currencyList}>
        {filteredCurrencies.map(currency => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.currencyItem,
              selectedCurrency === currency.code ? styles.selectedItem : null
            ]}
            onPress={() => saveCurrency(currency.code)}
          >
            <View style={styles.currencyInfo}>
              <Text style={styles.flag}>{currency.flag}</Text>
              <View>
                <Text style={styles.currencyName}>{currency.name}</Text>
                <Text style={styles.currencyCode}>{currency.code}</Text>
              </View>
            </View>
            <View style={[styles.radioButton, selectedCurrency === currency.code && styles.radioButtonSelected]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 20 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  headerRight: { width: 40 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', margin: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  searchInput: { flex: 1, marginLeft: 8, color: 'white', fontSize: 16 },
  currencyList: { paddingBottom: 20 },
  currencyItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  selectedItem: { backgroundColor: '#222' },
  currencyInfo: { flexDirection: 'row', alignItems: 'center' },
  flag: { fontSize: 24, marginRight: 12 },
  currencyName: { color: 'white', fontSize: 16, fontWeight: '500' },
  currencyCode: { color: '#666', fontSize: 14, marginTop: 4 },
  radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#666' },
  radioButtonSelected: { borderColor: '#007AFF', backgroundColor: '#007AFF' },
});

export default DisplayCurrency;
