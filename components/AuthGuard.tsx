import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuthStatus, isLoading, user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthStatus();
      setIsInitialized(true);
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (isAuthenticated && user) {
        // Kullanıcı giriş yapmış, onboarding durumunu kontrol et
        if (!user.isOnboardingCompleted) {
          // Onboarding tamamlanmamış, onboarding'e yönlendir
          router.replace('/onboarding');
        } else {
          // Onboarding tamamlanmış, ana sayfaya yönlendir
          router.replace('/(tabs)');
        }
      } else {
        // Kullanıcı giriş yapmamış, welcome sayfasına yönlendir
        router.replace('/');
      }
    }
  }, [isInitialized, isAuthenticated, isLoading, user]);

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return <>{children}</>;
}