import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { mockFlightSchools } from '../data/mockData';
import { theme } from '../styles/theme';
import { FlightSchoolService } from '../services/FlightSchoolService';
import { FlightSchool } from '../types/flightSchool';
import FlightSchoolCard from '../components/FlightSchoolCard';
import ProfileMenu from '../components/ProfileMenu';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, actions } = useAuth();
  const { user, session } = state;
  const isAdmin = session?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredSchools, setFilteredSchools] = useState<FlightSchool[]>([]);
  const [allSchools, setAllSchools] = useState<FlightSchool[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [flightSchoolService] = useState(() => new FlightSchoolService());

  useEffect(() => {
    loadFlightSchools();
  }, []);

  useEffect(() => {
    if (!isLoading && allSchools.length > 0) {
      if (searchQuery.trim()) {
        const filtered = allSchools.filter(
          school =>
            school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            school.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredSchools(filtered);
      } else {
        setFilteredSchools(allSchools);
      }
    }
  }, [searchQuery, allSchools, isLoading]);

  const loadFlightSchools = async () => {
    console.log('🔄 Loading flight schools from Supabase...');
    setIsLoading(true);

    try {
      const schools = await flightSchoolService.getAllFlightSchools();
      console.log(`✅ Loaded ${schools.length} flight schools from database`);
      setAllSchools(schools);
      setFilteredSchools(schools);
    } catch (error) {
      console.error('❌ Error loading flight schools:', error);
      console.error('💾 Database connection failed - no fallback data available');

      // Show empty state instead of mock data
      setAllSchools([]);
      setFilteredSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolPress = (schoolId: string) => {
    navigation.navigate('FlightSchoolDetail', { schoolId });
  };

  const handleSocialMediaPress = async (platform: 'instagram' | 'tiktok') => {
    const urls = {
      instagram: 'https://www.instagram.com/preflightnet',
      tiktok: 'https://www.tiktok.com/@preflightnet',
    };

    const url = urls[platform];

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        if (Platform.OS === 'web') {
          window.alert(`Cannot open ${platform} URL`);
        } else {
          Alert.alert('Error', `Cannot open ${platform} URL`);
        }
      }
    } catch (error) {
      console.error(`Error opening ${platform}:`, error);
      if (Platform.OS === 'web') {
        window.alert(`Failed to open ${platform}`);
      } else {
        Alert.alert('Error', `Failed to open ${platform}`);
      }
    }
  };

  const handleRoleChange = async () => {
    console.log('🟢 HomeScreen: handleRoleChange called!');
    console.log('🟢 Current session:', session);
    console.log('🟢 Current isAdmin:', isAdmin);

    const newRole = isAdmin ? 'user' : 'admin';
    const roleDisplayName = newRole === 'admin' ? 'Administrator' : 'Regular User';

    console.log('🟢 Target role:', newRole);
    console.log('🟢 Target display name:', roleDisplayName);

    try {
      console.log(`🔄 Switching role from ${session?.role} to ${newRole}...`);

      // Use Supabase Auth updateUser to change role
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase.auth.updateUser({
        data: {
          role: newRole,
          role_changed_at: new Date().toISOString(),
          role_change_count: (session?.supabaseSession?.user?.user_metadata?.role_change_count || 0) + 1
        }
      });

      if (error) {
        console.error('❌ Role change error:', error.message);

        if (Platform.OS === 'web') {
          window.alert(`Role Change Failed\n\nUnable to switch to ${roleDisplayName} role.\n\nError: ${error.message}`);
        } else {
          Alert.alert(
            'Role Change Failed',
            `Unable to switch to ${roleDisplayName} role.\n\nError: ${error.message}`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      console.log('✅ Role changed successfully:', newRole);
      console.log('Updated user metadata:', data.user?.user_metadata);

      // Refresh the session to get updated role
      await actions.checkSession();

      // Show success alert with additional context
      const successMessage = `🎉 Role Changed Successfully!\n\nYou are now logged in as ${roleDisplayName}.\n\n` +
        `${newRole === 'admin'
          ? '• You now have access to the Admin Dashboard\n• Admin features are now available'
          : '• Admin features are now hidden\n• You have standard user permissions'
        }`;

      if (Platform.OS === 'web') {
        window.alert(successMessage);
      } else {
        Alert.alert(
          '🎉 Role Changed Successfully!',
          `You are now logged in as ${roleDisplayName}.\n\n` +
          `${newRole === 'admin'
            ? '• You now have access to the Admin Dashboard\n• Admin features are now available'
            : '• Admin features are now hidden\n• You have standard user permissions'
          }`,
          [
            {
              text: 'OK',
              onPress: () => {
                console.log(`🎯 User role successfully changed to: ${newRole.toUpperCase()}`);
              }
            }
          ]
        );
      }

      console.log(`🎯 User role successfully changed to: ${newRole.toUpperCase()}`);

    } catch (error) {
      console.error('❌ Role change failed:', error);

      const errorMessage = 'Failed to change role. Please try again.\n\nIf the problem persists, please check your internet connection.';

      if (Platform.OS === 'web') {
        window.alert(`Error\n\n${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>AirSchool</Text>
              <Text style={styles.headerTagline}>
                {user ? `Welcome, ${user.email?.split('@')[0]}!` : "Korea's #1 Flight School Platform"}
              </Text>
            </View>
            <View style={styles.headerButtons}>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.adminButton}
                  onPress={() => navigation.navigate('Admin')}
                >
                  <Ionicons name="shield-checkmark-outline" size={28} color="white" />
                </TouchableOpacity>
              )}
              {user ? (
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => setShowProfileMenu(true)}
                >
                  <Ionicons name="person-circle-outline" size={32} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Ionicons name="person-circle-outline" size={32} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.headerSubtitle}>
            Find the perfect partner to realize your aviation dreams
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by school name or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="white" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.boardButtonsContainer}>
        <TouchableOpacity
          style={styles.boardButton}
          onPress={() => navigation.navigate('CommunityBoard')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.boardButtonText}>Community Board</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.boardButton}
          onPress={() => navigation.navigate('StudyBoard')}
        >
          <Ionicons name="school-outline" size={24} color={theme.colors.secondary} />
          <Text style={styles.boardButtonText}>Study Board</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
        {['All', 'Seoul/Gyeonggi', 'Busan', 'Jeju', 'PPL', 'CPL', 'Helicopter'].map((tag) => (
          <TouchableOpacity key={tag} style={styles.tagButton}>
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerWrapper}>
      <Text style={styles.footerTitle}>Follow Us</Text>
      <Text style={styles.footerSubtitle}>Stay connected for the latest updates</Text>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialMediaPress('instagram')}
        >
          <LinearGradient
            colors={['#833AB4', '#C13584', '#E1306C', '#FD1D1D', '#F56040', '#FCAF45']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.socialButtonGradient}
          >
            <Ionicons name="logo-instagram" size={28} color="white" />
            <Text style={styles.socialButtonText}>Instagram</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialMediaPress('tiktok')}
        >
          <LinearGradient
            colors={['#000000', '#010101']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.socialButtonGradient}
          >
            <Ionicons name="logo-tiktok" size={28} color="white" />
            <Text style={styles.socialButtonText}>TikTok</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerCopyright}>© 2025 PreflightSchool. All rights reserved.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredSchools}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FlightSchoolCard
            school={item}
            onPress={() => handleSchoolPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.listLoadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.listLoadingText}>Loading flight schools...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="warning-outline" size={48} color={theme.colors.error} />
              <Text style={styles.emptyText}>Database Connection Failed</Text>
              <Text style={styles.emptySubtext}>
                Please check Supabase configuration and ensure flight_schools table exists.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadFlightSchools}
              >
                <Ionicons name="refresh-outline" size={20} color="white" />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <ProfileMenu
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        user={user}
        session={session}
        onLogout={actions.logout}
        onNavigateToAdmin={() => navigation.navigate('Admin')}
        onRoleChange={handleRoleChange}
        onShowProfileSettings={() => setShowProfileSettings(true)}
      />

      <ProfileSettingsModal
        visible={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        user={user}
        session={session}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listLoadingContainer: {
    paddingVertical: theme.spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listLoadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.error,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  retryButtonText: {
    color: 'white',
    fontSize: theme.fontSize.base,
    fontWeight: '600',
  },
  headerWrapper: {
    marginBottom: theme.spacing.lg,
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xxl,
    borderBottomRightRadius: theme.borderRadius.xxl,
  },
  headerContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.display,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: -1,
  },
  headerTagline: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: theme.spacing.xs,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  profileButton: {
    padding: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.xl,
    color: 'white',
    lineHeight: 28,
    fontWeight: '300',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.lg,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadow.lg,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  filterButton: {
    height: 56,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadow.lg,
  },
  filterButtonText: {
    color: 'white',
    fontSize: theme.fontSize.base,
    fontWeight: '600',
  },
  boardButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  boardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    ...theme.shadow.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  boardButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
  },
  tagsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  tagButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  footerWrapper: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  footerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    width: '100%',
    maxWidth: 600,
  },
  socialButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadow.md,
  },
  socialButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  socialButtonText: {
    color: 'white',
    fontSize: theme.fontSize.base,
    fontWeight: '600',
  },
  footerCopyright: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default HomeScreen;