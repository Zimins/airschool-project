import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../styles/theme';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Emily Chen',
    content: 'Congratulations on your first solo! I remember mine like it was yesterday.',
    createdAt: '2024-03-20',
    likes: 12,
  },
  {
    id: '2',
    author: 'Mark Johnson',
    content: 'Great achievement! How many hours did you have before solo?',
    createdAt: '2024-03-20',
    likes: 8,
  },
  {
    id: '3',
    author: 'Sara Kim',
    content: 'Amazing! Which aircraft did you fly?',
    createdAt: '2024-03-21',
    likes: 5,
  },
];

const mockPosts = [
  {
    id: '1',
    title: 'First Solo Flight Experience!',
    author: 'John Pilot',
    category: 'Experience',
    content: `Just completed my first solo flight today. It was amazing!

The feeling of being alone in the cockpit for the first time is indescribable. My instructor got out after three touch-and-goes, gave me a thumbs up, and said "It's all yours!"

My heart was racing as I taxied to the runway. The checklist seemed longer than usual, and I double-checked everything twice. As I pushed the throttle forward and the aircraft started accelerating, I realized this was it - I was really doing this alone.

The takeoff was smooth, and suddenly I was airborne with no one beside me. The pattern work felt natural after all the practice, but the aircraft definitely felt lighter without my instructor's weight. 

Three successful landings later, I was taxiing back with the biggest smile on my face. My instructor was waiting with the traditional shirt-tail cutting ceremony.

To anyone working towards their first solo - keep at it! The feeling is worth every hour of practice.`,
    createdAt: '2024-03-20',
    likes: 45,
    comments: 12,
    views: 234,
  },
  {
    id: '2',
    title: 'Tips for PPL Written Test',
    author: 'Sarah Wings',
    category: 'Tips',
    content: 'Here are some study tips that helped me pass the written test...',
    createdAt: '2024-03-19',
    likes: 67,
    comments: 23,
    views: 567,
  },
  {
    id: '3',
    title: 'Best Flight Schools in Korea?',
    author: 'Mike Air',
    category: 'Question',
    content: 'Looking for recommendations for flight schools...',
    createdAt: '2024-03-18',
    likes: 23,
    comments: 34,
    views: 456,
  },
  {
    id: '4',
    title: 'Weather Minimums Discussion',
    author: 'Captain Lee',
    category: 'Discussion',
    content: 'What are your personal minimums for VFR flights?',
    createdAt: '2024-03-17',
    likes: 12,
    comments: 8,
    views: 123,
  },
];

const PostDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);

  const post = mockPosts.find(p => p.id === id);

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Post not found</Text>
      </View>
    );
  }

  const handleAddComment = () => {
    if (comment.trim()) {
      // In a real app, this would add the comment to the backend
      setComment('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.postHeader}>
          <Text style={styles.postCategory}>{post.category}</Text>
          <Text style={styles.postDate}>{post.createdAt}</Text>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postAuthor}>by {post.author}</Text>

        <Text style={styles.postContent}>{post.content}</Text>

        <View style={styles.postStats}>
          <TouchableOpacity 
            style={styles.statButton}
            onPress={() => setLiked(!liked)}
          >
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={20} 
              color={liked ? theme.colors.error : theme.colors.textSecondary} 
            />
            <Text style={[styles.statText, liked && styles.likedText]}>
              {post.likes + (liked ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{post.comments}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{post.views}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.commentsTitle}>Comments ({mockComments.length})</Text>

        {mockComments.map((comment) => (
          <View key={comment.id} style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.commentDate}>{comment.createdAt}</Text>
            </View>
            <Text style={styles.commentContent}>{comment.content}</Text>
            <TouchableOpacity style={styles.commentLike}>
              <Ionicons name="heart-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.commentLikeText}>{comment.likes}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={comment}
          onChangeText={setComment}
          multiline
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!comment.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={comment.trim() ? theme.colors.primary : theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  moreButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  postCategory: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  postDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  postTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  postAuthor: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  postContent: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  postStats: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  likedText: {
    color: theme.colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  commentsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  commentCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  commentAuthor: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  commentDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  commentContent: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  commentLike: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  commentLikeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    padding: theme.spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default PostDetailScreen;