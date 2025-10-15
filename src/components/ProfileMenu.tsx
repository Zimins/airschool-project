import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { User, UserSession } from '../types/auth';

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  session: UserSession | null;
  onLogout: () => Promise<void>;
  onNavigateToAdmin?: () => void;
  onRoleChange?: () => Promise<void>;
  onShowProfileSettings?: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  visible,
  onClose,
  user,
  session,
  onLogout,
  onNavigateToAdmin,
  onRoleChange,
  onShowProfileSettings,
}) => {
  const isAdmin = session?.role === 'admin';
  const [showRoleConfirm, setShowRoleConfirm] = React.useState(false);

  const handleLogout = async () => {
    console.log('🔴 ProfileMenu: handleLogout called');

    // Web에서는 window.confirm 사용
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      console.log('🔴 ProfileMenu: User confirmation:', confirmed);

      if (confirmed) {
        console.log('🔴 ProfileMenu: User confirmed logout');
        try {
          await onLogout();
          console.log('✅ ProfileMenu: onLogout completed');
        } catch (error) {
          console.error('❌ ProfileMenu: onLogout error:', error);
        }
      }
    } else {
      // Native에서는 Alert 사용
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              console.log('🔴 ProfileMenu: User confirmed logout');
              try {
                await onLogout();
                console.log('✅ ProfileMenu: onLogout completed');
              } catch (error) {
                console.error('❌ ProfileMenu: onLogout error:', error);
              }
            },
          },
        ]
      );
    }
  };

  const handleRoleToggle = async () => {
    console.log('🔴 ProfileMenu: handleRoleToggle clicked!');
    console.log('🔴 Current user:', user?.email);
    console.log('🔴 Current role:', session?.role);
    console.log('🔴 isAdmin:', isAdmin);
    console.log('🔴 onRoleChange function:', typeof onRoleChange);

    const newRole = isAdmin ? 'user' : 'admin';
    console.log('🔴 Target role:', newRole);
    console.log('🔴 Showing role confirmation modal...');

    setShowRoleConfirm(true);
  };

  const handleConfirmRoleChange = async () => {
    console.log('🔴 User confirmed role change');
    console.log('🔴 Closing modals...');

    setShowRoleConfirm(false);
    onClose();

    console.log('🔴 Calling onRoleChange...');
    if (onRoleChange) {
      try {
        await onRoleChange();
        console.log('🔴 onRoleChange completed successfully');
      } catch (error) {
        console.error('🔴 onRoleChange failed:', error);
      }
    } else {
      console.error('🔴 onRoleChange function is missing!');
    }
  };

  const handleCancelRoleChange = () => {
    console.log('🔴 User cancelled role change');
    setShowRoleConfirm(false);
  };

  const getInitials = (user: User | null) => {
    if (user?.nickname) {
      return user.nickname.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.split('@')[0].substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity activeOpacity={1}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {getInitials(user)}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user?.nickname || user?.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
                {isAdmin && (
                  <View style={styles.roleBadge}>
                    <Ionicons name="shield-checkmark" size={12} color={theme.colors.primary} />
                    <Text style={styles.roleText}>Admin</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    onNavigateToAdmin?.();
                  }}
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.text} />
                  <Text style={styles.menuItemText}>Admin Dashboard</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onShowProfileSettings?.();
                }}
              >
                <Ionicons name="person-outline" size={20} color={theme.colors.text} />
                <Text style={styles.menuItemText}>Profile Settings</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Development: Role Toggle Button */}
              <TouchableOpacity
                style={[styles.menuItem, styles.devMenuItem]}
                onPress={() => {
                  console.log('🔵 Role toggle button pressed!');
                  handleRoleToggle();
                }}
              >
                <Ionicons
                  name={isAdmin ? "person-outline" : "shield-checkmark-outline"}
                  size={20}
                  color={theme.colors.warning}
                />
                <Text style={[styles.menuItemText, styles.devMenuText]}>
                  Switch to {isAdmin ? 'User' : 'Admin'} Role
                </Text>
                <View style={styles.devBadge}>
                  <Text style={styles.devBadgeText}>DEV</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Role Change Confirmation Modal */}
      <Modal
        visible={showRoleConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleCancelRoleChange}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmHeader}>
              <Ionicons
                name={isAdmin ? "person-outline" : "shield-checkmark-outline"}
                size={32}
                color={theme.colors.warning}
              />
              <Text style={styles.confirmTitle}>
                Switch to {isAdmin ? 'User' : 'Admin'} Role
              </Text>
            </View>

            <Text style={styles.confirmMessage}>
              Are you sure you want to switch to {isAdmin ? 'regular user' : 'administrator'} role?
            </Text>

            <View style={styles.devWarning}>
              <Ionicons name="warning-outline" size={16} color={theme.colors.warning} />
              <Text style={styles.devWarningText}>This is a development feature</Text>
            </View>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={handleCancelRoleChange}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.switchButton]}
                onPress={handleConfirmRoleChange}
              >
                <Text style={styles.switchButtonText}>
                  Switch to {isAdmin ? 'User' : 'Admin'}
                </Text>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90, // Position below header
    paddingRight: theme.spacing.lg,
  },
  menuContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    minWidth: 280,
    ...theme.shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: 'white',
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  menuItems: {
    padding: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    } as any),
  },
  menuItemText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  logoutText: {
    color: theme.colors.error,
  },
  devMenuItem: {
    backgroundColor: theme.colors.warning + '08',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  devMenuText: {
    color: theme.colors.warning,
    fontWeight: '600',
  },
  devBadge: {
    marginLeft: 'auto',
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  devBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  confirmModal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    ...theme.shadow.xl,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  confirmTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  devWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '15',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  devWarningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    } as any),
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
  },
  switchButton: {
    backgroundColor: theme.colors.warning,
  },
  switchButtonText: {
    fontSize: theme.fontSize.base,
    color: 'white',
    fontWeight: '600',
  },
});

export default ProfileMenu;