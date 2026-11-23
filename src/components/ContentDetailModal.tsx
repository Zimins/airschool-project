import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { theme } from '../styles/theme';
import { markdownStyles } from '../styles/markdown';

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
