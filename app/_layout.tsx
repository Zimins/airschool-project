import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../src/styles/theme';
import { AlertProvider } from '../src/contexts/AlertContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import CustomAlert from '../src/components/CustomAlert';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="school/[id]" />
        </Stack>
        <CustomAlert />
      </AlertProvider>
    </AuthProvider>
  );
}