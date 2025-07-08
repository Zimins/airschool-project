import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Review } from '../data/mockData';
import { theme } from '../styles/theme';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(i < rating ? '★' : '☆');
    }
    return stars.join('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        <TouchableOpacity style={styles.helpfulButton}>
          <Text style={styles.helpfulText}>도움이 됨 ({review.helpful})</Text>
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
  },
  helpfulText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default ReviewCard;