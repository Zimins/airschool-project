import { Platform, StyleSheet } from 'react-native';
import { theme } from './theme';

const monospaceFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

/** Themed styles for react-native-markdown-display, shared by every Markdown view. */
export const markdownStyles = StyleSheet.create({
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
