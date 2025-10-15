/**
 * Integration Test: Admin Login Flow
 * T014: Based on quickstart.md Scenario 1
 * This test MUST FAIL initially (TDD Red phase)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../../src/context/AuthContext';
import { LoginScreen } from '../../src/screens/LoginScreen';
import { HomeScreen } from '../../src/screens/HomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    reset: mockReset,
  }),
}));

describe('Admin Login Flow Integration Test', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('should complete admin login flow successfully', async () => {
    // Render login screen with auth context
    const TestComponent = () => (
      <NavigationContainer>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </NavigationContainer>
    );

    render(<TestComponent />);

    // Step 1: Navigate to login screen (already there)
    expect(screen.getByText('Login')).toBeTruthy();

    // Step 2: Enter admin credentials
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Login');

    fireEvent.changeText(emailInput, 'admin@airschool.com');
    fireEvent.changeText(passwordInput, 'admin123');

    expect(emailInput.props.value).toBe('admin@airschool.com');
    expect(passwordInput.props.value).toBe('admin123');

    // Step 3: Submit login form
    fireEvent.press(loginButton);

    // Validation: Login form accepts credentials
    expect(loginButton).toBeTruthy();

    // Validation: Loading state shown during authentication
    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    }, { timeout: 1000 });

    // Step 4: Successful redirect after login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    }, { timeout: 5000 });

    // Validation: Session persisted in AsyncStorage
    const sessionData = await AsyncStorage.getItem('userSession');
    expect(sessionData).toBeTruthy();
    
    const session = JSON.parse(sessionData!);
    expect(session.email).toBe('admin@airschool.com');
    expect(session.role).toBe('admin');
    expect(session.userId).toBeTruthy();
    expect(session.token).toBeTruthy();
    expect(session.loginTimestamp).toBeTruthy();
  });

  it('should show admin UI elements after successful admin login', async () => {
    // Pre-setup: Login as admin
    const adminSession = {
      userId: 'admin-user-id',
      email: 'admin@airschool.com',
      role: 'admin',
      loginTimestamp: Date.now(),
      token: 'admin-token'
    };

    await AsyncStorage.setItem('userSession', JSON.stringify(adminSession));

    // Render home screen with admin session
    const TestComponent = () => (
      <NavigationContainer>
        <AuthProvider>
          <HomeScreen />
        </AuthProvider>
      </NavigationContainer>
    );

    render(<TestComponent />);

    // Step 5: Admin role detected correctly
    await waitFor(() => {
      expect(screen.getByTestId('admin-indicator')).toBeTruthy();
    });

    // Validation: Admin-specific UI elements visible
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
    expect(screen.getByText('Manage Users')).toBeTruthy();
    expect(screen.getByText('System Settings')).toBeTruthy();

    // Step 6: Admin menu/options should be accessible
    const adminMenuButton = screen.getByTestId('admin-menu-button');
    fireEvent.press(adminMenuButton);

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeTruthy();
      expect(screen.getByText('Content Management')).toBeTruthy();
      expect(screen.getByText('Analytics')).toBeTruthy();
    });
  });

  it('should handle admin login with loading states correctly', async () => {
    const TestComponent = () => (
      <NavigationContainer>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </NavigationContainer>
    );

    render(<TestComponent />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Login');

    // Enter credentials
    fireEvent.changeText(emailInput, 'admin@airschool.com');
    fireEvent.changeText(passwordInput, 'admin123');
    fireEvent.press(loginButton);

    // Loading state should appear immediately
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();

    // Login button should be disabled during loading
    expect(loginButton).toBeDisabled();

    // Loading should clear after authentication
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).toBeNull();
    }, { timeout: 5000 });
  });

  it('should preserve admin session across app restarts', async () => {
    // Setup: Admin session exists in storage
    const adminSession = {
      userId: 'admin-user-id',
      email: 'admin@airschool.com', 
      role: 'admin',
      loginTimestamp: Date.now(),
      token: 'valid-admin-token'
    };

    await AsyncStorage.setItem('userSession', JSON.stringify(adminSession));

    // Simulate app restart by rendering auth provider from scratch
    const TestComponent = () => (
      <NavigationContainer>
        <AuthProvider>
          <HomeScreen />
        </AuthProvider>
      </NavigationContainer>
    );

    render(<TestComponent />);

    // Should automatically restore admin session
    await waitFor(() => {
      expect(screen.getByTestId('admin-indicator')).toBeTruthy();
      expect(screen.getByText('Admin Dashboard')).toBeTruthy();
    });

    // Verify session is still in storage
    const storedSession = await AsyncStorage.getItem('userSession');
    expect(storedSession).toBeTruthy();
    expect(JSON.parse(storedSession!).role).toBe('admin');
  });

  it('should handle concurrent admin login attempts gracefully', async () => {
    const TestComponent = () => (
      <NavigationContainer>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </NavigationContainer>
    );

    render(<TestComponent />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Login');

    // Enter credentials
    fireEvent.changeText(emailInput, 'admin@airschool.com');
    fireEvent.changeText(passwordInput, 'admin123');

    // Attempt multiple rapid login clicks
    fireEvent.press(loginButton);
    fireEvent.press(loginButton);
    fireEvent.press(loginButton);

    // Should only process one login attempt
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    }, { timeout: 5000 });

    // Only one session should be created
    const sessionData = await AsyncStorage.getItem('userSession');
    expect(sessionData).toBeTruthy();
  });
});