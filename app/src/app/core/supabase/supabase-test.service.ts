import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root'
})
export class SupabaseTestService {

  async getRestaurants() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return data;
  }
}