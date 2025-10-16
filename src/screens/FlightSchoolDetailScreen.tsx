import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { mockReviews, getRatingDistribution } from '../data/mockData';
import { theme } from '../styles/theme';
import ReviewCard from '../components/ReviewCard';
import ReviewModal from '../components/ReviewModal';
import { FlightSchoolService } from '../services/FlightSchoolService';
import { FlightSchool, Review } from '../types/flightSchool';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'FlightSchoolDetail'>;

const { width: screenWidth } = Dimensions.get('window');

const FlightSchoolDetailScreen = () => {
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<Props['navigation']>();
  const { schoolId } = route.params;
  const { state: authState } = useAuth();

  const [school, setSchool] = useState<FlightSchool | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('programs');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [loginRequiredModalVisible, setLoginRequiredModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [flightSchoolService] = useState(() => new FlightSchoolService());

  useEffect(() => {
    loadSchoolData();
  }, [schoolId]);

  const loadSchoolData = async () => {
    console.log('🔄 Loading school data for ID:', schoolId);
    setIsLoading(true);
    setError(null);

    try {
      const schoolData = await flightSchoolService.getFlightSchoolById(schoolId);

      if (!schoolData) {
        setError('School not found');
        setSchool(null);
      } else {
        console.log('✅ School data loaded:', schoolData.name);
        setSchool(schoolData);

        // Try to load reviews from Supabase
        try {
          const reviewsData = await flightSchoolService.getReviewsForSchool(schoolId);
          setReviews(reviewsData);
          console.log(`✅ Loaded ${reviewsData.length} reviews`);
        } catch (reviewError) {
          console.warn('⚠️ Could not load reviews, using mock data:', reviewError);
          // Fallback to mock reviews if Supabase reviews fail
          const mockReviewsData = mockReviews.filter(r => r.schoolId === schoolId);
          setReviews(mockReviewsData);
        }
      }
    } catch (err) {
      console.error('❌ Error loading school data:', err);
      setError('Failed to load school information');
      setSchool(null);
    } finally {
      setIsLoading(false);
    }
  };

  const ratingDistribution = school ? getRatingDistribution(schoolId) : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  const handleWriteReviewClick = () => {
    if (!authState.isAuthenticated) {
      setLoginRequiredModalVisible(true);
    } else {
      setReviewModalVisible(true);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading school details...</Text>
      </View>
    );
  }

  if (error || !school) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>{error || 'School not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      
      case 'programs':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Available Programs</Text>
            {school.programs.map((program) => (
              <View key={program.id} style={styles.programCard}>
                <Text style={styles.programName}>{program.name}</Text>
                <Text style={styles.programDuration}>Duration: {program.duration}</Text>
                <Text style={styles.programDescription}>{program.description}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'facilities':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Facility Gallery</Text>
            <FlatList
              horizontal
              data={school.gallery}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
                  <Image source={{ uri: item }} style={styles.galleryImage} />
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        );
      
      case 'location':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Location Information</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Address:</Text>
              <Text style={styles.contactValue}>{school.contact.address}</Text>
              
              <Text style={styles.contactLabel}>Phone:</Text>
              <Text style={styles.contactValue}>{school.contact.phone}</Text>
              
              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>{school.contact.email}</Text>
              
              <Text style={styles.contactLabel}>Website:</Text>
              <Text style={styles.contactValue}>{school.contact.website}</Text>
            </View>
            
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>Map (Prototype)</Text>
            </View>
          </View>
        );
      
      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={handleWriteReviewClick}
              >
                <Text style={styles.writeReviewButtonText}>Write Review</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.ratingOverview}>
              <View style={styles.ratingLeft}>
                <Text style={styles.ratingNumber}>{school.rating}</Text>
                <Text style={styles.ratingStars}>{renderStars(school.rating)}</Text>
                <Text style={styles.totalReviews}>{school.reviewCount} reviews</Text>
              </View>
              
              <View style={styles.ratingDistribution}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <View key={star} style={styles.ratingBar}>
                    <Text style={styles.ratingBarLabel}>{star}</Text>
                    <View style={styles.ratingBarContainer}>
                      <View
                        style={[
                          styles.ratingBarFill,
                          {
                            width: `${(ratingDistribution[star as keyof typeof ratingDistribution] / reviews.length) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.ratingBarCount}>
                      {ratingDistribution[star as keyof typeof ratingDistribution]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image source={{ uri: school.image }} style={styles.heroImage} />
        <View style={styles.heroOverlay}>
          <Text style={styles.schoolName}>{school.name}</Text>
          <View style={styles.heroInfo}>
            <Text style={styles.heroRating}>
              {renderStars(school.rating)} {school.rating}
            </Text>
            <Text style={styles.heroLocation}>{school.location}</Text>
          </View>
        </View>
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home' as never);
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'programs', label: 'Programs' },
            { id: 'facilities', label: 'Facilities' },
            { id: 'location', label: 'Location' },
            { id: 'reviews', label: 'Reviews' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Review Modal */}
      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        schoolId={schoolId}
        schoolName={school.name}
      />

      {/* Login Required Modal */}
      <Modal
        visible={loginRequiredModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLoginRequiredModalVisible(false)}
      >
        <View style={styles.loginModalOverlay}>
          <View style={styles.loginModalContainer}>
            <Ionicons name="lock-closed-outline" size={48} color={theme.colors.primary} />
            <Text style={styles.loginModalTitle}>Login Required</Text>
            <Text style={styles.loginModalMessage}>
              You need to be logged in to write a review.
            </Text>
            <View style={styles.loginModalButtons}>
              <TouchableOpacity
                style={[styles.loginModalButton, styles.loginModalCancelButton]}
                onPress={() => setLoginRequiredModalVisible(false)}
              >
                <Text style={styles.loginModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.loginModalButton, styles.loginModalLoginButton]}
                onPress={() => {
                  setLoginRequiredModalVisible(false);
                  navigation.navigate('Login' as never);
                }}
              >
                <Text style={styles.loginModalLoginText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.error,
    textAlign: 'center',
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
  heroSection: {
    height: 250,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
    left: theme.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    } as any),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing.lg,
  },
  schoolName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  heroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  heroRating: {
    color: theme.colors.secondary,
    fontSize: theme.fontSize.lg,
  },
  heroLocation: {
    color: 'white',
    fontSize: theme.fontSize.base,
  },
  tabContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  tab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  featuresContainer: {
    marginBottom: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  featureBullet: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    flex: 1,
  },
  programCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  programName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  programDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  programDescription: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  galleryImage: {
    width: screenWidth - theme.spacing.xl,
    height: 200,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  contactInfo: {
    marginBottom: theme.spacing.lg,
  },
  contactLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  contactValue: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.base,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  writeReviewButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  writeReviewButtonText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  ratingOverview: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  ratingLeft: {
    alignItems: 'center',
    marginRight: theme.spacing.xl,
  },
  ratingNumber: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  ratingStars: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.secondary,
    marginVertical: theme.spacing.xs,
  },
  totalReviews: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  ratingDistribution: {
    flex: 1,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  ratingBarLabel: {
    width: 20,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginHorizontal: theme.spacing.sm,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
  },
  ratingBarCount: {
    width: 30,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  contactButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    ...theme.shadow.lg,
  },
  contactButtonText: {
    color: 'white',
    fontSize: theme.fontSize.base,
    fontWeight: 'bold',
  },
  loginModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loginModalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...theme.shadow.xl,
  },
  loginModalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  loginModalMessage: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  loginModalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  loginModalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  loginModalCancelButton: {
    backgroundColor: theme.colors.border,
  },
  loginModalCancelText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
  },
  loginModalLoginButton: {
    backgroundColor: theme.colors.primary,
  },
  loginModalLoginText: {
    fontSize: theme.fontSize.base,
    color: 'white',
    fontWeight: '600',
  },
});

export default FlightSchoolDetailScreen;