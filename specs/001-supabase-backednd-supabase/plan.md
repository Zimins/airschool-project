# Implementation Plan: Simple Authentication System with Admin Support

**Branch**: `001-supabase-backednd-supabase` | **Date**: 2025-09-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-supabase-backednd-supabase/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Implement a minimal authentication system for the AirSchool React Native Web app using Supabase as database backend (but not Supabase Auth). System must support email/password login for regular users and admin accounts with elevated privileges. Focus on simplicity over security for this prototype, using basic password hashing and session management.

## Technical Context
**Language/Version**: TypeScript 5.x with React Native Web + Expo SDK 49+  
**Primary Dependencies**: Expo, React Navigation, Supabase JavaScript client, crypto-js for password hashing  
**Storage**: Supabase PostgreSQL database with direct SQL queries (not using Supabase Auth)  
**Testing**: NEEDS CLARIFICATION - no current test framework, will implement Jest + React Native Testing Library  
**Target Platform**: Web browsers (React Native Web), iOS/Android via Expo (future)
**Project Type**: single - React Native Web app with embedded authentication  
**Performance Goals**: <3s login response time, smooth UI transitions at 60fps  
**Constraints**: Minimal security for prototype, no complex session management, basic password requirements  
**Scale/Scope**: 10-50 test users, 5-10 admin users, simple role-based access

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (single React Native Web app with authentication module)
- Using framework directly? YES (direct Supabase client, React Navigation, Expo)
- Single data model? YES (User entity with minimal fields)
- Avoiding patterns? YES (no Repository/UoW, direct database queries)

**Architecture**:
- EVERY feature as library? VIOLATION - authentication integrated into app for simplicity
- Libraries listed: auth-service (authentication logic), user-model (data validation)
- CLI per library: N/A (React Native Web app, no CLI needed)
- Library docs: Will create basic README for auth module

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? YES (will write failing tests first)
- Git commits show tests before implementation? YES (commit strategy planned)
- Order: Contract→Integration→E2E→Unit strictly followed? YES
- Real dependencies used? YES (actual Supabase database for tests)
- Integration tests for: auth flows, user creation, session management
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? BASIC (console.log for prototype, structured later)
- Frontend logs → backend? NO (client-side only for now)
- Error context sufficient? YES (error boundaries, user-friendly messages)

**Versioning**:
- Version number assigned? 0.1.0 (following semver for feature)
- BUILD increments on every change? YES
- Breaking changes handled? YES (migration scripts for database schema)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) - Authentication module integrated within existing src/ structure

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Database setup: Create users table, RLS policies, seed admin account
- Models: User validation, password hashing utilities [P]
- Services: AuthService implementation with Supabase queries [P] 
- Context: AuthContext for React state management
- Components: LoginScreen, ProtectedRoute, logout functionality
- Navigation: Route guards and redirect logic
- Tests: Contract tests, integration tests, E2E scenarios from quickstart.md

**Ordering Strategy**:
- TDD order: Tests before implementation (RED-GREEN-Refactor)
- Dependency order: Database → Models → Services → Context → Components → Navigation
- Mark [P] for parallel execution where dependencies allow
- Each major component gets: Contract test → Implementation → Integration test

**Estimated Task Breakdown**:
1. Database migration and admin seed (1 task)
2. Contract tests for AuthService (3 tasks - login, register, admin ops)
3. User model and validation (2 tasks) [P]
4. Password hashing utility (1 task) [P]
5. AuthService implementation (4 tasks - core methods)
6. AuthContext implementation (2 tasks)
7. LoginScreen UI and logic (3 tasks)
8. ProtectedRoute component (2 tasks)
9. Navigation guards and routing (3 tasks)
10. Integration tests from quickstart scenarios (7 tasks)
11. E2E test setup and key flows (3 tasks)

**Total Estimated Output**: ~30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Feature as library | Prototype requires rapid iteration | Separate library would add overhead for simple auth module in MVP |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach described (/plan command)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (with justified violations)
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*