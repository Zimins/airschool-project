import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { supabase } from '../../lib/supabase';
import { US_STATES } from '../../data/usStates';

interface School {
  id: string;
  name: string;
  location: string;
  city: string;
  state?: string;
  country: string;
  rating?: number;
  review_count?: number;
  description?: string;
  short_description?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
  image_url?: string;
}

const SchoolsManagementScreen = ({ onBack }: { onBack: () => void }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [stateDropdownVisible, setStateDropdownVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<School>>({
    name: '',
    location: '',
    city: '',
    state: '',
    country: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    contact_website: '',
  });


  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flight_schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      Alert.alert('Error', 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = () => {
    setEditingSchool(null);
    setFormData({
      name: '',
      location: '',
      city: '',
      state: '',
      country: '',
      description: '',
      contact_email: '',
      contact_phone: '',
      contact_website: '',
    });
    setModalVisible(true);
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      location: school.location,
      city: school.city,
      country: school.country,
      description: school.description || '',
      contact_email: school.contact_email || '',
      contact_phone: school.contact_phone || '',
      contact_website: school.contact_website || '',
      state: school.state || '',
    });
    setModalVisible(true);
  };

  const deleteSchool = async (schoolId: string) => {
    try {
      const { error } = await supabase
        .from('flight_schools')
        .delete()
        .eq('id', schoolId);

      if (error) throw error;

      if (Platform.OS === 'web') {
        window.alert('School deleted successfully');
      } else {
        Alert.alert('Success', 'School deleted successfully');
      }
      fetchSchools();
    } catch (error) {
      console.error('Error deleting school:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to delete school');
      } else {
        Alert.alert('Error', 'Failed to delete school');
      }
    }
  };

  const handleDeleteSchool = (schoolId: string, schoolName: string) => {
    const message = `Are you sure you want to delete "${schoolName}"? This action cannot be undone.`;

    // Alert.alert button callbacks do not fire on react-native-web, so use
    // window.confirm there (same pattern as ProfileMenu).
    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        deleteSchool(schoolId);
      }
      return;
    }

    Alert.alert('Delete School', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSchool(schoolId) },
    ]);
  };

  const handleSaveSchool = async () => {
    // Validation
    if (!formData.name || !formData.city || !formData.country) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Name, City, Country)');
      return;
    }

    try {
      if (editingSchool) {
        // Update existing school
        const { error } = await supabase
          .from('flight_schools')
          .update({
            name: formData.name,
            location: `${formData.city}, ${formData.country}`,
            city: formData.city,
            state: formData.state?.trim() || null,
            country: formData.country,
            description: formData.description || null,
            contact_email: formData.contact_email?.trim() || null,
            contact_phone: formData.contact_phone?.trim() || null,
            contact_website: formData.contact_website?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSchool.id);

        if (error) throw error;
        Alert.alert('Success', 'School updated successfully');
      } else {
        // Create new school
        const { error } = await supabase.from('flight_schools').insert({
          name: formData.name,
          location: `${formData.city}, ${formData.country}`,
          city: formData.city,
          state: formData.state?.trim() || null,
          country: formData.country,
          description: formData.description || null,
          contact_email: formData.contact_email?.trim() || null,
          contact_phone: formData.contact_phone?.trim() || null,
          contact_website: formData.contact_website?.trim() || null,
          rating: 0,
          review_count: 0,
        });

        if (error) throw error;
        Alert.alert('Success', 'School created successfully');
      }

      setModalVisible(false);
      fetchSchools();
    } catch (error) {
      console.error('Error saving school:', error);
      Alert.alert('Error', 'Failed to save school');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Flight Schools Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSchool}>
          <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.content}>
          {schools.length === 0 ? (
            <Text style={styles.emptyText}>No schools found</Text>
          ) : (
            schools.map((school) => (
              <View key={school.id} style={styles.schoolCard}>
                <View style={styles.schoolInfo}>
                  <Text style={styles.schoolName}>{school.name}</Text>
                  <Text style={styles.schoolLocation}>
                    <Ionicons name="location" size={14} /> {school.city}, {school.country}
                  </Text>
                  <Text style={styles.schoolStats}>
                    Rating: {school.rating || 0} | Reviews: {school.review_count || 0}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditSchool(school)}
                  >
                    <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSchool(school.id, school.name)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSchool ? 'Edit School' : 'Add New School'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>School Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter school name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Enter city"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={styles.label}>Country *</Text>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
                placeholder="Enter country"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={styles.label}>US State</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setStateDropdownVisible(true)}
              >
                <Text style={formData.state ? styles.dropdownTriggerText : styles.dropdownPlaceholder}>
                  {formData.state || 'Select a US state (optional)'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter description"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Contact Email</Text>
              <TextInput
                style={styles.input}
                value={formData.contact_email}
                onChangeText={(text) => setFormData({ ...formData, contact_email: text })}
                placeholder="Enter email"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.contact_phone}
                onChangeText={(text) => setFormData({ ...formData, contact_phone: text })}
                placeholder="Enter phone number"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={formData.contact_website}
                onChangeText={(text) => setFormData({ ...formData, contact_website: text })}
                placeholder="Enter website URL"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveSchool}
              >
                <Text style={styles.saveButtonText}>
                  {editingSchool ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* US State picker */}
      <Modal
        visible={stateDropdownVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setStateDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStateDropdownVisible(false)}
        >
          <View style={styles.stateModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select US State</Text>
              <TouchableOpacity onPress={() => setStateDropdownVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.stateList}>
              <TouchableOpacity
                style={styles.stateOption}
                onPress={() => {
                  setFormData({ ...formData, state: '' });
                  setStateDropdownVisible(false);
                }}
              >
                <Text style={styles.stateOptionPlaceholder}>None (not a US state)</Text>
                {!formData.state && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
              {US_STATES.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={styles.stateOption}
                  onPress={() => {
                    setFormData({ ...formData, state });
                    setStateDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.stateOptionText,
                      formData.state === state && styles.stateOptionTextSelected,
                    ]}
                  >
                    {state}
                  </Text>
                  {formData.state === state && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: theme.colors.white,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: 50,
    fontSize: 16,
  },
  schoolCard: {
    backgroundColor: theme.colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 5,
  },
  schoolLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 3,
  },
  schoolStats: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  editButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 12,
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
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // State dropdown styles
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: theme.colors.white,
  },
  dropdownTriggerText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  stateModalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  stateList: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  stateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  stateOptionText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  stateOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  stateOptionPlaceholder: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default SchoolsManagementScreen;