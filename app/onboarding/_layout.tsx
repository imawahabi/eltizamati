import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0B63FF" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="welcome" 
          options={{
            title: 'مرحباً',
          }}
        />
        <Stack.Screen 
          name="setup" 
          options={{
            title: 'الإعداد',
          }}
        />
        <Stack.Screen 
          name="permissions" 
          options={{
            title: 'الأذونات',
          }}
        />
      </Stack>
    </>
  );
}
