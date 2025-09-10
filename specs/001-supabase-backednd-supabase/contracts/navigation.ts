/**
 * Navigation Contract for Authentication
 * Defines route protection and navigation requirements
 */

import { UserRole } from './types';

/**
 * Protected Route Configuration
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

/**
 * Route Access Control
 */
export interface RoutePermissions {
  // Public routes (no authentication required)
  public: string[];
  
  // Routes requiring any authenticated user
  authenticated: string[];
  
  // Routes requiring admin privileges
  admin: string[];
}

/**
 * Default Route Configuration
 */
export const defaultRoutePermissions: RoutePermissions = {
  public: [
    '/login',
    '/signup',
    '/', // Landing page
  ],
  authenticated: [
    '/home',
    '/profile',
    '/schools',
    '/schools/:id',
    '/reviews',
  ],
  admin: [
    '/admin',
    '/admin/users',
    '/admin/schools',
    '/admin/analytics',
  ]
};

/**
 * Navigation Service Contract
 */
export interface NavigationServiceContract {
  /**
   * Check if user has access to a specific route
   * @param route - Route path to check
   * @param userRole - Current user role (null if not authenticated)
   * @returns boolean indicating if access is allowed
   */
  canAccessRoute(route: string, userRole?: UserRole | null): boolean;

  /**
   * Get redirect path for unauthorized access
   * @param attemptedRoute - Route user tried to access
   * @param userRole - Current user role (null if not authenticated)
   * @returns path to redirect to
   */
  getRedirectPath(attemptedRoute: string, userRole?: UserRole | null): string;

  /**
   * Get appropriate home route for user role
   * @param userRole - User role to determine home route
   * @returns home route path
   */
  getHomeRoute(userRole: UserRole): string;
}

/**
 * Route Guard Props
 */
export interface RouteGuardProps {
  isAuthenticated: boolean;
  userRole?: UserRole;
  requiredRole?: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Expected Navigation Flows
 */
export interface NavigationFlow {
  // Unauthenticated user accessing protected route
  unauthenticatedAccess: {
    trigger: 'Navigate to protected route without authentication';
    action: 'Redirect to /login with return URL';
  };

  // Successful login
  successfulLogin: {
    trigger: 'Valid credentials submitted';
    action: 'Redirect to home route or return URL';
  };

  // Insufficient permissions
  insufficientPermissions: {
    trigger: 'Authenticated user accessing admin-only route';
    action: 'Redirect to appropriate home route with error message';
  };

  // Session expiry
  sessionExpiry: {
    trigger: 'Invalid/expired session detected';
    action: 'Clear session and redirect to login';
  };

  // Logout
  logout: {
    trigger: 'User initiates logout';
    action: 'Clear session and redirect to landing page';
  };
}