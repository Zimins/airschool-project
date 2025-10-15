import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import FlightSchoolDetailScreen from '../screens/FlightSchoolDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CommunityBoardScreen from '../screens/CommunityBoardScreen';
import StudyBoardScreen from '../screens/StudyBoardScreen';

export type RootStackParamList = {
  Home: undefined;
  FlightSchoolDetail: { schoolId: string };
  Login: undefined;
  Signup: undefined;
  Admin: undefined;
  CommunityBoard: undefined;
  StudyBoard: undefined;
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
    </Stack.Navigator>
  );
};

export default AppNavigator;