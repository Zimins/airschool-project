# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AirSchool React Native for Web prototype application that connects aspiring pilots with flight schools. The app is built using Expo and React Native Web, focusing on UI/UX with mock data. **NEW**: Basic authentication system implemented using Supabase backend (without Supabase Auth) for simple email/password login with admin support.

## Common Development Commands

### Running the Application
- `npm start` - Start Expo development server
- `npm run web` - Start the web development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator

### Testing and Validation
- Jest + React Native Testing Library (NEW: for authentication testing)
- No linting configuration exists yet
- TypeScript is configured with strict mode
- Test authentication with: `npm test -- --testPathPattern=auth`

### Building and Deployment

#### EAS (Expo Application Services) Deployment
The project is configured for EAS with project ID: `f565a3ab-2f02-4143-ae06-9410a6d0bf57`

**Prerequisites:**
- Install EAS CLI: `npm install -g eas-cli`
- Login to Expo account: `eas login`

**Native App Builds:**
- `eas build --platform ios` - Build for iOS (requires Apple Developer account)
- `eas build --platform android` - Build for Android
- `eas build --platform all` - Build for both iOS and Android

**Update Deployment (for native apps):**
- `eas update` - Deploy updates to existing builds
- `eas update --branch preview` - Deploy to preview branch
- `eas update --branch production` - Deploy to production branch

#### EAS Hosting (Web Deployment)

**Web Deployment Steps:**
1. Ensure `expo.web.output` is configured in `app.json` (set to "static" for this project)
2. Export the web build:
   ```bash
   npx expo export --platform web
   ```
3. Deploy to EAS Hosting:
   ```bash
   eas deploy
   ```

**First Deployment:**
- You'll be prompted to connect your project
- Choose a preview subdomain
- Preview URL format: `https://[subdomain]--[unique-id].expo.app/`
- Production URL format: `https://[subdomain].expo.app/`

**Local Build Testing:**
- `npm run build:web` - Generate static web files in `web-build/` directory
- `npx serve web-build` - Test production build locally

## Architecture and Structure

### Directory Structure
```
src/
├── components/       # Reusable UI components
├── screens/         # Screen components (pages)
├── navigation/      # React Navigation configuration
├── data/           # Mock data and types
├── styles/         # Theme and global styles
└── utils/          # Utility functions (if needed)
```

### Key Technical Decisions

1. **Navigation**: Using React Navigation with Native Stack Navigator
2. **Styling**: Using React Native StyleSheet API with a centralized theme
3. **State Management**: React Context for auth state, local component state for UI
4. **Data**: Mock data in `mockData.ts` + Supabase for user authentication data
5. **Authentication**: Simple email/password system with Supabase backend, SHA-256 password hashing, AsyncStorage for sessions

### Important Files

- `src/data/mockData.ts`: Contains all mock flight schools and reviews data
- `src/styles/theme.ts`: Central theme configuration with colors, spacing, etc.
- `src/navigation/AppNavigator.tsx`: Main navigation configuration
- `App.tsx`: Root component with navigation setup
- `src/services/auth.ts`: Authentication service with Supabase integration (NEW)
- `src/context/AuthContext.tsx`: React context for authentication state (NEW)
- `src/components/ProtectedRoute.tsx`: Route protection component (NEW)
- `supabase/migrations/`: Database schema for user authentication (NEW)

### Component Architecture

- **Screens**: Each screen is a separate component in `src/screens/`
- **Components**: Reusable components like `FlightSchoolCard`, `ReviewCard`, `ReviewModal`
- **Navigation**: Type-safe navigation using TypeScript generics

### Mock Data Structure

The app uses the following main data types:
- `FlightSchool`: Contains school information, programs, contact details
- `Review`: User reviews with ratings and content
- `Program`: Flight training programs offered by schools

All data is static and resets on app refresh.

## Development Tips

1. When adding new screens, update `RootStackParamList` in `AppNavigator.tsx`
2. Follow the existing theme system for consistent styling
3. Use the mock data structure when adding new features
4. For authentication: Use AuthContext for auth state, ProtectedRoute for secured screens
5. Test authentication flows: login, logout, admin access, session persistence
6. Database migrations: Use Supabase migrations for schema changes
7. Security: Never expose password hashes, validate inputs, use RLS policies