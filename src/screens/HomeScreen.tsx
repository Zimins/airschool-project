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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { mockFlightSchools } from '../data/mockData';
import { theme } from '../styles/theme';
import FlightSchoolCard from '../components/FlightSchoolCard';
import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, actions } = useAuth();
  const { user, session } = state;
  const isAdmin = session?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredSchools, setFilteredSchools] = useState(mockFlightSchools);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    const filtered = mockFlightSchools.filter(
      school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSchools(filtered);
  }, [searchQuery]);

  const handleSchoolPress = (schoolId: string) => {
    navigation.navigate('FlightSchoolDetail', { schoolId });
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
                  onPress={async () => {
                    await actions.logout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={32} color="white" />
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading flight schools...</Text>
      </View>
    );
  }

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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
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
});

export default HomeScreen;