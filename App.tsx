import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { RootStackParamList } from './src/navigation/AppNavigator';

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

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
