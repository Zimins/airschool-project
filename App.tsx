import React, { useEffect, createContext, useContext, useState } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { RootStackParamList } from './src/navigation/AppNavigator';

// Context to track if user came from password reset email
type PasswordResetContextType = {
  isFromPasswordReset: boolean;
  setIsFromPasswordReset: (value: boolean) => void;
};

const PasswordResetContext = createContext<PasswordResetContextType>({
  isFromPasswordReset: false,
  setIsFromPasswordReset: () => {},
});

export const usePasswordReset = () => useContext(PasswordResetContext);

// Web-specific error handler setup
if (Platform.OS === 'web') {
  // Suppress React Native Web warnings and errors that are not critical
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      args[0].includes('ErrorHandler')
    ) {
      // Suppress ErrorHandler warnings
      return;
    }
    originalError.apply(console, args);
  };
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'http://localhost:8083', 'http://localhost:8081'],
  config: {
    screens: {
      Home: '',
      Login: 'login',
      Signup: 'signup',
      Admin: 'admin',
      FlightSchoolDetail: {
        path: 'school/:schoolId',
        parse: {
          schoolId: (schoolId: string) => schoolId,
        },
      },
    },
  },
};

function AppContent() {
  const [isFromPasswordReset, setIsFromPasswordReset] = useState(false);

  useEffect(() => {
    // Check URL hash for password reset token (type=recovery)
    if (Platform.OS === 'web') {
      const checkPasswordReset = () => {
        const hash = window.location.hash;
        if (hash.includes('type=recovery') || hash.includes('type=password_recovery')) {
          console.log('🔑 Password reset link detected');
          setIsFromPasswordReset(true);
        }
      };

      checkPasswordReset();

      // Listen for hash changes
      window.addEventListener('hashchange', checkPasswordReset);
      return () => window.removeEventListener('hashchange', checkPasswordReset);
    }
  }, []);

  return (
    <PasswordResetContext.Provider value={{ isFromPasswordReset, setIsFromPasswordReset }}>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </PasswordResetContext.Provider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
