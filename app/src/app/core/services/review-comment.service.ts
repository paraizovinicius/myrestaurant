import { inject, Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewCommentService {

  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;

  async getComments(reviewId: string) {

    const { data, error } = await supabase
      .from('review_comments')
      .select('*')
      .eq('review_id', reviewId)
      .order('created_at');

    if (error) {
      throw error;
    }

    return data;
  }

  async createComment(
    reviewId: string,
    body: string
  ) {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated.');
    }

    const { error } = await supabase
      .from('review_comments')
      .insert({
        review_id: reviewId,
        user_id: this.authService.user()?.id,
        body
      });

    if (error) {
      throw error;
    }
  }

  async updateComment(
    commentId: string,
    body: string
  ) {

    const { error } = await supabase
      .from('review_comments')
      .update({
        body,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (error) {
      throw error;
    }
  }

  async deleteComment(commentId: string) {

    const { error } = await supabase
      .from('review_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw error;
    }
  }
}