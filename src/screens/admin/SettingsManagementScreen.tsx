import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { AppSettingsService, AppSetting } from '../../services/AppSettingsService';
import { useAppSettings } from '../../context/AppSettingsContext';

interface SettingsManagementScreenProps {
  onBack: () => void;
}

const SettingsManagementScreen: React.FC<SettingsManagementScreenProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});
  const [appSettingsService] = useState(() => new AppSettingsService());
  const { refreshSettings } = useAppSettings();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const fetchedSettings = await appSettingsService.getAllSettings();
      setSettings(fetchedSettings);

      // Initialize edited values
      const initialValues: { [key: string]: string } = {};
      fetchedSettings.forEach((setting) => {
        initialValues[setting.setting_key] = setting.setting_value;
      });
      setEditedValues(initialValues);
    } catch (error) {
      console.error('Error loading settings:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to load settings. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to load settings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let hasError = false;

      // Update each changed setting
      for (const setting of settings) {
        if (editedValues[setting.setting_key] !== setting.setting_value) {
          const success = await appSettingsService.updateSetting(
            setting.setting_key,
            editedValues[setting.setting_key]
          );

          if (!success) {
            hasError = true;
            break;
          }
        }
      }

      if (hasError) {
        if (Platform.OS === 'web') {
          window.alert('Failed to save some settings. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to save some settings. Please try again.');
        }
      } else {
        // Refresh the global settings context
        await refreshSettings();

        if (Platform.OS === 'web') {
          window.alert('Settings saved successfully! Changes will appear throughout the app.');
        } else {
          Alert.alert('Success', 'Settings saved successfully! Changes will appear throughout the app.');
        }

        // Reload to show updated values
        await loadSettings();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to save settings. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save settings. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const hasChanges = () => {
    return settings.some(
      (setting) => editedValues[setting.setting_key] !== setting.setting_value
    );
  };

  const getSettingLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      app_name: 'App Name',
      app_tagline: 'App Tagline',
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Changes made here will be reflected throughout the application after saving.
          </Text>
        </View>

        {settings.map((setting) => (
          <View key={setting.id} style={styles.settingCard}>
            <Text style={styles.settingLabel}>{getSettingLabel(setting.setting_key)}</Text>
            {setting.description && (
              <Text style={styles.settingDescription}>{setting.description}</Text>
            )}
            <TextInput
              style={styles.input}
              value={editedValues[setting.setting_key] || ''}
              onChangeText={(value) => handleChange(setting.setting_key, value)}
              placeholder={`Enter ${getSettingLabel(setting.setting_key).toLowerCase()}`}
              placeholderTextColor={theme.colors.textSecondary}
            />
            {setting.updated_at && (
              <Text style={styles.updateInfo}>
                Last updated: {new Date(setting.updated_at).toLocaleString()}
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveButton, (!hasChanges() || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges() || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
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
    backgroundColor: theme.colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '10',
    padding: 16,
    borderRadius: theme.borderRadius.md,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  settingCard: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
    ...theme.shadow.sm,
  },
  settingLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  updateInfo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsManagementScreen;
