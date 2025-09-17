import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { User, UserSession } from '../types/auth';

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
  const handleResetPassword = () => {
    Alert.alert(
      'Reset Password',
      'This feature will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete Account', 'This feature will be implemented soon.');
          },
        },
      ]
    );
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
                style={[styles.settingItem, styles.dangerItem]}
                onPress={handleDeleteAccount}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                <Text style={[styles.settingText, styles.dangerText]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.error} />
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
});

export default ProfileSettingsModal;