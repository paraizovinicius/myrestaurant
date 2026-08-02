import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class ReviewStatsService {
    async getReviewLikes(reviewIds: string[]) {
        if (reviewIds.length === 0) {
            return [];
        }

        const { data, error } = await supabase
            .from('review_likes')
            .select('*')
            .in('review_id', reviewIds);

        if (error) {
            throw error;
        }

        return data;
    }

    async getReviewLikesByReviewId(reviewId: string) {
        const { data, error } = await supabase
            .from('review_likes')
            .select('*')
            .eq('review_id', reviewId);

        if (error) {
            throw error;
        }

        return data;
    }

    async getReviewComments(reviewIds: string[]) {
        if (reviewIds.length === 0) {
            return [];
        }

        const { data, error } = await supabase
            .from('review_comments')
            .select('*')
            .in('review_id', reviewIds);

        if (error) {
            throw error;
        }

        return data;
    }

    async getReviewCommentsByReviewId(reviewId: string) {
        const { data, error } = await supabase
            .from('review_comments')
            .select('*')
            .eq('review_id', reviewId);

        if (error) {
            throw error;
        }

        return data;
    }
}
