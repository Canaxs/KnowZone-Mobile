import { router } from 'expo-router';
import { useEffect } from 'react';

export default function OnboardingIndex() {
  // Bu ekran otomatik olarak ilgi alanları ekranına yönlendirir
  useEffect(() => {
    router.replace('/onboarding/interests');
  }, []);
  return null;
} 