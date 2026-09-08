import type { PathConfigMap } from '@react-navigation/native';
import type { RootStackParamList } from './AppNavigator';

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
  FlightSchoolDetail: {
    path: 'school/:schoolId',
    parse: {
      schoolId: (schoolId: string) => schoolId,
    },
  },
};
