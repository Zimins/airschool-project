import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fsbwbxlqzdkhapnuypxd.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const createWebStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
    };
  }
  return {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };
};

const storage = Platform.OS === 'web' ? createWebStorage() : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      flight_schools: {
        Row: {
          id: string;
          name: string;
          location: string;
          city: string;
          country: string;
          rating: number;
          review_count: number;
          description: string;
          short_description: string;
          image: string | null;
          gallery: string[];
          features: string[];
          phone: string;
          email: string;
          website: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['flight_schools']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['flight_schools']['Insert']>;
      };
      programs: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          duration: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['programs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
      };
      study_materials: {
        Row: {
          id: string;
          title: string;
          author: string;
          category: string;
          content: string;
          likes: number;
          comments: number;
          views: number;
          attachments: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['study_materials']['Row'], 'id' | 'created_at' | 'updated_at' | 'likes' | 'comments' | 'views'>;
        Update: Partial<Database['public']['Tables']['study_materials']['Insert']>;
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'super_admin';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>;
      };
    };
  };
};