import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../data/mockData';
import { theme } from '../styles/theme';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
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
          <Text style={styles.userName}>{review.userName}</Text>
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
  userName: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
});

export default ReviewCard;