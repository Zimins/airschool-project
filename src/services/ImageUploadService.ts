import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Request permission to access media library
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web doesn't need permission
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }
  return true;
};

/**
 * Pick an image from the device
 */
export const pickImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      throw new Error('Permission to access media library is required');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9], // 16:9 aspect ratio for school thumbnails
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

/**
 * Upload image to Supabase Storage
 */
export const uploadSchoolImage = async (
  uri: string,
  schoolId: string
): Promise<ImageUploadResult> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `school_${schoolId}_${timestamp}.jpg`;
    const filePath = `schools/${fileName}`;

    // Fetch the image
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('school-images')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('school-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Delete image from Supabase Storage
 */
export const deleteSchoolImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/school-images/');
    if (urlParts.length < 2) {
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('school-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Pick and upload school image (convenience function)
 */
export const pickAndUploadSchoolImage = async (
  schoolId: string
): Promise<ImageUploadResult> => {
  const image = await pickImage();

  if (!image) {
    return {
      success: false,
      error: 'No image selected',
    };
  }

  return await uploadSchoolImage(image.uri, schoolId);
};