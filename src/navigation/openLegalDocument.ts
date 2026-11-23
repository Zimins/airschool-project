import { Platform } from 'react-native';
import type { LegalDocumentSlug } from '../services/LegalDocumentService';
import { LEGAL_DOCUMENT_PATHS, LEGAL_DOCUMENT_ROUTES, LegalDocumentRoute } from './linking';

interface Navigator {
  navigate: (screen: LegalDocumentRoute) => void;
}

/**
 * Show a legal document page. Web opens it in a new tab so whatever the user
 * was doing (a half-filled sign-up form, an unsaved admin draft) survives;
 * native pushes the in-app page on top of the current screen.
 */
export const openLegalDocument = (navigation: Navigator, slug: LegalDocumentSlug) => {
  if (Platform.OS === 'web') {
    window.open(LEGAL_DOCUMENT_PATHS[slug], '_blank', 'noopener,noreferrer');
  } else {
    navigation.navigate(LEGAL_DOCUMENT_ROUTES[slug]);
  }
};
