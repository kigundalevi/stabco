import { Link, router, Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from '@/constants/Colors';


import React from "react";
import { TouchableOpacity } from "react-native";

const RootLayoutNav = () => {
  return <Stack >
    <Stack.Screen 
       name="home"  options={{
               statusBarBackgroundColor: 'black',
                title: '',
                headerBackTitle: '',
                headerStyle: { backgroundColor: 'black' },
                headerShown: false,
             }} />
    <Stack.Screen 
       name="invest"/>
    <Stack.Screen 
       name="profile"/>
    <Stack.Screen 
       name="history"/>


  </Stack>;
};

export default RootLayoutNav;