import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { createClient } from '@supabase/supabase-js';
import SchoolsManagementScreen from './admin/SchoolsManagementScreen';
import StudyMaterialsManagementScreen from './admin/StudyMaterialsManagementScreen';
import UsersManagementScreen from './admin/UsersManagementScreen';
import CommunityPostsManagementScreen from './admin/CommunityPostsManagementScreen';
import SettingsManagementScreen from './admin/SettingsManagementScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Admin'>;

const AdminDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, actions } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalMaterials: 0,
    totalUsers: 0,
    totalPosts: 0,
  });

  // Initialize Supabase client
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Protect admin route
  React.useEffect(() => {
    if (!state.isAuthenticated || state.session?.role !== 'admin') {
      navigation.navigate('Login');
    }
  }, [state.isAuthenticated, state.session?.role, navigation]);

  // Fetch real statistics from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch total schools
        const { count: schoolsCount } = await supabase
          .from('flight_schools')
          .select('*', { count: 'exact', head: true });

        // Fetch total study materials
        const { count: materialsCount } = await supabase
          .from('study_materials')
          .select('*', { count: 'exact', head: true });

        // Fetch total users
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Fetch total community posts
        const { count: postsCount } = await supabase
          .from('community_posts')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalSchools: schoolsCount || 0,
          totalMaterials: materialsCount || 0,
          totalUsers: usersCount || 0,
          totalPosts: postsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use mock data as fallback
        setStats({
          totalSchools: 6,
          totalMaterials: 5,
          totalUsers: 0,
          totalPosts: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSignOut = async () => {
    try {
      await actions.logout();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { id: 'schools', label: 'Flight Schools', icon: 'airplane-outline' },
    { id: 'materials', label: 'Study Materials', icon: 'book-outline' },
    { id: 'posts', label: 'Community Posts', icon: 'chatbubbles-outline' },
    { id: 'users', label: 'Users', icon: 'people-outline' },
    { id: 'settings', label: 'App Settings', icon: 'settings-outline' },
  ];

  const statsCards = [
    { label: 'Total Schools', value: stats.totalSchools.toString(), icon: 'business-outline', color: '#4CAF50' },
    { label: 'Study Materials', value: stats.totalMaterials.toString(), icon: 'document-text-outline', color: '#2196F3' },
    { label: 'Community Posts', value: stats.totalPosts.toString(), icon: 'chatbubbles-outline', color: '#9C27B0' },
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: 'people-outline', color: '#FF9800' },
  ];

  const handleMenuPress = (menuId: string) => {
    setSelectedMenu(menuId);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'schools':
        return <SchoolsManagementScreen onBack={() => setSelectedMenu('dashboard')} />;
      case 'materials':
        return <StudyMaterialsManagementScreen onBack={() => setSelectedMenu('dashboard')} />;
      case 'posts':
        return <CommunityPostsManagementScreen onBack={() => setSelectedMenu('dashboard')} />;
      case 'users':
        return <UsersManagementScreen onBack={() => setSelectedMenu('dashboard')} />;
      case 'settings':
        return <SettingsManagementScreen onBack={() => setSelectedMenu('dashboard')} />;
      case 'dashboard':
      default:
        return (
          <View style={styles.mainContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Dashboard</Text>
              <Text style={styles.welcomeText}>Welcome back, Admin!</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
              ) : (
                <View style={styles.statsGrid}>
                  {statsCards.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                      <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                        <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                      </View>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Sidebar for web, header for mobile */}
      {Platform.OS === 'web' ? (
        <>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Ionicons name="shield-checkmark" size={40} color="#ffffff" />
              <Text style={styles.sidebarTitle}>Admin Panel</Text>
              <Text style={styles.userEmail}>{state.session?.email}</Text>
            </View>

            <View style={styles.menuItems}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    selectedMenu === item.id && styles.menuItemActive,
                  ]}
                  onPress={() => handleMenuPress(item.id)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={selectedMenu === item.id ? '#ffffff' : 'rgba(255,255,255,0.8)'}
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

            <View style={styles.sidebarFooter}>
              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Ionicons name="home-outline" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.homeButtonText}>Go to Main Page</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderContent()}
        </>
      ) : (
        // Mobile layout
        <ScrollView style={styles.mobileContainer}>
          <View style={styles.mobileHeader}>
            <View style={styles.mobileHeaderTop}>
              <Ionicons name="shield-checkmark" size={32} color={theme.colors.primary} />
              <TouchableOpacity onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.mobileTitle}>Admin Dashboard</Text>
            <Text style={styles.mobileEmail}>{state.session?.email}</Text>
          </View>

          <View style={styles.mobileMenuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.mobileMenuItem}
                onPress={() => handleMenuPress(item.id)}
              >
                <Ionicons name={item.icon as any} size={28} color={theme.colors.primary} />
                <Text style={styles.mobileMenuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.mobileStats}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              statsCards.map((stat, index) => (
                <View key={index} style={styles.mobileStatCard}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                <Text style={styles.mobileStatValue}>{stat.value}</Text>
                <Text style={styles.mobileStatLabel}>{stat.label}</Text>
              </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
    backgroundColor: '#1e293b',
    padding: 20,
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: 10,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  menuItemText: {
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 12,
    fontSize: 14,
  },
  menuItemTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  sidebarFooter: {
    marginTop: 'auto',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 20,
  },
  homeButtonText: {
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 12,
    fontSize: 14,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 8,
  },
  signOutText: {
    color: theme.colors.white,
    marginLeft: 12,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  welcomeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  statCard: {
    width: '31%',
    backgroundColor: theme.colors.white,
    padding: 20,
    margin: '1%',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  // Mobile styles
  mobileContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mobileHeader: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  mobileHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 10,
  },
  mobileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  mobileMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  mobileMenuItem: {
    width: '48%',
    backgroundColor: theme.colors.white,
    padding: 20,
    margin: '1%',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mobileMenuText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text,
  },
  mobileStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  mobileStatCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    padding: 15,
    margin: '1%',
    borderRadius: 12,
    alignItems: 'center',
  },
  mobileStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 5,
  },
  mobileStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

export default AdminDashboardScreen;