import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { theme } from '../styles/theme';

interface ContentDetailModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  category: string;
  author: string;
  /** Pre-formatted display date. */
  date: string;
  /** Markdown source; rendered with the app theme. */
  content: string;
}

/**
 * Full-content viewer shared by the Study and Community boards.
 * Renders the body as Markdown so authors can use headings, lists,
 * emphasis, links and code blocks.
 */
const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  visible,
  onClose,
  title,
  category,
  author,
  date,
  content,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.container}>
      <View style={styles.backdrop} onTouchEnd={onClose} />

      <View style={styles.modalContent}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.metaRow}>
              <Text style={styles.category}>{category}</Text>
              <Text style={styles.date}>{date}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.author}>by {author}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Markdown style={markdownStyles}>{content}</Markdown>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const monospaceFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 24,
  },
  heading1: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  heading2: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  heading3: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: theme.spacing.sm,
  },
  strong: {
    fontWeight: 'bold',
  },
  link: {
    color: theme.colors.primary,
  },
  blockquote: {
    backgroundColor: theme.colors.surfaceElevated,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  code_inline: {
    backgroundColor: theme.colors.surfaceElevated,
    fontFamily: monospaceFont,
    fontSize: theme.fontSize.sm,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  fence: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    fontFamily: monospaceFont,
    fontSize: theme.fontSize.sm,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  code_block: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    fontFamily: monospaceFont,
    fontSize: theme.fontSize.sm,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  bullet_list: {
    marginBottom: theme.spacing.sm,
  },
  ordered_list: {
    marginBottom: theme.spacing.sm,
  },
  hr: {
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '85%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerInfo: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  category: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  date: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  author: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  closeButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  body: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});

export default ContentDetailModal;
