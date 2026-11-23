import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import FlightSchoolDetailScreen from '../screens/FlightSchoolDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CommunityBoardScreen from '../screens/CommunityBoardScreen';
import StudyBoardScreen from '../screens/StudyBoardScreen';
import LegalDocumentScreen from '../screens/LegalDocumentScreen';

/** Sidebar sections of the admin dashboard. */
export type AdminMenu = 'dashboard' | 'schools' | 'materials' | 'posts' | 'users' | 'legal';

export type RootStackParamList = {
  Home: undefined;
  FlightSchoolDetail: { schoolId: string };
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Admin: { initialMenu?: AdminMenu } | undefined;
  CommunityBoard: undefined;
  StudyBoard: undefined;
  Terms: undefined;
  Privacy: undefined;
  CommunityGuidelines: undefined;
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
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Forgot Password' }}
      />
      <Stack.Screen
        name="Admin"
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="CommunityBoard"
        component={CommunityBoardScreen}
        options={{ title: 'Community Board' }}
      />
      <Stack.Screen
        name="StudyBoard"
        component={StudyBoardScreen}
        options={{ title: 'Study Board' }}
      />
      <Stack.Screen
        name="Terms"
        component={LegalDocumentScreen}
        options={{ title: 'Terms of Service' }}
      />
      <Stack.Screen
        name="Privacy"
        component={LegalDocumentScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="CommunityGuidelines"
        component={LegalDocumentScreen}
        options={{ title: 'Community Guidelines' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;