import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { UserProfile } from '../../pages/profile/types';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {


  async getMyProfile(): Promise<UserProfile | null> {

    const {
      data: userData,
      error: userError
    } = await supabase.auth.getUser();


    if (userError || !userData.user) {
      return null;
    }


    const userId = userData.user.id;


    const {
      data,
      error
    } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();


    if (error) {
      throw error;
    }


    return {
      id: data.id,

      fullName: data.name,
      email: userData.user.email,
      phone: data.phone,

      city: data.city,
      country: data.country,
      address: data.address,
      zipcode: data.zipcode,

      loyaltyTier: data.loyalty_tier,

      memberSince: data.created_at
    };

  }

  async getMyUserId(): Promise<string | null> {

    const {
      data: userData,
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return null;
    }

    return userData.user?.id ?? null;

  }

  async updateProfile(profile: Partial<UserProfile>): Promise<void> {

    const {
      data: userData,
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const userId = userData.user.id;

    const {
      error
    } = await supabase
      .from('profiles')
      .update({
        name: profile.fullName,
        phone: profile.phone,
        city: profile.city,
        country: profile.country,
        address: profile.address,
        zipcode: profile.zipcode,
        loyalty_tier: profile.loyaltyTier
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

  }

}