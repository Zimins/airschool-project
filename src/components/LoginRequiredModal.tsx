import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface LoginRequiredModalProps {
  visible: boolean;
  /** What the user was trying to do, e.g. "write a post". */
  action: string;
  onClose: () => void;
  onLogin: () => void;
}

/**
 * Shared "you need to sign in first" prompt used wherever a guest taps an
 * action that needs an account (writing a post, requesting school info, ...).
 */
const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ visible, action, onClose, onLogin }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.container} accessibilityViewIsModal>
        <Ionicons name="lock-closed-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.title}>Login Required</Text>
        <Text style={styles.message}>You need to be logged in to {action}.</Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={onLogin}
            accessibilityRole="button"
            accessibilityLabel="Go to login"
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

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
    maxWidth: 400,
    alignItems: 'center',
    ...theme.shadow.xl,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  cancelText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
  },
  loginText: {
    fontSize: theme.fontSize.base,
    color: 'white',
    fontWeight: '600',
  },
});

export default LoginRequiredModal;
