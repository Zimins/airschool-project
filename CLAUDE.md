# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AirSchool React Native for Web prototype application that connects aspiring pilots with flight schools. The app is built using Expo and React Native Web, focusing on UI/UX with mock data. **UPDATED**: Full authentication system implemented using Supabase Auth for secure email/password login with role-based access control (admin/user).

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
5. **Authentication**: Supabase Auth system with email/password authentication, role-based access control, and automatic session management

### Important Files

- `src/data/mockData.ts`: Contains all mock flight schools and reviews data
- `src/styles/theme.ts`: Central theme configuration with colors, spacing, etc.
- `src/navigation/AppNavigator.tsx`: Main navigation configuration
- `App.tsx`: Root component with navigation setup
- `src/services/AuthService.ts`: Authentication service with Supabase Auth integration
- `src/context/AuthContext.tsx`: React context for authentication state management
- `src/components/ProtectedRoute.tsx`: Route protection component for secured screens
- `src/types/auth.ts`: TypeScript definitions for authentication system
- `src/utils/session.ts`: Session management utilities
- `supabase/migrations/`: Database schema files (legacy, now using Supabase Auth)

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
6. Authentication is handled by Supabase Auth (no custom database tables needed)
7. Security: Use Supabase's built-in security features, validate inputs, use RLS policies

## Admin Access

Admin is a server-side fact: a user is an admin only if their auth user id has a row in `public.admin_users`. RLS policies (migration 026) and the app's UI gate both go through `public.is_admin()`, which the app calls via `supabase.rpc('is_admin')` on login and session restore. `user_metadata.role` is ignored (it is client-writable) and the former "Switch to Admin Role (DEV)" toggle was removed.

**Grant admin** (Supabase SQL editor or Management API):

```sql
INSERT INTO public.admin_users (id, email, role, created_at)
SELECT id, email, 'admin', now() FROM auth.users WHERE email = 'person@example.com'
ON CONFLICT (id) DO NOTHING;
```

**Revoke admin**: `DELETE FROM public.admin_users WHERE email = 'person@example.com';`

**Write access summary**: `study_materials` and `flight_schools` are admin-only; `community_posts` / `community_comments` can be created by any signed-in user (own `author_id`) and edited or deleted by the owner or an admin; `profiles` rows are editable only by their owner. Everything is publicly readable.

**Test accounts**: there are no seeded credentials. For QA, sign up a throwaway account in the app; to test admin flows, add that account to `admin_users` with the SQL above and remove it afterwards.

## Legal Documents (Terms of Service / Privacy Policy / Community Guidelines)

The three documents live in `public.legal_documents` (migration 029, fixed slugs `terms`, `privacy`, `community-guidelines`) and are edited by admins in **Admin → Legal Documents** (`src/screens/admin/LegalDocumentsManagementScreen.tsx`). Public pages: `/terms`, `/privacy`, `/community-guidelines` (`src/screens/LegalDocumentScreen.tsx`, fetched on every visit); data access and validation: `src/services/LegalDocumentService.ts`. Sign Up's consent links open these pages.

- Everyone can read; only `is_admin()` can UPDATE; there is no INSERT/DELETE policy, so adding a document means a new migration (extend the slug check, seed the row) plus `LEGAL_DOCUMENT_SLUGS` / `LEGAL_DOCUMENT_ROUTES` / `LEGAL_DOCUMENT_PATHS`.
- Every edit archives the previous text in `public.legal_document_versions` (admin-readable), so the version in force on any date can be recovered.
- The text in migration 029 is only the initial seed (`ON CONFLICT DO NOTHING`); after an admin edit the database is the source of truth. 029 is idempotent and also safe on a project where the earlier terms/privacy-only draft of it was applied.
- Content is Markdown rendered by react-native-markdown-display (HTML is shown as text, unsafe link schemes are rejected). If a `public.sanitize_content` function exists in the project, the trigger also applies it and the editor tells the admin when the saved text was adjusted.
- Keep the public URLs stable — they may be published elsewhere (store listings, emails). `tests/contracts/linking.test.ts` and `tests/contracts/legal-documents.test.ts` guard the paths, slugs, RLS shape and limits.
