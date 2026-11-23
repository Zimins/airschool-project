import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LEGAL_DOCUMENT_ROUTES, LegalDocumentRoute } from '../navigation/linking';
import { theme } from '../styles/theme';
import { markdownStyles } from '../styles/markdown';
import {
  LEGAL_DOCUMENT_LABELS,
  LEGAL_DOCUMENT_SLUGS,
  LegalDocument,
  LegalDocumentService,
  LegalDocumentSlug,
  formatLegalDate,
} from '../services/LegalDocumentService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, LegalDocumentRoute>;

const slugForRoute = (routeName: string): LegalDocumentSlug =>
  LEGAL_DOCUMENT_SLUGS.find((slug) => LEGAL_DOCUMENT_ROUTES[slug] === routeName) ?? 'terms';

const legalDocumentService = new LegalDocumentService();

/**
 * Public page behind /terms, /privacy and /community-guidelines. The text
 * lives in the database and is edited from Admin → Legal Documents, so it is
 * fetched on every visit.
 */
const LegalDocumentScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const slug = slugForRoute(route.name);

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      setFailed(false);
      setDocument(await legalDocumentService.getDocument(slug));
    } catch (error) {
      console.error('Error loading legal document:', error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const title = document?.title ?? LEGAL_DOCUMENT_LABELS[slug];

  // Also sets the browser tab title on web.
  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const handleBack = () => {
    // Opened in a new tab (e.g. from Sign Up) there is no history to go back to.
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const renderBody = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.statusIndicator} />;
    }

    if (failed || !document) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.textSecondary} />
          <Text style={styles.errorText}>We couldn't load this page. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDocument}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.documentTitle}>{document.title}</Text>
        <Text style={styles.meta}>
          Effective {formatLegalDate(document.effective_date)}
          {'  ·  '}
          Last updated{' '}
          {new Date(document.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Markdown style={markdownStyles}>{document.content}</Markdown>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>{renderBody()}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  page: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.sm,
  },
  documentTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  meta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  statusIndicator: {
    marginVertical: theme.spacing.xxl,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  errorText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});

export default LegalDocumentScreen;
