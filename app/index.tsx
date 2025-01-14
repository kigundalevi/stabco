import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { defaultStyles } from '@/constants/styles';
import Colors from '@/constants/Colors';

const Page = () => {
  return (
    <View style={styles.container}>
      {/* <Image source={require('@/assets/images/back.jpg')} style={styles.backgroundImg} /> */}
      <View style={styles.overlay}>
        <Text style={styles.text}>A new age of money transfer</Text>
      </View>
        <View style={styles.buttons}>
          <Link href={'/login'}
          style={[
            defaultStyles.pillButton,
            {
            flex:1,
            backgroundColor:'black',
            marginBottom:20,
            padding:20
          }
          ]} 
          asChild>
            <TouchableOpacity>
              <Text style={{color:'white'}}>Log in </Text>
            </TouchableOpacity>
          </Link>
          <Link href={'/signup'}
          style={[
            defaultStyles.pillButton,
            {
            flex:1,
            backgroundColor:'black',
            marginBottom:20,
            padding:20
          }
          ]} 
          asChild>
            <TouchableOpacity>
              <Text style={{color:'white'}}>signup</Text>
            </TouchableOpacity>
          </Link>
        </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white',
  },
  backgroundImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems:'center' // Center content horizontally
  },
  text: {
    fontSize: 24,
    color: 'black', // White text color to contrast with the background
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttons:{
    flexDirection:'row',
    justifyContent:'center',
    gap:20,
  }
});

export default Page;
