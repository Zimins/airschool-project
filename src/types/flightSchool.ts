/**
 * Flight School Type Definitions
 * Shared types for flight school data structures
 */

export interface FlightSchool {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  description: string;
  shortDescription: string;
  image?: string;
  gallery: string[];
  features: string[];
  programs: Program[];
  contact: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
}

export interface Program {
  id: string;
  name: string;
  duration: string;
  description: string;
}

export interface Review {
  id: string;
  schoolId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
}

export interface DatabaseFlightSchool {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  review_count: number;
  description: string;
  short_description: string;
  image_url?: string;
  gallery: string[];
  features: string[];
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
  contact_address?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface DatabaseProgram {
  id: string;
  flight_school_id: string;
  name: string;
  duration?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseReview {
  id: string;
  flight_school_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  content: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}