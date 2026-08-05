import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly user = signal<any>(null);

  constructor() {
    this.loadUser();

    supabase.auth.onAuthStateChange(async (event, session) => {
      // Update user state for all auth events
      this.user.set(session?.user ?? null);

      // Trigger profile creation specifically when signing in
      if (event === 'SIGNED_IN' && session?.user) {
        await this.createProfileIfNeeded();
      }
    });
  }

  async loadUser() {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    this.user.set(session?.user ?? null);
  }

  async signUp(
    email: string,
    password: string,
    name: string,
    phone?: string
  ) {

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone: phone || null
          }
        }
      });

    if (error) {
      throw error;
    }

    return data;
  }

  async signIn(
    email: string,
    password: string
  ) {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw error;
    }

    return data;
  }

  async signOut() {
    await supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<void> {

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/update-password`
      }
    );

    if (error) {
      throw error;
    }
  }

  async updatePassword(password: string): Promise<void> {

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      throw error;
    }

  }

  async createProfileIfNeeded() {

    const { data: userData, error } =
      await supabase.auth.getUser();

    if (error || !userData.user) {
      throw new Error('No authenticated user.');
    }

    const user = userData.user;


    const { data: existingProfile } =
      await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();


    if (existingProfile) {
      return;
    }


    const { error: insertError } =
      await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.user_metadata['name'],
          phone: user.user_metadata['phone']
        });


    if (insertError) {
      throw insertError;
    }
  }
}