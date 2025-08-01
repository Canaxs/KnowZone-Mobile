import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import AuthGuard from '../components/AuthGuard';
import { fcmService } from '../lib/fcmService';
import { useAuthStore } from '../stores/authStore';
import "../styles/global.css";

export default function RootLayout() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Inter': require('../assets/fonts/Inter-Regular.ttf'),
      });
    }
    loadFonts();
  }, []);

  useEffect(() => {
    // FCM notification handlers'ları kur
    fcmService.setupNotificationHandlers();
  }, []);

  return (
    <AuthGuard>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="all-matches" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}