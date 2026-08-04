import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class PriceLevelService {

  async getVotesForRestaurants(restaurantIds: string[]) {
    if (restaurantIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('restaurant_price_votes')
        .select('restaurant_id, price_level')
        .in('restaurant_id', restaurantIds);

    if (error) {
        throw error;
    }

    return data;
    }

  async getPriceSummary(restaurantIds: string[]) {
    if (restaurantIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('restaurant_price_summary')
        .select('restaurant_id, price_level, vote_count')
        .in('restaurant_id', restaurantIds);

    if (error) {
        throw error;
    }

    return data;
    }

  async voteForPriceLevel(
    restaurantId: string,
    userId: string,
    priceLevel: number
    ): Promise<void> {

    const { error } = await supabase
        .from('restaurant_price_votes')
        .upsert(
        {
            restaurant_id: restaurantId,
            user_id: userId,
            price_level: priceLevel
        },
        {
            onConflict: 'restaurant_id,user_id'
        }
        );

    if (error) {
        throw error;
    }
  }

  async getUserVote(
    restaurantId: string,
    userId: string
    ): Promise<number | null> {

    const { data, error } = await supabase
        .from('restaurant_price_votes')
        .select('price_level')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data?.price_level ?? null;
    }

  async deleteVoteForPriceLevel(restaurantId: string, userId: string) {
    const { data, error } = await supabase
        .from('restaurant_price_votes')
        .delete()
        .eq('restaurant_id', restaurantId)
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return data;
  }
}