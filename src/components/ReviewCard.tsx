import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../data/mockData';
import { theme } from '../styles/theme';

interface ReviewCardProps {
  review: Review;
  /** When true, shows an admin-only control to toggle the verified flag. */
  isAdmin?: boolean;
  /** Called when an admin toggles verification. Receives the desired next value. */
  onToggleVerify?: (review: Review, nextVerified: boolean) => void;
  /** Disables the toggle while a verification request is in flight. */
  verifying?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isAdmin = false,
  onToggleVerify,
  verifying = false,
}) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(i < rating ? '★' : '☆');
    }
    return stars.join('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleHelpfulPress = () => {
    if (isHelpful) {
      // Already marked as helpful, undo it
      setIsHelpful(false);
      setHelpfulCount(helpfulCount - 1);
    } else {
      // Mark as helpful
      setIsHelpful(true);
      setHelpfulCount(helpfulCount + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: review.userAvatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{review.userName}</Text>
            {review.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.primary} />
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(review.rating)}</Text>
            <Text style={styles.date}>{formatDate(review.date)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>{review.title}</Text>
      <Text style={styles.content}>{review.content}</Text>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
          onPress={handleHelpfulPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isHelpful ? 'thumbs-up' : 'thumbs-up-outline'}
            size={16}
            color={isHelpful ? theme.colors.primary : theme.colors.textSecondary}
            style={styles.helpfulIcon}
          />
          <Text style={[styles.helpfulText, isHelpful && styles.helpfulTextActive]}>
            Helpful ({helpfulCount})
          </Text>
        </TouchableOpacity>

        {isAdmin && onToggleVerify && (
          <TouchableOpacity
            style={[styles.verifyButton, review.verified && styles.verifyButtonActive]}
            onPress={() => onToggleVerify(review, !review.verified)}
            disabled={verifying}
            activeOpacity={0.7}
          >
            <Ionicons
              name={review.verified ? 'shield-checkmark' : 'shield-outline'}
              size={16}
              color={review.verified ? 'white' : theme.colors.primary}
              style={styles.helpfulIcon}
            />
            <Text style={[styles.verifyButtonText, review.verified && styles.verifyButtonTextActive]}>
              {verifying ? '...' : review.verified ? 'Unverify' : 'Verify'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  userName: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary}15`,
  },
  verifiedBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stars: {
    color: theme.colors.secondary,
    fontSize: theme.fontSize.sm,
  },
  date: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  content: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      userSelect: 'none',
    } as any),
  },
  helpfulButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  helpfulIcon: {
    marginRight: theme.spacing.xs,
  },
  helpfulText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  helpfulTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      userSelect: 'none',
    } as any),
  },
  verifyButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  verifyButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  verifyButtonTextActive: {
    color: 'white',
  },
});

export default ReviewCard;