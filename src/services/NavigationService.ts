/**
 * Navigation Service Implementation
 * Route protection and access control
 */

import { UserRole } from '../types/auth';

export interface RoutePermissions {
  public: string[];
  authenticated: string[];
  admin: string[];
}

export class NavigationService {
  private static readonly routePermissions: RoutePermissions = {
    public: [
      '/',
      '/login',
      '/signup',
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
   * Check if user has access to a specific route
   */
  canAccessRoute(route: string, userRole?: UserRole | null): boolean {
    const normalizedRoute = this.normalizeRoute(route);
    
    // Handle malformed routes
    if (!normalizedRoute || normalizedRoute === 'invalid-route') {
      return false;
    }

    // Check public routes (accessible to everyone)
    if (this.isPublicRoute(normalizedRoute)) {
      return true;
    }

    // Check authenticated routes (require any user role)
    if (this.isAuthenticatedRoute(normalizedRoute) && userRole) {
      return true;
    }

    // Check admin routes (require admin role)
    if (this.isAdminRoute(normalizedRoute) && userRole === 'admin') {
      return true;
    }

    return false;
  }

  /**
   * Get redirect path for unauthorized access
   */
  getRedirectPath(attemptedRoute: string, userRole?: UserRole | null): string {
    const normalizedRoute = this.normalizeRoute(attemptedRoute);
    
    // If already on appropriate route, stay there
    if (this.canAccessRoute(normalizedRoute, userRole)) {
      return normalizedRoute;
    }

    // Unauthenticated user trying to access protected route
    if (!userRole) {
      return '/login';
    }

    // Regular user trying to access admin route
    if (userRole === 'user' && this.isAdminRoute(normalizedRoute)) {
      return '/home';
    }

    // Default redirect
    return this.getHomeRoute(userRole);
  }

  /**
   * Get appropriate home route for user role
   */
  getHomeRoute(userRole: UserRole): string {
    return userRole === 'admin' ? '/admin' : '/home';
  }

  /**
   * Normalize route path
   */
  private normalizeRoute(route: string): string {
    if (!route) {
      return '';
    }

    // Handle empty or malformed routes
    if (route === '' || route === 'invalid-route' || route.startsWith('/unknown')) {
      return 'invalid-route';
    }

    // Case sensitivity - routes should be lowercase
    if (route !== route.toLowerCase()) {
      return '';
    }

    // Add leading slash if missing
    let normalized = route.startsWith('/') ? route : `/${route}`;
    
    // Remove trailing slash (except for root)
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    // Handle query parameters and fragments (preserve the base route)
    if (normalized.includes('?') || normalized.includes('#')) {
      const baseRoute = normalized.split(/[?#]/)[0];
      return baseRoute;
    }

    return normalized;
  }

  /**
   * Check if route is public
   */
  private isPublicRoute(route: string): boolean {
    return NavigationService.routePermissions.public.includes(route);
  }

  /**
   * Check if route requires authentication
   */
  private isAuthenticatedRoute(route: string): boolean {
    // Check exact matches
    if (NavigationService.routePermissions.authenticated.includes(route)) {
      return true;
    }

    // Check dynamic routes (e.g., /schools/:id matches /schools/123)
    return NavigationService.routePermissions.authenticated.some(pattern => {
      if (pattern.includes(':')) {
        const regex = new RegExp('^' + pattern.replace(':id', '[^/]+') + '$');
        return regex.test(route);
      }
      return false;
    });
  }

  /**
   * Check if route requires admin access
   */
  private isAdminRoute(route: string): boolean {
    // Check exact matches
    if (NavigationService.routePermissions.admin.includes(route)) {
      return true;
    }

    // Check if route starts with admin path
    return route.startsWith('/admin/');
  }

  /**
   * Get all routes for a specific access level
   */
  getRoutesByAccessLevel(level: 'public' | 'authenticated' | 'admin'): string[] {
    return NavigationService.routePermissions[level];
  }

  /**
   * Check if route pattern matches actual route
   */
  matchesRoutePattern(pattern: string, actualRoute: string): boolean {
    if (pattern === actualRoute) {
      return true;
    }

    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(':id', '[^/]+') + '$');
      return regex.test(actualRoute);
    }

    return false;
  }

  /**
   * Extract route parameters
   */
  extractRouteParams(pattern: string, actualRoute: string): Record<string, string> {
    const params: Record<string, string> = {};

    if (!pattern.includes(':')) {
      return params;
    }

    const patternParts = pattern.split('/');
    const routeParts = actualRoute.split('/');

    if (patternParts.length !== routeParts.length) {
      return params;
    }

    patternParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.substring(1);
        params[paramName] = routeParts[index];
      }
    });

    return params;
  }

  /**
   * Get breadcrumb path for route
   */
  getBreadcrumbs(route: string): Array<{ label: string; path: string }> {
    const parts = route.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; path: string }> = [];

    let currentPath = '';
    parts.forEach(part => {
      currentPath += `/${part}`;
      breadcrumbs.push({
        label: this.formatRouteName(part),
        path: currentPath
      });
    });

    return breadcrumbs;
  }

  /**
   * Format route name for display
   */
  private formatRouteName(routePart: string): string {
    return routePart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Check if navigation is allowed from current to target route
   */
  canNavigateTo(fromRoute: string, toRoute: string, userRole?: UserRole | null): boolean {
    // Can always navigate to accessible routes
    return this.canAccessRoute(toRoute, userRole);
  }

  /**
   * Get suggested routes for user role
   */
  getSuggestedRoutes(userRole?: UserRole | null): string[] {
    const suggestions: string[] = [];

    // Add public routes
    suggestions.push(...NavigationService.routePermissions.public);

    // Add authenticated routes if user is logged in
    if (userRole) {
      suggestions.push(...NavigationService.routePermissions.authenticated);
    }

    // Add admin routes if user is admin
    if (userRole === 'admin') {
      suggestions.push(...NavigationService.routePermissions.admin);
    }

    return suggestions;
  }
}