import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function AuthenticatedLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="./(public)/signup" />;
  }

  return (
    <Stack >
      <Stack.Screen name="home" options={{
      statusBarBackgroundColor: 'black',
      title: '',
      headerBackTitle: '',
      headerStyle: { backgroundColor: 'black' },
      headerShown: false,
      }} />
      <Stack.Screen name="profile" options={{
        title: '',
        headerShown:false,
        statusBarBackgroundColor: 'black',

        
      }} />
      <Stack.Screen name="limits" options={{
        title: '',
        headerShown:false,
        statusBarBackgroundColor: 'black',
        
        
      }} />

      <Stack.Screen name="fees" options={{
        title: '',
        headerShown:false,
        statusBarBackgroundColor: 'black',
        
      }} />

<Stack.Screen name="exchangeRates" options={{
        title: '',
        headerShown:false,
        statusBarBackgroundColor: 'black',
        
      }} />
<Stack.Screen name="support" options={{
        title: '',
        headerShown:false,
        statusBarBackgroundColor: 'black',
        
      }} />

<Stack.Screen name="paymentMethod" options={{
        title: '',
        headerShown:false,
        statusBarBackgroundColor: 'black',
        
      }} />
<Stack.Screen name="personalDetails" options={{
        title: '',
        headerShown:true,
        statusBarBackgroundColor: 'black',
        
      }} />
<Stack.Screen name="displayCurrency" options={{
        title: '',
        headerShown:false,
        statusBarBackgroundColor: 'black',
        
      }} />
     <Stack.Screen name="invitePeople" options={{
        title: '',
        headerShown:false,
        statusBarBackgroundColor: 'black',
        
      }} />  

      

    </Stack>
  );
}