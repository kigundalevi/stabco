import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Support = () => {
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
        <Text style={styles.headerTitle}>Support</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {/* Chat Option */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/')}
        >
          <MaterialCommunityIcons 
            name="message-outline" 
            size={24} 
            color="white" 
          />
          <Text style={styles.menuText}>Chat</Text>
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color="white" 
            style={styles.chevron}
          />
        </TouchableOpacity>

        {/* FAQs Option */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/')}
        >
          <MaterialCommunityIcons 
            name="help-circle-outline" 
            size={24} 
            color="white" 
          />
          <Text style={styles.menuText}>FAQS</Text>
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color="white" 
            style={styles.chevron}
          />
        </TouchableOpacity>

        {/* Status Page Option */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/')}
        >
          <MaterialCommunityIcons 
            name="file-document-outline" 
            size={24} 
            color="white" 
          />
          <Text style={styles.menuText}>Status page</Text>
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color="white" 
            style={styles.chevron}
          />
        </TouchableOpacity>
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
  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  chevron: {
    opacity: 0.7,
  },
});

export default Support;