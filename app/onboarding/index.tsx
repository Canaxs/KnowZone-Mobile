import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';

export default function OnboardingIndex() {
  const { clearAllData } = useAuthStore();
  
  useEffect(() => {
    router.replace('/onboarding/gender');
  }, []);

  const handleClearData = async () => {
    try {
      await clearAllData();

      router.replace('/');
    } catch (error) {
    }
  };

  return null;
} 