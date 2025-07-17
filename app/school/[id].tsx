import React, { useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockFlightSchools, mockReviews, getRatingDistribution } from '../../src/data/mockData';
import { theme } from '../../src/styles/theme';
import ReviewCard from '../../src/components/ReviewCard';
import ReviewModal from '../../src/components/ReviewModal';

const { width: screenWidth } = Dimensions.get('window');

const FlightSchoolDetailScreen = () => {
  const { id: schoolId } = useLocalSearchParams();
  const router = useRouter();
  
  const school = mockFlightSchools.find(s => s.id === schoolId);
  const reviews = mockReviews.filter(r => r.schoolId === schoolId);
  const ratingDistribution = getRatingDistribution(schoolId as string);
  
  const [activeTab, setActiveTab] = useState('programs');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!school) {
    return (
      <View style={styles.errorContainer}>
        <Text>School not found.</Text>
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
            <Text style={styles.sectionTitle}>Programs Offered</Text>
            {school.programs.map((program) => (
              <View key={program.id} style={styles.programCard}>
                <Text style={styles.programName}>{program.name}</Text>
                <Text style={styles.programDuration}>Duration: {program.duration}</Text>
                <Text style={styles.programPrice}>{program.price}</Text>
                <Text style={styles.programDescription}>{program.description}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'facilities':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Facilities Gallery</Text>
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
                onPress={() => setReviewModalVisible(true)}
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
          onPress={() => router.back()}
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

      {/* Floating Contact Button */}
      <TouchableOpacity style={styles.contactButton}>
        <Text style={styles.contactButtonText}>Contact</Text>
      </TouchableOpacity>

      {/* Review Modal */}
      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        schoolId={schoolId as string}
        schoolName={school.name}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  programPrice: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
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
});

export default FlightSchoolDetailScreen;