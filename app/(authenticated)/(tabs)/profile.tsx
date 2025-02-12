import React from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      Alert.alert('Error signing out', 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileInitial}>
              <Text style={styles.initialText}>{user?.firstName?.[0] || 'U'}</Text>
            </View>
          )}
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(authenticated)/(tabs)/invitePeople')}>
            <Ionicons name="mail-outline" size={24} color="white" />
            <Text style={styles.menuText}>Invite friends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/displayCurrency')}>
            <MaterialCommunityIcons name="currency-usd" size={24} color="white" />
            <Text style={styles.menuText}>Display currency</Text>
            <Text style={styles.menuSubtext}>KES</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/personalDetails')}>
            <Ionicons name="person-outline" size={24} color="white" />
            <Text style={styles.menuText}>Personal details</Text>
          </TouchableOpacity>

                   <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/paymentMethod')}>
            <MaterialCommunityIcons name="credit-card-outline" size={24} color="white" />
            <Text style={styles.menuText}>Payment Method</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/fees')}>
            <Ionicons name="pricetag-outline" size={24} color="white" />
            <Text style={styles.menuText}>Fees</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/limits')}>
            <MaterialIcons name="trending-up" size={24} color="white" />
            <Text style={styles.menuText}>Limits</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/exchangeRates')}>
            <FontAwesome5 name="exchange" size={24} color="white" />
            <Text style={styles.menuText}>Exchange rate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/support')}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="white" />
            <Text style={styles.menuText}>Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/')}>
            <MaterialIcons name="menu" size={24} color="white" />
            <Text style={styles.menuText}>More</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={24} color="#FF4444" />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  backButton: { padding: 16 },
  profileSection: { alignItems: 'center', paddingVertical: 20 },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  profileInitial: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#8A2BE2', justifyContent: 'center', alignItems: 'center' },
  initialText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  menuContainer: { paddingHorizontal: 16, paddingTop: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#333333' },
  menuText: { color: 'white', fontSize: 16, marginLeft: 16 },
  menuSubtext: { color: '#808080', fontSize: 14, marginLeft: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, marginTop: 16 },
  logoutText: { color: '#FF4444', fontSize: 16, marginLeft: 16 },
});

export default ProfileScreen;
