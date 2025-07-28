import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import "../styles/global.css";

export default function RootLayout() {
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Inter': require('../assets/fonts/Inter-Regular.ttf'),
      });
    }
    loadFonts();
  }, []);

  return <Stack />;
}
