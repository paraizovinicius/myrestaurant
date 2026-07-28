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
}