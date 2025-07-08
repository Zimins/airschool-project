import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import FlightSchoolDetailScreen from '../screens/FlightSchoolDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

export type RootStackParamList = {
  Home: undefined;
  FlightSchoolDetail: { schoolId: string };
  Login: undefined;
  Signup: undefined;
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
        options={{ title: '비행 학교 상세' }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: '로그인' }}
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{ title: '회원가입' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;