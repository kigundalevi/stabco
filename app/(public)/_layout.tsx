import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function PublicLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="./(authenticated)/(tabs)/home" />;
  }
  

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signup" />
         </Stack>
  );
}