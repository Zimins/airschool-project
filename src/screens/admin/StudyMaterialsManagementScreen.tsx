import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { createClient } from '@supabase/supabase-js';

interface StudyMaterial {
  id: string;
  title: string;
  author: string;
  category: string;
  content: string;
  created_at: string;
  likes?: number;
  comments?: number;
  views?: number;
  attachments?: number;
}

interface StudyMaterialsManagementScreenProps {
  onBack: () => void;
}

const StudyMaterialsManagementScreen: React.FC<StudyMaterialsManagementScreenProps> = ({ onBack }) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Written Test',
    content: '',
    attachments: 0,
  });

  const categories = ['Written Test', 'Language', 'Navigation', 'Weather', 'Aircraft', 'Other'];

  // Initialize Supabase client
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching materials:', error);
        Alert.alert('Error', 'Failed to load study materials');
        return;
      }

      setMaterials(data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim() || !formData.author.trim() || !formData.content.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        // Update existing material
        const { error } = await supabase
          .from('study_materials')
          .update({
            title: formData.title,
            author: formData.author,
            category: formData.category,
            content: formData.content,
            attachments: formData.attachments,
          })
          .eq('id', editingId);

        if (error) throw error;
        Alert.alert('Success', 'Study material updated successfully');
      } else {
        // Create new material
        const { error } = await supabase
          .from('study_materials')
          .insert([{
            title: formData.title,
            author: formData.author,
            category: formData.category,
            content: formData.content,
            attachments: formData.attachments,
            likes: 0,
            comments: 0,
            views: 0,
          }]);

        if (error) throw error;
        Alert.alert('Success', 'Study material created successfully');
      }

      // Reset form and refresh list
      setFormData({ title: '', author: '', category: 'Written Test', content: '', attachments: 0 });
      setShowForm(false);
      setEditingId(null);
      fetchMaterials();
    } catch (error: any) {
      console.error('Error saving material:', error);
      Alert.alert('Error', error.message || 'Failed to save study material');
    }
  };

  const handleEdit = (material: StudyMaterial) => {
    setFormData({
      title: material.title,
      author: material.author,
      category: material.category,
      content: material.content,
      attachments: material.attachments || 0,
    });
    setEditingId(material.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this study material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('study_materials')
                .delete()
                .eq('id', id);

              if (error) throw error;
              Alert.alert('Success', 'Study material deleted successfully');
              fetchMaterials();
            } catch (error: any) {
              console.error('Error deleting material:', error);
              Alert.alert('Error', 'Failed to delete study material');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setFormData({ title: '', author: '', category: 'Written Test', content: '', attachments: 0 });
    setShowForm(false);
    setEditingId(null);
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || material.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Study Materials Management</Text>
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'All' && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === 'All' && styles.categoryChipTextActive,
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.formOverlay}>
          <ScrollView style={styles.formModal} showsVerticalScrollIndicator={false}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingId ? 'Edit Study Material' : 'Add New Study Material'}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter material title"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Author *</Text>
              <TextInput
                style={styles.input}
                value={formData.author}
                onChangeText={(text) => setFormData({ ...formData, author: text })}
                placeholder="Enter author name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryGrid}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.categoryButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category })}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.categoryButtonTextActive,
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Content *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                placeholder="Enter material content"
                multiline
                numberOfLines={6}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Number of Attachments</Text>
              <TextInput
                style={styles.input}
                value={formData.attachments.toString()}
                onChangeText={(text) => setFormData({ ...formData, attachments: parseInt(text) || 0 })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>
                  {editingId ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Materials List */}
      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
        ) : filteredMaterials.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No study materials found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your filters'
                : 'Create your first study material'}
            </Text>
          </View>
        ) : (
          filteredMaterials.map((material) => (
            <View key={material.id} style={styles.materialCard}>
              <View style={styles.materialHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{material.category}</Text>
                </View>
                <View style={styles.materialActions}>
                  <TouchableOpacity
                    onPress={() => handleEdit(material)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(material.id)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.materialTitle}>{material.title}</Text>
              <Text style={styles.materialAuthor}>By {material.author}</Text>
              <Text style={styles.materialContent} numberOfLines={2}>
                {material.content}
              </Text>

              <View style={styles.materialFooter}>
                <View style={styles.materialStats}>
                  <Ionicons name="eye-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.statText}>{material.views || 0}</Text>

                  <Ionicons name="heart-outline" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 12 }} />
                  <Text style={styles.statText}>{material.likes || 0}</Text>

                  <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 12 }} />
                  <Text style={styles.statText}>{material.comments || 0}</Text>

                  {material.attachments && material.attachments > 0 && (
                    <>
                      <Ionicons name="attach-outline" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 12 }} />
                      <Text style={styles.statText}>{material.attachments}</Text>
                    </>
                  )}
                </View>
                <Text style={styles.materialDate}>
                  {new Date(material.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 12,
  },
  addButton: {
    padding: 4,
  },
  searchSection: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.text,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  categoryChipTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  materialCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  materialActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  materialAuthor: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  materialContent: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  materialStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  materialDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  // Form styles
  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formModal: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      maxWidth: 600,
    }),
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  categoryButtonTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  submitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

export default StudyMaterialsManagementScreen;