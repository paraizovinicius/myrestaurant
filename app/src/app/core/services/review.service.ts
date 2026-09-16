import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { UserReviewSummary } from '../../pages/profile/types';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  async getReviewsForRestaurant(restaurantId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  async getReviewsRates(restaurantIds: string[]) {
    if (restaurantIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('restaurant_id, rating')
      .in('restaurant_id', restaurantIds);

    if (error) {
      throw error;
    }

    return data;
  }

  async getReview(id: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getReviewsByUser(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  async getReviewsWithRestaurantByUser(userId: string): Promise<UserReviewSummary[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        restaurant_id,
        rating,
        title,
        body,
        created_at,

        restaurants!reviews_restaurant_id_fkey(
          id,
          name
        ),

        review_likes(
          user_id
        ),

        review_comments(
          id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((review) => {
      const rawRestaurant = review.restaurants;
      const restaurantObj = Array.isArray(rawRestaurant) ? rawRestaurant[0] : rawRestaurant;

      return {
        id: review.id,
        restaurantId: review.restaurant_id,
        restaurantName: restaurantObj?.name ?? 'Unknown restaurant',
        rating: review.rating,
        title: review.title,
        body: review.body,
        createdAt: review.created_at,
        likes: review.review_likes?.length ?? 0,
        comments: review.review_comments?.length ?? 0
      };
    });
  }

  async createReview(
    restaurantId: string,
    userId: string,
    rating: number,
    title: string | null,
    body: string | null,
    visitedAt: string | null
  ) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        restaurant_id: restaurantId,
        user_id: userId,
        rating,
        title,
        body,
        visited_at: visitedAt
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteReview(reviewId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateReview(
    reviewId: string,
    rating: number,
    title: string | null,
    body: string | null,
    visitedAt: string | null
  ) {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        title,
        body,
        visited_at: visitedAt
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}