import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

const AdminDashboardScreen = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

  const handleSignOut = async () => {
    await signOut();
    router.replace('/admin/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { id: 'schools', label: 'Flight Schools', icon: 'airplane-outline' },
    { id: 'materials', label: 'Study Materials', icon: 'book-outline' },
    { id: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  const stats = [
    { label: 'Total Schools', value: '6', icon: 'business-outline', color: '#4CAF50' },
    { label: 'Study Materials', value: '5', icon: 'document-text-outline', color: '#2196F3' },
    { label: 'Total Users', value: '1,234', icon: 'people-outline', color: '#FF9800' },
    { label: 'Reviews', value: '274', icon: 'star-outline', color: '#9C27B0' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Ionicons name="shield-checkmark" size={40} color={theme.colors.white} />
          <Text style={styles.sidebarTitle}>Admin Panel</Text>
        </View>

        <View style={styles.menuItems}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                selectedMenu === item.id && styles.menuItemActive,
              ]}
              onPress={() => {
                setSelectedMenu(item.id);
                if (item.id === 'schools') {
                  router.push('/admin/schools');
                } else if (item.id === 'materials') {
                  router.push('/admin/materials');
                }
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={selectedMenu === item.id ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.menuItemText,
                  selectedMenu === item.id && styles.menuItemTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.white} />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.headerRight}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={20} color={theme.colors.white} />
            </View>
          </View>
        </View>

        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.welcomeText}>Welcome to AirSchool Admin</Text>
          <Text style={styles.subtitleText}>Manage flight schools and study materials</Text>

          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/admin/schools/add')}
              >
                <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Add School</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/admin/materials/add')}
              >
                <Ionicons name="document-attach-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Add Material</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.recentActivity}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Updated SkyWings Flight School</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="add-outline" size={16} color="#4CAF50" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Added new study material</Text>
                  <Text style={styles.activityTime}>5 hours ago</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
  },
  sidebar: {
    width: 250,
    backgroundColor: '#1a1a2e',
    paddingTop: Platform.OS === 'web' ? 0 : 50,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginLeft: theme.spacing.md,
  },
  menuItems: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
  },
  menuItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButtonText: {
    fontSize: 16,
    color: theme.colors.white,
    marginLeft: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitleText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    width: '25%',
    padding: theme.spacing.sm,
    minWidth: 150,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  quickActions: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  recentActivity: {
    marginBottom: theme.spacing.xl,
  },
  activityList: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

export default AdminDashboardScreen;