import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProtectedRoute } from '../components/ProtectedRoute';
import HomeScreen from '../screens/HomeScreen';
import FlightSchoolDetailScreen from '../screens/FlightSchoolDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import CommunityBoardScreen from '../screens/CommunityBoardScreen';
import StudyBoardScreen from '../screens/StudyBoardScreen';
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import SchoolsManagementScreen from '../screens/admin/SchoolsManagementScreen';
import MaterialsManagementScreen from '../screens/admin/MaterialsManagementScreen';

export type RootStackParamList = {
  Home: undefined;
  FlightSchoolDetail: { schoolId: string };
  Login: undefined;
  Signup: undefined;
  CommunityBoard: undefined;
  StudyBoard: undefined;
  Admin: undefined; // Admin landing route
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminSchools: undefined;
  AdminMaterials: undefined;
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
        name="CommunityBoard" 
        options={{ title: 'Community Board' }}
      >
        {() => (
          <ProtectedRoute>
            <CommunityBoardScreen />
          </ProtectedRoute>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="StudyBoard" 
        options={{ title: 'Study Board' }}
      >
        {() => (
          <ProtectedRoute>
            <StudyBoardScreen />
          </ProtectedRoute>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Admin" 
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen 
        name="AdminLogin" 
        component={AdminLoginScreen}
        options={{ title: 'Admin Login' }}
      />
      <Stack.Screen 
        name="AdminDashboard" 
        options={{ title: 'Admin Dashboard' }}
      >
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminDashboardScreen />
          </ProtectedRoute>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="AdminSchools" 
        options={{ title: 'Manage Schools' }}
      >
        {() => (
          <ProtectedRoute requireAdmin>
            <SchoolsManagementScreen />
          </ProtectedRoute>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="AdminMaterials" 
        options={{ title: 'Manage Materials' }}
      >
        {() => (
          <ProtectedRoute requireAdmin>
            <MaterialsManagementScreen />
          </ProtectedRoute>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AppNavigator;