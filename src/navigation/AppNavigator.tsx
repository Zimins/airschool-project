import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProtectedRoute } from '../components/ProtectedRoute';
import HomeScreen from '../screens/HomeScreen';
import FlightSchoolDetailScreen from '../screens/FlightSchoolDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
// Temporarily removed screens for e2e testing

export type RootStackParamList = {
  Home: undefined;
  FlightSchoolDetail: { schoolId: string };
  Login: undefined;
  Signup: undefined;
  Admin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
      />
      <Stack.Screen 
        name="FlightSchoolDetail" 
        component={FlightSchoolDetailScreen}
        options={{ title: 'Flight School Details' }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: 'Sign Up' }}
      />
      <Stack.Screen
        name="Admin"
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      {/* Temporarily removed board screens for e2e testing */}
    </Stack.Navigator>
  );
};

export default AppNavigator;