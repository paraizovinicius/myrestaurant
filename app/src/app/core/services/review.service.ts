import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

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
}