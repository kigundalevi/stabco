import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define types
interface Currency {
  code: string;
  name: string;
}

interface RatesCache {
  rates: Record<string, string>;
  timestamp: string;
}

interface ExchangeRates {
  [key: string]: string;
}

const STORAGE_KEY = 'exchange_rates_cache';
const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
];

const ExchangeRates = () => {
  const router = useRouter();
  const [rates, setRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load cached rates
  const loadCachedRates = async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { rates: cachedRates, timestamp }: RatesCache = JSON.parse(cached);
        setRates(cachedRates);
        setLastUpdated(new Date(timestamp));
      }
    } catch (err) {
      console.error('Error loading cached rates:', err);
    }
  };

  // Save rates to cache
  const cacheRates = async (newRates: ExchangeRates) => {
    try {
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ rates: newRates, timestamp })
      );
      setLastUpdated(new Date(timestamp));
    } catch (err) {
      console.error('Error caching rates:', err);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      // Using exchangerate-api.com as an example
      const response = await fetch(
        'https://v6.exchangerate-api.com/v6/450721bb42b9989ded8703d7/latest/USD'
      );
      const data = await response.json();
      
      // Process rates for all currencies
      const newRates: ExchangeRates = {};
      CURRENCIES.forEach(currency => {
        newRates[currency.code] = (1 / data.conversion_rates[currency.code]).toFixed(2);
      });

      setRates(newRates);
      await cacheRates(newRates);
      setError(null);
    } catch (err) {
      setError('Failed to fetch exchange rates');
      // Fallback rates for demo
      const fallbackRates: ExchangeRates = {};
      CURRENCIES.forEach(currency => {
        fallbackRates[currency.code] = '129.50';
      });
      setRates(fallbackRates);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    loadCachedRates();
    fetchExchangeRates();
    // Set up an interval to fetch rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exchange rates</Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => router.push('/(authenticated)/exchangeInfo' as any)}
        >
          <Ionicons name="information-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
      >
        {/* Base Currency Card */}
        <TouchableOpacity style={styles.baseCurrencyCard}>
          <Text style={styles.baseCurrencyText}>Kenyan Shilling</Text>
          <View style={styles.baseValueContainer}>
            <Text style={styles.baseCurrencyValue}>1.00</Text>
            <MaterialIcons name="chevron-right" size={24} color="white" />
          </View>
        </TouchableOpacity>

        {/* Last Updated Time */}
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}

        {/* Exchange Rates List */}
        <View style={styles.ratesList}>
          {CURRENCIES.map(currency => (
            <View key={currency.code} style={styles.rateItem}>
              <Text style={styles.currencyName}>{currency.name}</Text>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.rateValue}>{rates[currency.code]}</Text>
              )}
            </View>
          ))}
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
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
  },
  infoButton: {
    padding: 8,
  },
  baseCurrencyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333333',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
  },
  baseCurrencyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  baseValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  baseCurrencyValue: {
    color: 'white',
    fontSize: 16,
    marginRight: 4,
  },
  lastUpdated: {
    color: '#808080',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  ratesList: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  currencyName: {
    color: '#808080',
    fontSize: 16,
  },
  rateValue: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 8,
    marginHorizontal: 16,
  },
});

export default ExchangeRates;