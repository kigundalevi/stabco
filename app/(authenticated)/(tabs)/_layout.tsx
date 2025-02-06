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
        headerShown:false
        
      }} />
    </Stack>
  );
}