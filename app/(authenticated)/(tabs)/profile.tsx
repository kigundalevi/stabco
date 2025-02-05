import { View, Text, Button, Alert } from 'react-native';
import React from 'react';
import { SignOutButton, useAuth } from '@clerk/clerk-react';
import { router } from 'expo-router';



const profile = () => {
    const { signOut} = useAuth();
    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/');
        } catch (error) {
            Alert.alert('Error signing out', 'Please try again');
        }
    }
  return (
    <View>
         <SignOutButton>
        <Button title='sign out' onPress={handleSignOut}></Button>
    </SignOutButton>
    </View>
  )
}

export default profile;