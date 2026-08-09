import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  async getRestaurants() {
    const pageSize = 500;
    let from = 0;
    let allRestaurants: any[] = [];

    while (true) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name')
        .range(from, from + pageSize - 1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        break;
      }

      allRestaurants.push(...data);

      if (data.length < pageSize) {
        break;
      }

      from += pageSize;
    }

    return allRestaurants;
  }

  async getRestaurant(id: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}