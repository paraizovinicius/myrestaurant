import { inject, Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})

export class PopularReviewsService {
    private readonly profileService = inject(ProfileService);
    
    async getPopularReviews(limit: number = 10) {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                id,
                title,
                body,
                rating,
                created_at,

                profiles!reviews_user_id_fkey(
                    id,
                    name,
                    avatar_url
                ),

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
            `);

        if (error) {
            throw error;
        }

        

        const reviews = data.map(review => {
            // 1. Resolve restaurant object whether it's an array or single object
            const rawRestaurant = review.restaurants;
            const restaurantObj = Array.isArray(rawRestaurant) ? rawRestaurant[0] : rawRestaurant;

            // 2. Resolve profile object whether it's an array or single object
            const rawProfile = review.profiles;
            const profileObj = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;

            // 3. Fallbacks for array lengths
            const likesCount = review.review_likes?.length ?? 0;
            const commentsCount = review.review_comments?.length ?? 0;

            // 4. Avatar Url's
            const avatars = profileObj?.id 
                ? this.profileService.getAvatarUrlByUserId(profileObj.id) 
                : null;

            return {
                id: review.id,
                reviewer: profileObj?.name ?? 'Anonymous',
                avatar: avatars,
                restaurant: restaurantObj?.name ?? 'Anonymous',
                title: review.title,
                body: review.body,
                rating: review.rating,
                likes: likesCount,
                comments: commentsCount,
                created_at: review.created_at,
                popularity: likesCount * 2 + commentsCount,
            };
        });

        return reviews
            // Remove reviews without a meaningful title
            .filter(review =>
                review.title !== null &&
                review.title.trim() !== ''
            )

            // 1. Select the most popular reviews
            .sort((a, b) =>
                b.popularity - a.popularity
            )
            .slice(0, limit)

            // 2. Display newest among those
            .sort((a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
    }
}