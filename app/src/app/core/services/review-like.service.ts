import { inject, Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewLikeService {


  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;


  async likeReview(reviewId: string): Promise<void> {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated.');
    }

    const { error } = await supabase
      .from('review_likes')
      .upsert(
        {
          review_id: reviewId,
          user_id: this.authService.user()?.id
        },
        {
          onConflict: 'review_id,user_id'
        }
      );

    if (error) {
      throw error;
    }
  }

  async unlikeReview(reviewId: string): Promise<void> {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated.');
    }

    const { error } = await supabase
      .from('review_likes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', this.authService.user()?.id);

    if (error) {
      throw error;
    }
  }

  async getLikes(reviewId: string) {

    const { data, error } = await supabase
      .from('review_likes')
      .select('user_id')
      .eq('review_id', reviewId);

    if (error) {
      throw error;
    }

    return data;
  }

  async hasLiked(reviewId: string): Promise<boolean> {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data } = await supabase
      .from('review_likes')
      .select('review_id')
      .eq('review_id', reviewId)
      .eq('user_id', this.authService.user()?.id)
      .maybeSingle();

    return !!data;
  }
}