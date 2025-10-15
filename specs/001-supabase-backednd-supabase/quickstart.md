# Quickstart Guide: Authentication System Testing

**Feature**: Simple Authentication System with Admin Support  
**Version**: 0.1.0  
**Last Updated**: 2025-09-10

## Prerequisites

Before testing the authentication system, ensure:
- Supabase project is configured
- Users table is created with proper schema
- Admin account is seeded in database
- Required npm packages are installed

## Environment Setup

1. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js crypto-js @react-native-async-storage/async-storage
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-dom
   ```

2. **Configure Supabase**
   ```bash
   # Ensure .env file has Supabase credentials
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   ```sql
   -- Run in Supabase SQL editor
   -- (Copy from data-model.md migration script)
   CREATE TABLE users (...);
   INSERT INTO users (email, password_hash, role) VALUES ('admin@airschool.com', 'hashed_password', 'admin');
   ```

## Manual Testing Scenarios

### Scenario 1: Admin Login Flow
**Test**: Admin can login and access admin features

1. Navigate to login screen
2. Enter admin credentials:
   - Email: `admin@airschool.com`
   - Password: `admin123`
3. Submit login form
4. **Expected**: Redirect to home screen with admin UI elements visible
5. **Expected**: Admin menu/options should be accessible

**Validation Checklist**:
- [ ] Login form accepts credentials
- [ ] Loading state shown during authentication
- [ ] Successful redirect after login
- [ ] Admin role detected correctly
- [ ] Admin-specific UI elements visible
- [ ] Session persisted in AsyncStorage

### Scenario 2: Regular User Registration
**Test**: New user can create account and login

1. Navigate to signup screen
2. Enter new user data:
   - Email: `testuser@example.com`
   - Password: `password123`
3. Submit registration form
4. **Expected**: Account created successfully
5. Navigate to login screen
6. Login with new credentials
7. **Expected**: Successful login with user role

**Validation Checklist**:
- [ ] Registration form accepts valid input
- [ ] Password is hashed before storage
- [ ] New user created in database
- [ ] Login works with new account
- [ ] User role assigned correctly
- [ ] No admin UI elements visible

### Scenario 3: Invalid Login Handling
**Test**: System properly handles invalid credentials

1. Navigate to login screen
2. Enter invalid credentials:
   - Email: `wrong@example.com`
   - Password: `wrongpassword`
3. Submit login form
4. **Expected**: Error message displayed
5. **Expected**: User remains on login screen

**Validation Checklist**:
- [ ] Error message is user-friendly
- [ ] No navigation occurs on failed login
- [ ] Form can be resubmitted
- [ ] Loading state clears after error
- [ ] No session created for invalid login

### Scenario 4: Protected Route Access
**Test**: Unauthenticated users cannot access protected content

1. Clear AsyncStorage (simulate not logged in)
2. Navigate directly to protected route (e.g., `/home`)
3. **Expected**: Redirect to login screen
4. Login successfully
5. **Expected**: Redirect to originally requested route

**Validation Checklist**:
- [ ] Protected routes check authentication
- [ ] Redirect preserves intended destination
- [ ] Login redirects to correct route
- [ ] Route guards work consistently

### Scenario 5: Session Persistence
**Test**: User sessions persist across app restarts

1. Login successfully
2. Close/restart application
3. **Expected**: User remains logged in
4. Navigate to protected routes
5. **Expected**: Access granted without re-login

**Validation Checklist**:
- [ ] Session data saved in AsyncStorage
- [ ] Session validation on app start
- [ ] Expired sessions handled gracefully
- [ ] Invalid sessions cleared automatically

### Scenario 6: Logout Flow
**Test**: Users can logout and session is cleared

1. Login successfully
2. Navigate to profile/settings
3. Click logout button
4. **Expected**: Redirect to login screen
5. Try accessing protected route
6. **Expected**: Access denied, redirect to login

**Validation Checklist**:
- [ ] Logout clears session data
- [ ] AsyncStorage is cleaned
- [ ] UI updates to unauthenticated state
- [ ] Protected routes are blocked after logout

### Scenario 7: Admin User Management
**Test**: Admin can view and manage users

1. Login as admin
2. Navigate to admin users section
3. **Expected**: List of all users displayed
4. View user details
5. **Expected**: User information shown (no sensitive data)

**Validation Checklist**:
- [ ] Admin routes accessible to admin users
- [ ] User list loads correctly
- [ ] User data properly formatted
- [ ] Password hashes not exposed
- [ ] Role information displayed correctly

## Automated Test Scenarios

### Unit Tests
```bash
npm test -- --testPathPattern=auth
```

**Key Test Cases**:
- Password hashing function
- Session token generation
- Email validation
- User data formatting
- Error handling

### Integration Tests
```bash
npm test -- --testPathPattern=integration
```

**Key Test Cases**:
- Login service with real Supabase
- User registration flow
- Session management
- Database queries
- Route protection

### E2E Tests (Future)
```bash
npm run test:e2e
```

**Key Test Cases**:
- Complete login/logout flow
- Multi-role access patterns
- Session persistence across restarts
- Error recovery scenarios

## Performance Validation

### Response Time Tests
- Login should complete within 3 seconds
- Route navigation should be instant with cached session
- User list should load within 2 seconds

### Memory Usage Tests
- Session data should be minimal in AsyncStorage
- No memory leaks from authentication state
- Proper cleanup on logout

## Error Recovery Testing

### Network Failure Simulation
1. Disconnect network during login
2. **Expected**: Appropriate error message
3. Reconnect network
4. Retry login
5. **Expected**: Successful authentication

### Database Connection Issues
1. Invalid Supabase credentials
2. **Expected**: Connection error handling
3. Graceful fallback to cached session if available

### Malformed Data Handling
1. Submit login with special characters
2. **Expected**: Input validation prevents issues
3. **Expected**: No SQL injection vulnerabilities

## Success Criteria

All manual scenarios must pass with validation checklists completed.

**Definition of Done**:
- [ ] All 7 manual scenarios pass
- [ ] Unit tests achieve >90% coverage
- [ ] Integration tests pass with real database
- [ ] No console errors during normal operation
- [ ] Performance targets met
- [ ] Error recovery works as expected
- [ ] Security validations pass

## Troubleshooting Guide

### Common Issues
1. **"Network Error"**: Check Supabase configuration
2. **"Permission Denied"**: Verify RLS policies
3. **"Session Not Found"**: Clear AsyncStorage and re-login
4. **Admin Routes Not Working**: Check user role in database

### Debug Commands
```bash
# Check AsyncStorage contents
npx react-native log-android | grep AsyncStorage

# Verify Supabase connection
curl -H "apikey: YOUR_ANON_KEY" YOUR_SUPABASE_URL/rest/v1/users

# Test password hashing
node -e "console.log(require('crypto-js/sha256')('test123').toString())"
```

---
*This quickstart guide serves as both user acceptance criteria and integration test scenarios*