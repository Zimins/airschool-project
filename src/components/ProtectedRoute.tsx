/**
 * Protected Route Component
 * T033: Route protection for authenticated users
 */

import React, { ReactNode } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../styles/theme';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallbackRoute?: keyof RootStackParamList;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  fallbackRoute = 'Login',
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { state } = useAuth();

  // Show loading spinner while checking authentication
  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  // Redirect to fallback if not authenticated
  if (!state.isAuthenticated) {
    React.useEffect(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: fallbackRoute }],
      });
    }, [navigation, fallbackRoute]);

    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Redirecting to login...</Text>
      </View>
    );
  }

  // Check admin requirement
  if (requireAdmin && state.session?.role !== 'admin') {
    React.useEffect(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }, [navigation]);

    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Admin access required</Text>
        <Text style={styles.submessageText}>Redirecting to home...</Text>
      </View>
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

// Higher-order component version
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking route protection status
export function useRouteProtection() {
  const { state } = useAuth();
  
  return {
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.session?.role === 'admin',
    canAccessAdminRoutes: state.isAuthenticated && state.session?.role === 'admin',
    user: state.user,
    session: state.session,
  };
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  messageText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  submessageText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default ProtectedRoute;