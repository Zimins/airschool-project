import React from 'react';
import { Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface RequestInfoModalProps {
  visible: boolean;
  onClose: () => void;
  schoolName: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  /** Used to pre-fill the email so the school knows who is asking. */
  requester?: {
    name?: string;
    email?: string;
  };
}

const clean = (value?: string) => (value ?? '').trim();

const normalizeWebsite = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

/**
 * Builds the mailto: link for an information request. Exported so the
 * pre-filled subject/body can be unit-tested without rendering.
 */
export const buildInfoRequestMailto = (
  schoolEmail: string,
  schoolName: string,
  requester?: { name?: string; email?: string },
): string => {
  const subject = `Information request about ${schoolName} programs`;
  const signature = [requester?.name, requester?.email].filter(Boolean).join(' · ');
  const body = [
    `Hello ${schoolName} team,`,
    '',
    'I found your school on Preflightnet and would like more information about your training programs, pricing, and enrollment.',
    '',
    'Thank you,',
    signature || '',
  ].join('\n');
  return `mailto:${schoolEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const openLink = async (url: string) => {
  try {
    if (Platform.OS === 'web') {
      // Linking.openURL on web opens a new tab, which is what we want for
      // websites; for mailto/tel the browser hands off to the default app.
      window.open(url, url.startsWith('http') ? '_blank' : '_self');
      return;
    }
    await Linking.openURL(url);
  } catch (error) {
    console.error('Failed to open link:', url, error);
  }
};

/**
 * "Request more information" sheet. There is no inquiry backend yet, so the
 * honest thing to do is hand the user the school's real contact channels with
 * a pre-filled email instead of bouncing them to Sign Up.
 */
const RequestInfoModal: React.FC<RequestInfoModalProps> = ({ visible, onClose, schoolName, contact, requester }) => {
  const phone = clean(contact.phone);
  const email = clean(contact.email);
  const website = clean(contact.website);
  const hasAnyContact = Boolean(phone || email || website);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container} accessibilityViewIsModal>
          <View style={styles.header}>
            <Text style={styles.title}>Request more information</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {hasAnyContact
              ? `Contact ${schoolName} directly using one of the options below.`
              : `${schoolName} hasn't shared contact details yet. Please check back later.`}
          </Text>

          {email ? (
            <TouchableOpacity
              style={[styles.option, styles.optionPrimary]}
              onPress={() => openLink(buildInfoRequestMailto(email, schoolName, requester))}
              accessibilityRole="button"
              accessibilityLabel={`Email ${schoolName} at ${email}`}
            >
              <Ionicons name="mail-outline" size={22} color="white" />
              <View style={styles.optionText}>
                <Text style={styles.optionTitlePrimary}>Send an email</Text>
                <Text style={styles.optionValuePrimary}>{email}</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {phone ? (
            <TouchableOpacity
              style={styles.option}
              onPress={() => openLink(`tel:${phone.replace(/[^\d+]/g, '')}`)}
              accessibilityRole="button"
              accessibilityLabel={`Call ${schoolName} at ${phone}`}
            >
              <Ionicons name="call-outline" size={22} color={theme.colors.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Call</Text>
                <Text style={styles.optionValue}>{phone}</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {website ? (
            <TouchableOpacity
              style={styles.option}
              onPress={() => openLink(normalizeWebsite(website))}
              accessibilityRole="button"
              accessibilityLabel={`Visit ${schoolName} website`}
            >
              <Ionicons name="globe-outline" size={22} color={theme.colors.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Visit website</Text>
                <Text style={styles.optionValue} numberOfLines={1}>
                  {website}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 440,
    ...theme.shadow.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  optionPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
  },
  optionValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  optionTitlePrimary: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: 'white',
  },
  optionValuePrimary: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  doneButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  doneButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
  },
});

export default RequestInfoModal;
