/**
 * App Settings Service
 * Manages application-wide settings like app name, tagline, etc.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface AppSettings {
  app_name: string;
  app_tagline: string;
}

export class AppSettingsService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Check environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Get all app settings as a key-value object
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const { data, error } = await this.supabase
        .from('app_settings')
        .select('*');

      if (error) {
        console.error('Error fetching app settings:', error);
        // Return defaults if fetch fails
        return {
          app_name: 'PreflightSchool',
          app_tagline: 'Start your flight dream',
        };
      }

      // Convert array to key-value object
      const settings: any = {};
      data?.forEach((setting: AppSetting) => {
        settings[setting.setting_key] = setting.setting_value;
      });

      return {
        app_name: settings.app_name || 'PreflightSchool',
        app_tagline: settings.app_tagline || 'Start your flight dream',
      };
    } catch (error) {
      console.error('Error in getSettings:', error);
      return {
        app_name: 'PreflightSchool',
        app_tagline: 'Start your flight dream',
      };
    }
  }

  /**
   * Get a specific setting by key
   */
  async getSetting(key: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .single();

      if (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return null;
      }

      return data?.setting_value || null;
    } catch (error) {
      console.error(`Error in getSetting for ${key}:`, error);
      return null;
    }
  }

  /**
   * Update a setting (admin only)
   */
  async updateSetting(key: string, value: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('app_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) {
        console.error(`Error updating setting ${key}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error in updateSetting for ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all settings as array (for admin management)
   */
  async getAllSettings(): Promise<AppSetting[]> {
    try {
      const { data, error } = await this.supabase
        .from('app_settings')
        .select('*')
        .order('setting_key');

      if (error) {
        console.error('Error fetching all settings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSettings:', error);
      return [];
    }
  }
}
