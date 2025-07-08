import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlightSchool } from '../data/mockData';
import { theme } from '../styles/theme';

interface FlightSchoolCardProps {
  school: FlightSchool;
  onPress: () => void;
}

const FlightSchoolCard: React.FC<FlightSchoolCardProps> = ({ school, onPress }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : 'star-outline'}
        size={16}
        color={index < Math.floor(rating) ? theme.colors.warning : theme.colors.textSecondary}
      />
    ));
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: school.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{school.priceRange}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{school.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.location}>{school.location}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {school.description}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>{renderStars(school.rating)}</View>
            <Text style={styles.ratingText}>{school.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({school.reviewCount})</Text>
          </View>
          
          <View style={styles.tagsContainer}>
            {school.features.slice(0, 2).map((feature, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadow.lg,
    ...(Platform.OS === 'web' && {
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadow.xl.shadowOffset.height + 'px ' + theme.shadow.xl.shadowOffset.width + 'px ' + theme.shadow.xl.shadowRadius + 'px rgba(0,0,0,' + theme.shadow.xl.shadowOpacity + ')',
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3) 100%)',
  },
  priceTag: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  priceText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  location: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  reviewCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.primaryLight + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default FlightSchoolCard;