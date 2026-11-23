/**
 * Contract test for the web URL map.
 *
 * Every screen in the root stack must have a path here. A screen that is
 * missing still works when navigated to in-app, but reloading its URL (or
 * pasting it into a new tab) silently lands on Home — which is exactly how the
 * Community Board / Study Board links broke.
 */
import { LEGAL_DOCUMENT_PATHS, LEGAL_DOCUMENT_ROUTES, linkingScreens } from '../../src/navigation/linking';

const ROOT_STACK_ROUTES = [
  'Home',
  'FlightSchoolDetail',
  'Login',
  'Signup',
  'ForgotPassword',
  'Admin',
  'CommunityBoard',
  'StudyBoard',
  'Terms',
  'Privacy',
  'CommunityGuidelines',
] as const;

describe('web linking config', () => {
  it.each(ROOT_STACK_ROUTES)('defines a URL path for the %s screen', (route) => {
    expect(linkingScreens).toHaveProperty(route);
  });

  it('uses the same paths the app generates when navigating to the boards', () => {
    expect(linkingScreens.CommunityBoard).toBe('CommunityBoard');
    expect(linkingScreens.StudyBoard).toBe('StudyBoard');
    expect(linkingScreens.ForgotPassword).toBe('ForgotPassword');
  });

  it('serves the legal documents at /terms, /privacy and /community-guidelines', () => {
    expect(LEGAL_DOCUMENT_PATHS).toEqual({
      terms: '/terms',
      privacy: '/privacy',
      'community-guidelines': '/community-guidelines',
    });
    for (const slug of Object.keys(LEGAL_DOCUMENT_PATHS) as (keyof typeof LEGAL_DOCUMENT_PATHS)[]) {
      const route = LEGAL_DOCUMENT_ROUTES[slug];
      expect(`/${linkingScreens[route]}`).toBe(LEGAL_DOCUMENT_PATHS[slug]);
    }
  });

  it('parses the school id out of /school/:schoolId', () => {
    const detail = linkingScreens.FlightSchoolDetail as {
      path: string;
      parse: { schoolId: (value: string) => string };
    };
    expect(detail.path).toBe('school/:schoolId');
    expect(detail.parse.schoolId('33333333-3333-3333-3333-333333333333')).toBe(
      '33333333-3333-3333-3333-333333333333',
    );
  });
});
