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
        if (!user.onboardingCompleted) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      } else {
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