import type { PathConfigMap } from '@react-navigation/native';
import type { RootStackParamList } from './AppNavigator';
import type { LegalDocumentSlug } from '../services/LegalDocumentService';

/**
 * URL path for every screen in the root stack.
 *
 * Kept as a standalone, dependency-free map so it can be unit-tested: a screen
 * missing from this map still navigates fine in-app, but reloading or sharing
 * its URL silently falls back to Home (that is how the Community/Study Board
 * deep links broke). `tests/contracts/linking.test.ts` guards against that.
 */
export const linkingScreens: PathConfigMap<RootStackParamList> = {
  Home: '',
  Login: 'login',
  Signup: 'signup',
  ForgotPassword: 'ForgotPassword',
  Admin: 'admin',
  CommunityBoard: 'CommunityBoard',
  StudyBoard: 'StudyBoard',
  Terms: 'terms',
  Privacy: 'privacy',
  CommunityGuidelines: 'community-guidelines',
  FlightSchoolDetail: {
    path: 'school/:schoolId',
    parse: {
      schoolId: (schoolId: string) => schoolId,
    },
  },
};

/** Root-stack screen that shows each legal document (all use LegalDocumentScreen). */
export const LEGAL_DOCUMENT_ROUTES = {
  terms: 'Terms',
  privacy: 'Privacy',
  'community-guidelines': 'CommunityGuidelines',
} as const satisfies Record<LegalDocumentSlug, keyof RootStackParamList>;

export type LegalDocumentRoute = (typeof LEGAL_DOCUMENT_ROUTES)[LegalDocumentSlug];

/**
 * Public URL of each legal document, for links that open outside the
 * navigator (a new browser tab from Sign Up, the admin "View Page" button).
 * These URLs may also be published elsewhere (store listings, emails), so the
 * paths above must not change.
 */
export const LEGAL_DOCUMENT_PATHS: Record<LegalDocumentSlug, string> = {
  terms: '/terms',
  privacy: '/privacy',
  'community-guidelines': '/community-guidelines',
};
