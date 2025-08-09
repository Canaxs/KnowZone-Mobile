import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="gender" options={{ headerShown: false }} />
      <Stack.Screen name="interests" options={{ headerShown: false }} />
      <Stack.Screen name="hobbies" options={{ headerShown: false }} />
      <Stack.Screen name="idealperson" options={{ headerShown: false }} />
      <Stack.Screen name="location" options={{ headerShown: false }} />
    </Stack>
  );
}