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

interface StudyComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

const mockAttachments: Attachment[] = [
  {
    id: '1',
    name: 'PPL_Study_Guide.pdf',
    size: '2.5 MB',
    type: 'pdf',
  },
  {
    id: '2',
    name: 'Practice_Questions.pdf',
    size: '1.2 MB',
    type: 'pdf',
  },
  {
    id: '3',
    name: 'Answer_Key.pdf',
    size: '800 KB',
    type: 'pdf',
  },
];

const mockComments: StudyComment[] = [
  {
    id: '1',
    author: 'Jane Lee',
    content: 'This is really helpful! Thanks for sharing.',
    createdAt: '2024-03-20',
    likes: 8,
  },
  {
    id: '2',
    author: 'Tom Park',
    content: 'Great resource. Do you have more materials on weather?',
    createdAt: '2024-03-21',
    likes: 5,
  },
];

const mockStudyPosts = [
  {
    id: '1',
    title: 'PPL Written Test Complete Study Guide',
    author: 'David Kim',
    category: 'Written Test',
    content: `Comprehensive study guide covering all topics for PPL written test. Includes practice questions and detailed explanations.

This guide covers:
1. Air Law and ATC Procedures
2. Aircraft General Knowledge
3. Flight Performance and Planning
4. Human Performance and Limitations
5. Meteorology
6. Navigation
7. Operational Procedures
8. Principles of Flight
9. Communications

Each section includes:
- Key concepts and definitions
- Important formulas and calculations
- Common exam questions
- Detailed answer explanations
- Tips for remembering complex topics

The attached PDF files contain the complete study guide, practice questions, and answer keys. Feel free to download and use them for your preparation.

Good luck with your studies!`,
    createdAt: '2024-03-20',
    likes: 89,
    comments: 23,
    views: 1234,
    attachments: 3,
  },
  {
    id: '2',
    title: 'Aviation English Phraseology Handbook',
    author: 'Emma Park',
    category: 'Language',
    content: 'Complete collection of standard aviation phraseology with Korean translations and pronunciation guides.',
    createdAt: '2024-03-19',
    likes: 67,
    comments: 15,
    views: 890,
    attachments: 1,
  },
  {
    id: '3',
    title: 'VFR Navigation Chart Reading Tutorial',
    author: 'Captain Jung',
    category: 'Navigation',
    content: 'Step-by-step guide to reading VFR sectional charts. Includes symbol explanations and practical examples.',
    createdAt: '2024-03-18',
    likes: 56,
    comments: 12,
    views: 678,
    attachments: 5,
  },
  {
    id: '4',
    title: 'Weather Patterns and Flight Planning',
    author: 'Lisa Chen',
    category: 'Weather',
    content: 'Understanding weather systems for safe flight planning. Covers METAR/TAF interpretation and weather hazards.',
    createdAt: '2024-03-17',
    likes: 45,
    comments: 8,
    views: 567,
    attachments: 2,
  },
  {
    id: '5',
    title: 'Aircraft Systems Study Notes - Cessna 172',
    author: 'Mike Johnson',
    category: 'Aircraft',
    content: 'Detailed study notes on Cessna 172 systems including engine, electrical, hydraulic, and avionics.',
    createdAt: '2024-03-16',
    likes: 72,
    comments: 19,
    views: 923,
    attachments: 4,
  },
];

const StudyPostDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const post = mockStudyPosts.find(p => p.id === id);

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Study material not found</Text>
      </View>
    );
  }

  const handleAddComment = () => {
    if (comment.trim()) {
      // In a real app, this would add the comment to the backend
      setComment('');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'document-text';
      case 'doc':
      case 'docx':
        return 'document';
      case 'ppt':
      case 'pptx':
        return 'easel';
      default:
        return 'document-attach';
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
        <Text style={styles.headerTitle}>Study Material</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => setSaved(!saved)}
          >
            <Ionicons 
              name={saved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={saved ? theme.colors.secondary : theme.colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.postHeader}>
          <Text style={styles.postCategory}>{post.category}</Text>
          <Text style={styles.postDate}>{post.createdAt}</Text>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postAuthor}>by {post.author}</Text>

        <Text style={styles.postContent}>{post.content}</Text>

        {post.attachments > 0 && (
          <>
            <View style={styles.attachmentsHeader}>
              <Ionicons name="attach" size={20} color={theme.colors.text} />
              <Text style={styles.attachmentsTitle}>Attachments ({post.attachments})</Text>
            </View>
            {mockAttachments.map((attachment) => (
              <TouchableOpacity key={attachment.id} style={styles.attachmentCard}>
                <View style={styles.attachmentIcon}>
                  <Ionicons 
                    name={getFileIcon(attachment.type)} 
                    size={24} 
                    color={theme.colors.secondary} 
                  />
                </View>
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName}>{attachment.name}</Text>
                  <Text style={styles.attachmentSize}>{attachment.size}</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </>
        )}

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    padding: theme.spacing.sm,
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
    color: theme.colors.secondary,
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
  attachmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  attachmentsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: theme.fontSize.base,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  postStats: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginVertical: theme.spacing.lg,
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

export default StudyPostDetailScreen;