/**
 * Authentication Context Implementation
 * T028-T029: AuthContext provider and hooks
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthActions, UserLoginData, UserCreateData, User, UserSession } from '../types/auth';
import { AuthService } from '../services/AuthService';
import { SessionManager } from '../utils/session';

// Initial auth state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  session: null,
  error: null,
};

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; session: UserSession } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        session: action.payload.session,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialAuthState,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Context creation
const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthActionsContext = createContext<AuthActions | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const authService = new AuthService();

  // Check for existing session on app start
  useEffect(() => {
    checkSession();
  }, []);

  // Auth actions implementation
  const login = async (credentials: UserLoginData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const session = await authService.login(credentials);
      
      if (!session) {
        throw new Error('Invalid email or password');
      }

      // Get user data for the session
      const user: User = {
        id: session.userId,
        email: session.email,
        role: session.role,
        nickname: session.nickname, // Include nickname from session
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_active: true,
      };

      dispatch({ 
        type: 'SET_USER', 
        payload: { user, session } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🔴 AuthContext: Starting logout...');
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      console.log('🔴 Calling authService.logout()...');
      await authService.logout();
      console.log('✅ authService.logout() completed');
      dispatch({ type: 'LOGOUT' });
      console.log('✅ Logout state dispatched');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Always clear state even if logout fails
      dispatch({ type: 'LOGOUT' });
      console.log('✅ Logout state dispatched (error recovery)');
    }
  };

  const register = async (userData: UserCreateData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await authService.register(userData);

      // Check if user was created and session exists (email confirmation disabled)
      if (result && result.session) {
        // If we got a session back, the user is immediately signed in
        const userRole = result.user?.user_metadata?.role || 'user';

        // Try to fetch nickname from profiles (if it exists)
        let nickname: string | undefined;
        try {
          const { data: profileData } = await authService['supabase']
            .from('profiles')
            .select('nickname')
            .eq('id', result.user!.id)
            .single();

          if (profileData) {
            nickname = profileData.nickname;
          }
        } catch (error) {
          console.warn('Failed to fetch profile during registration:', error);
        }

        const user: User = {
          id: result.user!.id,
          email: result.user!.email || userData.email,
          role: userRole as 'user' | 'admin',
          nickname, // Include nickname if available
          created_at: result.user!.created_at || new Date().toISOString(),
          last_login: null,
          is_active: true,
        };

        const session: UserSession = {
          userId: result.user!.id,
          email: result.user!.email || userData.email,
          role: userRole as 'user' | 'admin',
          nickname, // Include nickname in session
          loginTimestamp: Date.now(),
          token: result.session.access_token,
          supabaseSession: result.session
        };

        // Save session and update state
        await SessionManager.saveSession(session);
        dispatch({
          type: 'SET_USER',
          payload: { user, session }
        });
      } else {
        // Registration successful but email confirmation required
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({
          type: 'SET_ERROR',
          payload: 'Registration successful! Please check your email to confirm your account before signing in.'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const checkSession = async (): Promise<void> => {
    console.log('🔍 checkSession called');
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // First check Supabase Auth session
      const supabaseSession = await authService.getCurrentSupabaseSession();

      if (supabaseSession && supabaseSession.user) {
        // Valid Supabase session exists
        const userRole = supabaseSession.user.user_metadata?.role || 'user';

        // Fetch nickname from profiles table
        let nickname: string | undefined;
        try {
          const authService = new AuthService();
          const { data: profileData } = await authService['supabase']
            .from('profiles')
            .select('nickname')
            .eq('id', supabaseSession.user.id)
            .single();

          if (profileData) {
            nickname = profileData.nickname;
          }
        } catch (error) {
          console.warn('Failed to fetch profile in checkSession:', error);
        }

        const user: User = {
          id: supabaseSession.user.id,
          email: supabaseSession.user.email || '',
          role: userRole as 'user' | 'admin',
          nickname, // Include nickname from profiles
          created_at: supabaseSession.user.created_at || new Date().toISOString(),
          last_login: supabaseSession.user.last_sign_in_at || null,
          is_active: true,
        };

        const session: UserSession = {
          userId: supabaseSession.user.id,
          email: supabaseSession.user.email || '',
          role: userRole as 'user' | 'admin',
          nickname, // Include nickname in session
          loginTimestamp: Date.now(),
          token: supabaseSession.access_token,
          supabaseSession
        };

        // Save to local storage for offline access
        await SessionManager.saveSession(session);

        dispatch({
          type: 'SET_USER',
          payload: { user, session }
        });
      } else {
        // No valid Supabase session, check local storage as fallback
        const localSession = await SessionManager.getSession();

        if (localSession && SessionManager.isAuthenticated(localSession)) {
          // Local session exists but Supabase session doesn't - this shouldn't happen in normal flow
          // Clear local session to maintain consistency
          await SessionManager.clearSession();
        }

        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.warn('Session check failed:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const actions: AuthActions = {
    login,
    logout,
    register,
    checkSession,
    clearError,
  };

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

// Custom hooks for using auth context
export function useAuthState(): AuthState {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
}

export function useAuthActions(): AuthActions {
  const context = useContext(AuthActionsContext);
  if (context === undefined) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }
  return context;
}

// Combined hook for convenience
export function useAuth(): { state: AuthState; actions: AuthActions } {
  return {
    state: useAuthState(),
    actions: useAuthActions(),
  };
}

// Hook for checking if user is authenticated
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthState();
  return isAuthenticated;
}

// Hook for checking if user is admin
export function useIsAdmin(): boolean {
  const { session } = useAuthState();
  return SessionManager.isAdmin(session);
}

// Hook for getting current user
export function useCurrentUser(): User | null {
  const { user } = useAuthState();
  return user;
}

// Hook for getting current session
export function useCurrentSession(): UserSession | null {
  const { session } = useAuthState();
  return session;
}

// HOC for components that require authentication
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuthState();

    if (isLoading) {
      return <div>Loading...</div>; // Or your loading component
    }

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>; // Or redirect to login
    }

    return <Component {...props} />;
  };
}

// HOC for components that require admin access
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AdminAuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, session } = useAuthState();

    if (isLoading) {
      return <div>Loading...</div>; // Or your loading component
    }

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>; // Or redirect to login
    }

    if (!SessionManager.isAdmin(session)) {
      return <div>Admin access required.</div>; // Or redirect to home
    }

    return <Component {...props} />;
  };
}

// Debug hook (development only)
export function useAuthDebug(): any {
  const state = useAuthState();
  
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return {
    state,
    sessionAge: state.session ? SessionManager.getSessionAge(state.session) : null,
    remainingTime: state.session ? SessionManager.getRemainingSessionTime(state.session) : null,
    isSessionExpired: state.session ? SessionManager.isSessionExpired(state.session) : null,
    isTokenValid: state.session ? SessionManager.verifySessionToken(state.session) : null,
  };
}