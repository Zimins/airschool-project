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

interface StudyGroup {
  id: string;
  title: string;
  organizer: string;
  type: string;
  description: string;
  location: string;
  participants: number;
  maxParticipants: number;
  startDate: string;
  schedule: string;
  level: string;
}

const mockStudyGroups: StudyGroup[] = [
  {
    id: '1',
    title: 'PPL Written Test Study Group',
    organizer: 'David Kim',
    type: 'Written Test',
    description: 'Weekly study sessions for PPL written test preparation',
    location: 'Seoul',
    participants: 5,
    maxParticipants: 8,
    startDate: '2024-04-01',
    schedule: 'Every Saturday 2PM',
    level: 'Beginner',
  },
  {
    id: '2',
    title: 'Aviation English Practice',
    organizer: 'Emma Park',
    type: 'Language',
    description: 'Practice aviation phraseology and radio communications',
    location: 'Online',
    participants: 12,
    maxParticipants: 15,
    startDate: '2024-03-25',
    schedule: 'Tue & Thu 7PM',
    level: 'Intermediate',
  },
  {
    id: '3',
    title: 'CPL Navigation Study',
    organizer: 'Captain Jung',
    type: 'Navigation',
    description: 'Advanced navigation techniques for CPL students',
    location: 'Busan',
    participants: 3,
    maxParticipants: 6,
    startDate: '2024-04-10',
    schedule: 'Weekends',
    level: 'Advanced',
  },
  {
    id: '4',
    title: 'Weather & Meteorology',
    organizer: 'Lisa Chen',
    type: 'Weather',
    description: 'Understanding weather patterns for safe flying',
    location: 'Jeju',
    participants: 7,
    maxParticipants: 10,
    startDate: '2024-03-30',
    schedule: 'Mon & Wed 6PM',
    level: 'All Levels',
  },
];

const StudyBoardScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', 'Written Test', 'Language', 'Navigation', 'Weather'];

  const filteredGroups = mockStudyGroups.filter(group => {
    const matchesSearch = group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || group.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderStudyGroup = ({ item }: { item: StudyGroup }) => (
    <TouchableOpacity style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.groupType}>{item.type}</Text>
          <Text style={styles.groupLevel}>{item.level}</Text>
        </View>
        <View style={styles.participantInfo}>
          <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.participantText}>
            {item.participants}/{item.maxParticipants}
          </Text>
        </View>
      </View>
      
      <Text style={styles.groupTitle}>{item.title}</Text>
      <Text style={styles.groupDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.groupInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>{item.schedule}</Text>
        </View>
      </View>
      
      <Text style={styles.organizerText}>by {item.organizer}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
          placeholder="Search study groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.typesContainer}
        contentContainerStyle={{ paddingTop: theme.spacing.xs, paddingBottom: 0 }}
      >
        {types.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.typeText,
                selectedType === type && styles.typeTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredGroups}
        renderItem={renderStudyGroup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.groupsList}
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
    backgroundColor: theme.colors.secondaryLight,
    borderRadius: theme.borderRadius.md,
  },
  communityText: {
    color: theme.colors.secondary,
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
  typesContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  typeButton: {
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
  typeButtonActive: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  typeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  typeTextActive: {
    color: 'white',
  },
  groupsList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: 0,
  },
  groupCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  groupType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  groupLevel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  participantText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  groupTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  groupDescription: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  groupInfo: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  organizerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
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