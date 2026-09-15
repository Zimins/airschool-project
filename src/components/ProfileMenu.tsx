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
  onShowProfileSettings?: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  visible,
  onClose,
  user,
  session,
  onLogout,
  onNavigateToAdmin,
  onShowProfileSettings,
}) => {
  const isAdmin = session?.role === 'admin';

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
});

export default ProfileMenu;