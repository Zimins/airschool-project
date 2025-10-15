/**
 * Flight School Data Service
 * Handles all flight school related API calls to Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FlightSchool, Program, Review } from '../types/flightSchool';

export class FlightSchoolService {
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
   * Get all flight schools
   */
  async getAllFlightSchools(): Promise<FlightSchool[]> {
    try {
      const { data, error } = await this.supabase
        .from('flight_schools')
        .select(
          `
          *,
          programs (*)
        `,
        )
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching flight schools:', error.message);
        throw new Error(`Database error: ${error.message}`);
      }

      return this.formatFlightSchoolsData(data || []);
    } catch (error) {
      console.error('Flight schools service error:', error);
      throw error;
    }
  }

  /**
   * Search flight schools
   */
  async searchFlightSchools(query: string): Promise<FlightSchool[]> {
    if (!query.trim()) {
      return this.getAllFlightSchools();
    }

    try {
      const { data, error } = await this.supabase.rpc('search_flight_schools', { search_query: query });

      if (error) {
        console.error('Error searching flight schools:', error.message);
        throw new Error(`Search failed: ${error.message}`);
      }

      return this.formatFlightSchoolsData(data || []);
    } catch (error) {
      console.error('Search service error:', error);
      throw error;
    }
  }

  /**
   * Get flight school by ID
   */
  async getFlightSchoolById(id: string): Promise<FlightSchool | null> {
    try {
      const { data, error } = await this.supabase
        .from('flight_schools')
        .select(
          `
          *,
          programs (*)
        `,
        )
        .eq('id', id)
        // .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching flight school:', error.message);
        throw new Error(`Failed to fetch school: ${error.message}`);
      }

      const formatted = this.formatFlightSchoolsData([data]);
      return formatted[0] || null;
    } catch (error) {
      console.error('Flight school service error:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a flight school
   */
  async getReviewsForSchool(schoolId: string): Promise<Review[]> {
    try {
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await this.supabase
        .from('reviews')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError.message);
        throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
      }

      // Fetch profiles for each user_id
      const userIds = [...new Set(reviewsData?.map(r => r.user_id).filter(Boolean))];

      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await this.supabase
          .from('profiles')
          .select('id, nickname')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Merge reviews with profile data
      const reviewsWithProfiles = reviewsData?.map(review => ({
        ...review,
        profiles: profilesMap[review.user_id] || null,
      }));

      return this.formatReviewsData(reviewsWithProfiles || []);
    } catch (error) {
      console.error('Reviews service error:', error);
      throw error;
    }
  }

  /**
   * Add a new review
   */
  async addReview(
    schoolId: string,
    userId: string,
    userName: string,
    rating: number,
    title: string,
    content: string,
  ): Promise<Review | null> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .insert([
          {
            flight_school_id: schoolId,
            user_id: userId,
            user_name: userName,
            user_avatar: `https://i.pravatar.cc/150?u=${userName}`,
            rating,
            title,
            content,
            helpful_count: 0,
          },
        ])
        .select(
          `
          *,
          profiles!user_id (
            nickname
          )
        `,
        )
        .single();

      if (error) {
        console.error('Error adding review:', error.message);
        throw new Error('Failed to add review');
      }

      return this.formatReviewsData([data])[0];
    } catch (error) {
      console.error('Add review service error:', error);
      throw error;
    }
  }

  /**
   * Format flight schools data from database to app format
   */
  private formatFlightSchoolsData(data: any[]): FlightSchool[] {
    return data.map(school => ({
      id: school.id,
      name: school.name,
      location: school.location,
      city: school.city,
      country: school.country,
      rating: school.rating,
      reviewCount: school.review_count,
      description: school.description,
      shortDescription: school.short_description,
      image: school.image_url,
      gallery: school.gallery || [],
      features: school.features || [],
      programs: (school.programs || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        duration: p.duration,
        description: p.description,
      })),
      contact: {
        phone: school.contact_phone || '',
        email: school.contact_email || '',
        website: school.contact_website || '',
        address: school.contact_address || '',
      },
    }));
  }

  /**
   * Format reviews data from database to app format
   */
  private formatReviewsData(data: any[]): Review[] {
    return data.map(review => {
      // Use nickname from profiles if available, otherwise fall back to user_name
      const displayName = review.profiles?.nickname || review.user_name || 'Anonymous';

      return {
        id: review.id,
        schoolId: review.flight_school_id,
        userName: displayName,
        userAvatar: review.user_avatar,
        rating: review.rating,
        title: review.title,
        content: review.content,
        date: new Date(review.created_at).toISOString().split('T')[0],
        helpful: review.helpful_count,
      };
    });
  }

  /**
   * Check if database tables exist and have data
   */
  async isDatabaseReady(): Promise<boolean> {
    try {
      const { count, error } = await this.supabase.from('flight_schools').select('*', { count: 'exact', head: true });

      return !error && count !== null && count > 0;
    } catch {
      return false;
    }
  }
}
