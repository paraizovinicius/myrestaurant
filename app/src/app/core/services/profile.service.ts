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

    const avatarUrl = this.getAvatarUrlByUserId(userId, Date.now());

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
      avatarUrl: avatarUrl,
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

  async getProfilesByIds(userIds: string[]): Promise<Array<{ id: string; name: string | null; loyalty_tier: string | null }>> {
    if (userIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, loyalty_tier')
      .in('id', userIds);

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  getAvatarUrlByUserId(userId: string, timestamp?: number): string {
    // Always use a fixed file name or extension (e.g., avatar.png or avatar)
    const filePath = `${userId}/avatar.png`; 
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return timestamp ? `${data.publicUrl}?t=${timestamp}` : data.publicUrl;
  }

  async updateProfileAvatar(userId: string, avatarFile: File): Promise<void> {
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    // 1. Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true, cacheControl: '0' });

    if (uploadError) throw uploadError;

    // 2. Get public URL with cache-busting query parameter
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

  }

}