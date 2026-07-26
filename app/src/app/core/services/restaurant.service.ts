import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  async getRestaurants() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return data;
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