import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../styles/theme';

interface StudyPost {
  id: string;
  title: string;
  author: string;
  category: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  views: number;
  attachments?: number;
}

const mockStudyPosts: StudyPost[] = [
  {
    id: '1',
    title: 'PPL Written Test Complete Study Guide',
    author: 'David Kim',
    category: 'Written Test',
    content: 'Comprehensive study guide covering all topics for PPL written test. Includes practice questions and detailed explanations.',
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

const StudyBoardScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Written Test', 'Language', 'Navigation', 'Weather', 'Aircraft'];

  const filteredPosts = mockStudyPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderPost = ({ item }: { item: StudyPost }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => router.push({
        pathname: '/study-post/[id]',
        params: { id: item.id }
      })}
    >
      <View style={styles.postHeader}>
        <Text style={styles.postCategory}>{item.category}</Text>
        <Text style={styles.postDate}>{item.createdAt}</Text>
      </View>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.postAuthor}>by {item.author}</Text>
        <View style={styles.postStats}>
          {item.attachments && (
            <View style={styles.statItem}>
              <Ionicons name="attach" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{item.attachments}</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Board</Text>
        <TouchableOpacity 
          style={styles.communityButton}
          onPress={() => router.push('/community')}
        >
          <Text style={styles.communityText}>Community</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search study materials..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
        contentContainerStyle={{ paddingTop: theme.spacing.xs, paddingBottom: 0 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsList}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
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
  communityButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
  },
  communityText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  postsList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: 0,
  },
  postCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
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
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  postContent: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postAuthor: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  postStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.lg,
  },
});

export default StudyBoardScreen;