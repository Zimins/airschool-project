import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { User, UserSession } from '../types/auth';
import { AuthService } from '../services/AuthService';
import { usePasswordReset } from '../../App';

interface ProfileSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  session: UserSession | null;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  visible,
  onClose,
  user,
  session,
}) => {
  const navigation = useNavigation();
  const { isFromPasswordReset, setIsFromPasswordReset } = usePasswordReset();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Track if this password change session is from email reset
  const [isPasswordResetSession, setIsPasswordResetSession] = useState(false);

  // Auto-open password modal when coming from password reset email
  useEffect(() => {
    if (visible && isFromPasswordReset && session) {
      if (__DEV__) console.log('🔑 Auto-opening password change modal from email reset');
      setShowPasswordModal(true);
      setIsPasswordResetSession(true); // Mark this session as from email reset
      setIsFromPasswordReset(false); // Reset the global flag
    }
  }, [visible, isFromPasswordReset, session, setIsFromPasswordReset]);

  const handleResetPassword = () => {
    setShowPasswordModal(true);
    setIsPasswordResetSession(false); // Manual reset is not from email
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError('');
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordModal(false);
    setIsPasswordResetSession(false); // Reset session flag
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError('');
  };

  const handleConfirmPasswordChange = async () => {
    setPasswordError('');

    if (__DEV__) console.log('🔑 Password change - isPasswordResetSession:', isPasswordResetSession);

    // Validation - skip current password if from password reset email
    if (!isPasswordResetSession) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        setPasswordError('Please fill in all fields');
        return;
      }
    } else {
      if (!newPassword || !confirmNewPassword) {
        setPasswordError('Please fill in all password fields');
        return;
      }
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (!isPasswordResetSession && currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    if (!session) {
      setPasswordError('Session expired. Please login again.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const authService = new AuthService();

      // Only verify current password if NOT from password reset email
      if (!isPasswordResetSession) {
        if (__DEV__) console.log('🔐 Verifying current password...');
        const { data: signInData, error: signInError } = await authService.supabase.auth.signInWithPassword({
          email: session.email,
          password: currentPassword,
        });

        if (signInError || !signInData.user) {
          setPasswordError('Current password is incorrect');
          setIsChangingPassword(false);
          return;
        }
      } else {
        if (__DEV__) console.log('✅ Skipping current password verification (from email reset)');
      }

      // Update to new password
      if (__DEV__) console.log('🔄 Updating password...');
      const { error: updateError } = await authService.supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        if (__DEV__) console.error('Update password error:', updateError);
        setPasswordError(updateError.message || 'Failed to update password');
        setIsChangingPassword(false);
        return;
      }

      // Success
      if (__DEV__) console.log('✅ Password updated successfully');
      setShowPasswordModal(false);
      setIsPasswordResetSession(false); // Reset session flag
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      if (Platform.OS === 'web') {
        window.alert('Password changed successfully!');
      } else {
        Alert.alert('Success', 'Password changed successfully!');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    // Show confirmation modal instead of alert
    setShowDeleteConfirm(true);
    setDeleteConfirmEmail('');
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmEmail('');
  };

  const performDeleteAccount = async () => {
    if (!session || !user) {
      Alert.alert('Error', 'No active session found.');
      return;
    }

    // Verify email matches (with trimming to handle whitespace)
    if (deleteConfirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      if (Platform.OS === 'web') {
        window.alert('Email does not match. Please enter your email correctly.');
      } else {
        Alert.alert('Error', 'Email does not match. Please enter your email correctly.');
      }
      return;
    }

    setIsDeleting(true);

    try {
      const authService = new AuthService();

      // Delete user account (this also clears the session)
      await authService.deleteAccount(session);

      // Close modals
      setShowDeleteConfirm(false);
      onClose();

      // Show success message
      if (Platform.OS === 'web') {
        window.alert('Your account has been successfully deleted.');
      } else {
        Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
      }

      // Navigate to home
      navigation.navigate('Home' as never);
    } catch (error: any) {
      console.error('Delete account error:', error);

      const errorMessage = error.message || 'Failed to delete account. Please try again.';

      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* User Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Information</Text>

              <View style={styles.userInfoCard}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {user?.email ? getInitials(user.email) : 'U'}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {user?.email?.split('@')[0] || 'User'}
                  </Text>
                  <Text style={styles.userEmail}>{user?.email || ''}</Text>
                  <View style={styles.roleContainer}>
                    <Text style={styles.roleLabel}>Role: </Text>
                    <Text style={[
                      styles.roleValue,
                      session?.role === 'admin' && styles.adminRole
                    ]}>
                      {session?.role?.toUpperCase() || 'USER'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Settings</Text>

              <TouchableOpacity style={styles.settingItem} onPress={handleResetPassword}>
                <Ionicons name="key-outline" size={20} color={theme.colors.text} />
                <Text style={styles.settingText}>Reset Password</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={[styles.settingItem, styles.dangerItem, isDeleting && styles.disabledItem]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <ActivityIndicator size="small" color={theme.colors.error} />
                    <Text style={[styles.settingText, styles.dangerText]}>Deleting Account...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                    <Text style={[styles.settingText, styles.dangerText]}>Delete Account</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.error} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Details</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Created:</Text>
                  <Text style={styles.infoValue}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Login:</Text>
                  <Text style={styles.infoValue}>
                    {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Status:</Text>
                  <Text style={[styles.infoValue, styles.activeStatus]}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelPasswordChange}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="key" size={48} color={theme.colors.primary} />
              <Text style={[styles.deleteModalTitle, { color: theme.colors.text }]}>Change Password</Text>
            </View>

            <Text style={[styles.deleteModalText, { textAlign: 'left', marginBottom: theme.spacing.md }]}>
              {isPasswordResetSession
                ? 'Choose your new password.'
                : 'Enter your current password and choose a new password.'}
            </Text>

            {/* Current Password - only show if NOT from password reset email */}
            {!isPasswordResetSession && (
              <View style={styles.passwordInputGroup}>
                <Text style={styles.passwordLabel}>Current Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* New Password */}
            <View style={styles.passwordInputGroup}>
              <Text style={styles.passwordLabel}>New Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.passwordInputGroup}>
              <Text style={styles.passwordLabel}>Confirm New Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  secureTextEntry={!showConfirmNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                >
                  <Ionicons
                    name={showConfirmNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {passwordError ? (
              <View style={styles.passwordErrorContainer}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                <Text style={styles.passwordErrorText}>{passwordError}</Text>
              </View>
            ) : null}

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={handleCancelPasswordChange}
                disabled={isChangingPassword}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteModalButton,
                  styles.confirmPasswordButton,
                  isChangingPassword && styles.confirmDeleteButtonDisabled,
                ]}
                onPress={handleConfirmPasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={48} color={theme.colors.error} />
              <Text style={styles.deleteModalTitle}>Delete Account</Text>
            </View>

            <Text style={styles.deleteModalText}>
              This action cannot be undone. All your data including reviews and comments will be permanently deleted.
            </Text>

            <Text style={styles.deleteModalConfirmLabel}>
              To confirm, please enter your email address:
            </Text>

            <View style={styles.deleteInputContainer}>
              <Text style={styles.deleteInputHint}>{user?.email}</Text>
              <TextInput
                style={styles.deleteInput}
                placeholder="Enter your email"
                value={deleteConfirmEmail}
                onChangeText={setDeleteConfirmEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={handleCancelDelete}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteModalButton,
                  styles.confirmDeleteButton,
                  (isDeleting || deleteConfirmEmail.toLowerCase() !== user?.email.toLowerCase()) &&
                    styles.confirmDeleteButtonDisabled,
                ]}
                onPress={performDeleteAccount}
                disabled={isDeleting || deleteConfirmEmail.toLowerCase() !== user?.email.toLowerCase()}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete My Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...theme.shadow.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: 'white',
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  roleValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  adminRole: {
    color: theme.colors.primary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    } as any),
  },
  settingText: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    fontWeight: '500',
  },
  dangerItem: {
    backgroundColor: theme.colors.error + '08',
  },
  dangerText: {
    color: theme.colors.error,
  },
  disabledItem: {
    opacity: 0.5,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    } as any),
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '500',
  },
  activeStatus: {
    color: theme.colors.success,
  },
  // Delete confirmation modal styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  deleteModalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 450,
    ...theme.shadow.xl,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  deleteModalTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginTop: theme.spacing.md,
  },
  deleteModalText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  deleteModalConfirmLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  deleteInputContainer: {
    marginBottom: theme.spacing.xl,
  },
  deleteInputHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontStyle: 'italic',
  },
  deleteInput: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    } as any),
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
  },
  confirmDeleteButton: {
    backgroundColor: theme.colors.error,
  },
  confirmDeleteButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.5,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    } as any),
  },
  confirmDeleteButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: 'white',
  },
  // Password change modal styles
  passwordInputGroup: {
    marginBottom: theme.spacing.md,
  },
  passwordLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  passwordInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    paddingRight: 48,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  eyeButton: {
    position: 'absolute',
    right: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  passwordErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  passwordErrorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  confirmPasswordButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default ProfileSettingsModal;