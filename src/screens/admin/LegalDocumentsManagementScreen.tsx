import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { theme } from '../../styles/theme';
import { markdownStyles } from '../../styles/markdown';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { LEGAL_DOCUMENT_PATHS } from '../../navigation/linking';
import { openLegalDocument } from '../../navigation/openLegalDocument';
import {
  LEGAL_DOCUMENT_LABELS,
  LEGAL_DOCUMENT_LIMITS,
  LEGAL_DOCUMENT_SLUGS,
  LegalDocument,
  LegalDocumentChanges,
  LegalDocumentService,
  LegalDocumentSlug,
  formatLegalDate,
  isValidLegalDate,
  validateLegalDocumentChanges,
} from '../../services/LegalDocumentService';

interface LegalDocumentsManagementScreenProps {
  onBack: () => void;
}

const toChanges = (doc: LegalDocument): LegalDocumentChanges => ({
  title: doc.title,
  content: doc.content,
  effective_date: doc.effective_date,
});

// Alert.alert buttons do nothing on react-native-web, so the web build uses
// the browser dialogs (same approach as utils/confirmDelete).
const notify = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(title, message);
  }
};

const confirmDiscard = (message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert('Unsaved Changes', message, [
    { text: 'Keep Editing', style: 'cancel' },
    { text: 'Discard', style: 'destructive', onPress: onConfirm },
  ]);
};

/**
 * Admin → Legal Documents: edit the Terms of Service, Privacy Policy and
 * Community Guidelines. Saving publishes immediately; the public pages read
 * the same rows. Write access is enforced by RLS (is_admin()), not by this
 * screen.
 */
const LegalDocumentsManagementScreen: React.FC<LegalDocumentsManagementScreenProps> = ({ onBack }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [service] = useState(() => new LegalDocumentService());
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  // One draft per document so switching tabs never loses edits.
  const [drafts, setDrafts] = useState<Partial<Record<LegalDocumentSlug, LegalDocumentChanges>>>({});
  const [selectedSlug, setSelectedSlug] = useState<LegalDocumentSlug>('terms');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setLoadFailed(false);
      const fetched = await service.getAllDocuments();
      setDocuments(fetched);
      setDrafts(Object.fromEntries(fetched.map((doc) => [doc.slug, toChanges(doc)])));
    } catch (error) {
      console.error('Error loading legal documents:', error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const savedDocument = documents.find((doc) => doc.slug === selectedSlug);
  const draft = drafts[selectedSlug];

  const isDirty = (slug: LegalDocumentSlug): boolean => {
    const saved = documents.find((doc) => doc.slug === slug);
    const edited = drafts[slug];
    if (!saved || !edited) return false;
    return (
      edited.title !== saved.title ||
      edited.content !== saved.content ||
      edited.effective_date !== saved.effective_date
    );
  };

  const updateDraft = (changes: Partial<LegalDocumentChanges>) => {
    if (!draft) return;
    setDrafts((prev) => ({ ...prev, [selectedSlug]: { ...draft, ...changes } }));
  };

  const handleSave = async () => {
    if (!draft) return;

    const result = validateLegalDocumentChanges(draft);
    if (!result.ok) {
      notify('Error', result.error);
      return;
    }

    const slug = selectedSlug;
    try {
      setSaving(true);
      const saved = await service.updateDocument(slug, result.changes);
      setDocuments((prev) => prev.map((doc) => (doc.slug === saved.slug ? saved : doc)));
      setDrafts((prev) => ({ ...prev, [saved.slug]: toChanges(saved) }));

      // The database may clean the text further (e.g. strip HTML) — say so,
      // so a legal text never changes without the admin noticing.
      const adjusted = saved.title !== result.changes.title || saved.content !== result.changes.content;
      notify(
        'Saved',
        adjusted
          ? `${saved.title} has been published. Part of the text was adjusted when saving (for example, HTML ` +
              'or unsafe links are removed). Please review the published text.'
          : `${saved.title} has been published.`,
      );
    } catch (error: any) {
      console.error('Error saving legal document:', error);
      notify('Error', error?.message || 'Failed to save the document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!savedDocument) return;
    confirmDiscard('Discard your unsaved changes to this document?', () =>
      setDrafts((prev) => ({ ...prev, [selectedSlug]: toChanges(savedDocument) })),
    );
  };

  const handleBack = () => {
    if (LEGAL_DOCUMENT_SLUGS.some((slug) => isDirty(slug))) {
      confirmDiscard('You have unsaved changes. Leave without saving?', onBack);
    } else {
      onBack();
    }
  };

  const renderEditor = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (loadFailed) {
      return (
        <View style={styles.centered}>
          <Text style={styles.helperText}>Failed to load legal documents.</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={loadDocuments}>
            <Text style={styles.secondaryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!savedDocument || !draft) {
      // The row is created by migration 029; it is missing only if that
      // migration has not been applied to this project yet.
      return (
        <View style={styles.centered}>
          <Text style={styles.helperText}>
            {LEGAL_DOCUMENT_LABELS[selectedSlug]} has not been set up in the database yet.
          </Text>
          <Text style={styles.helperText}>Apply supabase/migrations/029_legal_documents.sql, then retry.</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={loadDocuments}>
            <Text style={styles.secondaryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const dirty = isDirty(selectedSlug);

    return (
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={22} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Saving publishes the text immediately at {LEGAL_DOCUMENT_PATHS[selectedSlug]}. The previous version is
            archived automatically. For changes that affect users' rights, set the effective date at least 7 days ahead
            (30 days if unfavorable to users) and let users know.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={draft.title}
              onChangeText={(title) => updateDraft({ title })}
              placeholder="Document title"
              maxLength={LEGAL_DOCUMENT_LIMITS.title}
              accessibilityLabel="Document title"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Effective date *</Text>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={draft.effective_date}
              onChangeText={(effective_date) => updateDraft({ effective_date })}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
              accessibilityLabel="Effective date"
            />
            <Text style={styles.helperText}>
              Shown to users as "Effective{' '}
              {isValidLegalDate(draft.effective_date.trim()) ? formatLegalDate(draft.effective_date.trim()) : '…'}".
            </Text>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.contentHeader}>
              <Text style={styles.label}>Content *</Text>
              <View style={styles.modeToggle}>
                {(['Edit', 'Preview'] as const).map((mode) => {
                  const active = (mode === 'Preview') === preview;
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.modeButton, active && styles.modeButtonActive]}
                      onPress={() => setPreview(mode === 'Preview')}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{mode}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {preview ? (
              <View style={styles.previewBox}>
                <Markdown style={markdownStyles}>{draft.content}</Markdown>
              </View>
            ) : (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.content}
                onChangeText={(content) => updateDraft({ content })}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Document content"
              />
            )}
            <Text style={styles.helperText}>
              Markdown: ## Heading, **bold**, - list item, [link](https://…). HTML is not rendered.{'  '}
              {draft.content.length.toLocaleString('en-US')} / {LEGAL_DOCUMENT_LIMITS.content.toLocaleString('en-US')}{' '}
              characters
            </Text>
          </View>

          <Text style={styles.updateInfo}>
            Last published {new Date(savedDocument.updated_at).toLocaleString()}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => openLegalDocument(navigation, selectedSlug)}
            >
              <Ionicons name="open-outline" size={18} color={theme.colors.text} />
              <Text style={styles.secondaryButtonText}>View Page</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, (!dirty || saving) && styles.buttonDisabled]}
              onPress={handleDiscard}
              disabled={!dirty || saving}
            >
              <Text style={styles.secondaryButtonText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, (!dirty || saving) && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!dirty || saving}
              testID="legal-save-button"
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="white" />
                  <Text style={styles.saveButtonText}>Save & Publish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} accessibilityLabel="Back to dashboard">
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Legal Documents</Text>
      </View>

      <ScrollView horizontal style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
        {LEGAL_DOCUMENT_SLUGS.map((slug) => {
          const active = slug === selectedSlug;
          return (
            <TouchableOpacity
              key={slug}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setSelectedSlug(slug)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{LEGAL_DOCUMENT_LABELS[slug]}</Text>
              {isDirty(slug) && <View style={styles.dirtyDot} accessibilityLabel="Unsaved changes" />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {renderEditor()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tabsScroll: {
    flexGrow: 0,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  dirtyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.warning,
    marginLeft: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '10',
    padding: 16,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: theme.borderRadius.md,
    ...theme.shadow.sm,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  dateInput: {
    maxWidth: 200,
  },
  textArea: {
    minHeight: 480,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  modeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  modeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  modeButtonTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  previewBox: {
    minHeight: 480,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    backgroundColor: theme.colors.white,
  },
  updateInfo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: 'white',
    fontSize: theme.fontSize.base,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default LegalDocumentsManagementScreen;
