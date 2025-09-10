# Tasks: Simple Authentication System with Admin Support

**Input**: Design documents from `/specs/001-supabase-backednd-supabase/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Extracted: TypeScript 5.x, React Native Web, Expo SDK 49+, Supabase, crypto-js
2. Load optional design documents: ✓
   → data-model.md: User entity with validation rules
   → contracts/: auth-service.ts, types.ts, navigation.ts
   → research.md: Password hashing, session management, testing framework
   → quickstart.md: 7 integration test scenarios
3. Generate tasks by category: ✓
   → Setup: dependencies, database, testing framework
   → Tests: contract tests, integration tests from quickstart scenarios
   → Core: models, services, context, components
   → Integration: route protection, session management
   → Polish: error handling, performance optimization
4. Apply task rules: ✓
   → Different files = marked [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD enforced)
5. Number tasks sequentially (T001-T032)
6. Validate task completeness: ✓
   → All 3 contracts have tests ✓
   → User entity has model ✓
   → All 7 quickstart scenarios covered ✓
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Single project structure** (from plan.md):
- Source: `src/` at repository root
- Tests: `tests/` at repository root
- Database: `supabase/` at repository root

---

## Phase 3.1: Setup & Dependencies

- [ ] **T001** Install authentication dependencies: `npm install @supabase/supabase-js crypto-js @react-native-async-storage/async-storage`
- [ ] **T002** Install testing dependencies: `npm install --save-dev jest @testing-library/react-native @testing-library/jest-dom @testing-library/user-event`
- [ ] **T003** [P] Configure Jest for React Native Web in `package.json` and create `jest.config.js`
- [ ] **T004** Create Supabase project directory structure: `supabase/migrations/` and `supabase/seed.sql`
- [ ] **T005** Create environment variables template `.env.example` with Supabase configuration keys

## Phase 3.2: Database Setup

- [ ] **T006** Create users table migration script in `supabase/migrations/001_create_users_table.sql` from data-model.md schema
- [ ] **T007** Create RLS policies migration in `supabase/migrations/002_setup_rls_policies.sql` for user data protection
- [ ] **T008** Create admin account seed script in `supabase/seed.sql` with default admin credentials
- [ ] **T009** Test database connection and apply migrations using Supabase CLI

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

### Contract Tests
- [ ] **T010** [P] Create failing contract test for AuthService.login() in `tests/contracts/auth-service.test.ts`
- [ ] **T011** [P] Create failing contract test for AuthService.register() in `tests/contracts/auth-service.test.ts`
- [ ] **T012** [P] Create failing contract test for AuthService admin operations in `tests/contracts/auth-service.test.ts`
- [ ] **T013** [P] Create failing contract test for NavigationService route protection in `tests/contracts/navigation.test.ts`

### Integration Tests (from quickstart.md scenarios)
- [ ] **T014** [P] Create failing integration test for Admin Login Flow in `tests/integration/admin-login.test.ts`
- [ ] **T015** [P] Create failing integration test for Regular User Registration in `tests/integration/user-registration.test.ts`
- [ ] **T016** [P] Create failing integration test for Invalid Login Handling in `tests/integration/invalid-login.test.ts`
- [ ] **T017** [P] Create failing integration test for Protected Route Access in `tests/integration/route-protection.test.ts`
- [ ] **T018** [P] Create failing integration test for Session Persistence in `tests/integration/session-persistence.test.ts`
- [ ] **T019** [P] Create failing integration test for Logout Flow in `tests/integration/logout-flow.test.ts`
- [ ] **T020** [P] Create failing integration test for Admin User Management in `tests/integration/admin-user-management.test.ts`

## Phase 3.4: Core Implementation

### Data Models & Utilities
- [ ] **T021** [P] Implement User model validation in `src/models/User.ts` with TypeScript interfaces from contracts/types.ts
- [ ] **T022** [P] Implement password hashing utility in `src/utils/crypto.ts` using crypto-js SHA-256 + salt
- [ ] **T023** [P] Implement session management utility in `src/utils/session.ts` for AsyncStorage operations

### Authentication Service
- [ ] **T024** Implement AuthService.login() method in `src/services/AuthService.ts` to pass contract test T010
- [ ] **T025** Implement AuthService.register() method in `src/services/AuthService.ts` to pass contract test T011  
- [ ] **T026** Implement AuthService admin operations in `src/services/AuthService.ts` to pass contract test T012
- [ ] **T027** Add error handling and validation to AuthService methods

### React Context & State Management
- [ ] **T028** Implement AuthContext provider in `src/context/AuthContext.tsx` with state and actions from contracts/types.ts
- [ ] **T029** Create AuthContext hooks (useAuth, useAuthActions) for component consumption

## Phase 3.5: UI Components & Navigation

### Authentication Components
- [ ] **T030** [P] Implement LoginScreen component in `src/screens/LoginScreen.tsx` with form validation
- [ ] **T031** [P] Implement SignupScreen component in `src/screens/SignupScreen.tsx` with user registration
- [ ] **T032** [P] Update existing HomeScreen in `src/screens/HomeScreen.tsx` to show admin UI elements conditionally

### Route Protection
- [ ] **T033** Implement ProtectedRoute component in `src/components/ProtectedRoute.tsx` to pass contract test T013
- [ ] **T034** Update AppNavigator in `src/navigation/AppNavigator.tsx` to use ProtectedRoute for secured screens
- [ ] **T035** Implement navigation guards and redirect logic for unauthorized access

## Phase 3.6: Integration & Error Handling

- [ ] **T036** Integrate AuthContext with App.tsx root component for global authentication state
- [ ] **T037** [P] Implement error boundaries in `src/components/ErrorBoundary.tsx` for authentication failures
- [ ] **T038** [P] Add loading states and user feedback for authentication operations
- [ ] **T039** Verify all integration tests pass with implemented authentication system

## Phase 3.7: Polish & Performance

- [ ] **T040** [P] Add unit tests for password hashing utility in `tests/unit/crypto.test.ts`
- [ ] **T041** [P] Add unit tests for session management in `tests/unit/session.test.ts`
- [ ] **T042** [P] Add unit tests for User model validation in `tests/unit/User.test.ts`
- [ ] **T043** Performance test: Ensure login completes within 3s requirement from plan.md
- [ ] **T044** [P] Create authentication module documentation in `src/auth/README.md`
- [ ] **T045** [P] Update main CLAUDE.md with authentication system usage examples

---

## Dependency Graph

```
T001-T005 (Setup) → T006-T009 (Database) → T010-T020 (Tests) → T021-T029 (Core) → T030-T035 (UI) → T036-T039 (Integration) → T040-T045 (Polish)
```

## Parallel Execution Examples

### Phase 3.3 - Contract Tests (can run simultaneously)
```bash
# All contract tests can be created in parallel
Task T010 & Task T011 & Task T012 & Task T013
```

### Phase 3.3 - Integration Tests (can run simultaneously)
```bash
# All integration tests can be created in parallel
Task T014 & Task T015 & Task T016 & Task T017 & Task T018 & Task T019 & Task T020
```

### Phase 3.4 - Models & Utilities (can run simultaneously)
```bash
# Different files, no dependencies
Task T021 & Task T022 & Task T023
```

### Phase 3.5 - UI Components (can run simultaneously)
```bash
# Different screen files can be implemented in parallel
Task T030 & Task T031 & Task T032
```

### Phase 3.7 - Unit Tests (can run simultaneously)
```bash
# Different utility test files
Task T040 & Task T041 & Task T042
```

### Phase 3.7 - Documentation (can run simultaneously)
```bash
# Different documentation files
Task T044 & Task T045
```

## Validation Checklist

**TDD Compliance**:
- [x] All contracts have failing tests before implementation
- [x] All quickstart scenarios have integration tests
- [x] Tests created before implementation tasks
- [x] Real Supabase database used in tests (not mocks)

**Task Completeness**:
- [x] All 3 contract files covered (auth-service, types, navigation)
- [x] User entity from data-model.md has implementation tasks
- [x] All 7 quickstart scenarios have test tasks
- [x] Authentication service methods fully covered
- [x] UI components and navigation protection included
- [x] Error handling and performance considerations included

**Parallel Optimization**:
- [x] 19 tasks marked [P] for parallel execution
- [x] Different files can be worked on simultaneously
- [x] Sequential dependencies clearly marked
- [x] Setup → Tests → Implementation → Integration → Polish flow maintained

---

**Total Tasks**: 45 tasks
**Estimated Parallel Batches**: 8 batches (significant time savings)
**Critical Path**: Setup (5) → Database (4) → Core Auth Service (4) → Integration (4) = 17 sequential tasks

*Ready for execution using TDD methodology with constitutional compliance*