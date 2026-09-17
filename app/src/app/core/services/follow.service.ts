import { inject, Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { FollowedUser } from '../../pages/user-profile/types';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  async follow(targetUserId: string): Promise<void> {

    const currentUserId = this.authService.user()?.id;

    if (!currentUserId) {
      throw new Error('User not authenticated.');
    }

    if (currentUserId === targetUserId) {
      throw new Error('You cannot follow yourself.');
    }

    const { error } = await supabase
      .from('followers')
      .upsert(
        {
          user_id_1: currentUserId,
          user_id_2: targetUserId
        },
        {
          onConflict: 'user_id_1,user_id_2'
        }
      );

    if (error) {
      throw error;
    }
  }

  async unfollow(targetUserId: string): Promise<void> {

    const currentUserId = this.authService.user()?.id;

    if (!currentUserId) {
      throw new Error('User not authenticated.');
    }

    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('user_id_1', currentUserId)
      .eq('user_id_2', targetUserId);

    if (error) {
      throw error;
    }
  }

  async isFollowing(targetUserId: string): Promise<boolean> {

    const currentUserId = this.authService.user()?.id;

    if (!currentUserId) {
      return false;
    }

    const { data } = await supabase
      .from('followers')
      .select('user_id_1')
      .eq('user_id_1', currentUserId)
      .eq('user_id_2', targetUserId)
      .maybeSingle();

    return !!data;
  }

  async getFollowerCount(userId: string): Promise<number> {

    const { count, error } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id_2', userId);

    if (error) {
      throw error;
    }

    return count ?? 0;
  }

  async getFollowingCount(userId: string): Promise<number> {

    const { count, error } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id_1', userId);

    if (error) {
      throw error;
    }

    return count ?? 0;
  }

  async getFollowing(userId: string): Promise<FollowedUser[]> {

    const { data, error } = await supabase
      .from('followers')
      .select(`
        user_id_2,
        profiles!followers_user_id_2_fkey(
          id,
          name
        )
      `)
      .eq('user_id_1', userId);

    if (error) {
      throw error;
    }

    return this.mapFollowedUsers(data ?? [], (row) => row.user_id_2, (row) => row.profiles);
  }

  async getFollowers(userId: string): Promise<FollowedUser[]> {

    const { data, error } = await supabase
      .from('followers')
      .select(`
        user_id_1,
        profiles!followers_user_id_1_fkey(
          id,
          name
        )
      `)
      .eq('user_id_2', userId);

    if (error) {
      throw error;
    }

    return this.mapFollowedUsers(data ?? [], (row) => row.user_id_1, (row) => row.profiles);
  }

  private mapFollowedUsers<T>(
    rows: T[],
    getFallbackId: (row: T) => string,
    getProfile: (row: T) => { id: string; name: string | null } | { id: string; name: string | null }[] | null
  ): FollowedUser[] {

    return rows.map((row) => {
      const rawProfile = getProfile(row);
      const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
      const id = profile?.id ?? getFallbackId(row);

      return {
        id,
        fullName: profile?.name ?? 'Anonymous user',
        avatarUrl: this.profileService.getAvatarUrlByUserId(id, Date.now())
      };
    });
  }
}
