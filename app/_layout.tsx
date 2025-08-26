import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Cairo_400Regular, Cairo_700Bold, Cairo_600SemiBold, Cairo_500Medium } from '@expo-google-fonts/cairo';
import * as SplashScreen from 'expo-splash-screen';
import { I18nManager } from 'react-native';
import { initializeDatabase, checkOnboardingStatus } from '@/lib/database';
import { useSettingsStore } from '@/stores/settings';
import OnboardingScreen from '@/components/OnboardingScreen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const { language } = useSettingsStore();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  
  const [fontsLoaded, fontError] = useFonts({
    'Cairo-Regular': Cairo_400Regular,
    'Cairo-Medium': Cairo_500Medium,
    'Cairo-SemiBold': Cairo_600SemiBold,
    'Cairo-Bold': Cairo_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Set RTL based on language
    const isRTL = language === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    
    // Initialize database and check onboarding
    const initApp = async () => {
      try {
        await initializeDatabase();
        const completed = await checkOnboardingStatus();
        setOnboardingCompleted(completed);
      } catch (error) {
        console.error('Error initializing app:', error);
        setOnboardingCompleted(false);
      }
    };
    
    initApp();
  }, [language]);

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (onboardingCompleted === null) {
    return null; // Loading
  }

  if (!onboardingCompleted) {
    return (
      <>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}