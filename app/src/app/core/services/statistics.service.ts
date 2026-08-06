import { inject, Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { CommunityStatistics } from '../../pages/home/types';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

    async getCommunityStatistics(): Promise<CommunityStatistics> {
        const [
            restaurants,
            reviews,
            members,
            priceVotes
        ] = await Promise.all([
            supabase
                .from('restaurants')
                .select('*', {
                    count: 'exact',
                    head: true
                }),
            supabase
                .from('reviews')
                .select('*', {
                    count: 'exact',
                    head: true
                }),
            supabase
                .from('profiles')
                .select('*', {
                    count: 'exact',
                    head: true
                }),
            supabase
                .from('restaurant_price_votes')
                .select('*', {
                    count: 'exact',
                    head: true
                })
        ]) as Array<{ count?: number | null }>;

        return {
            restaurants: restaurants.count ?? 0,
            reviews: reviews.count ?? 0,
            members: members.count ?? 0,
            priceVotes: priceVotes.count ?? 0
        };
    }
}