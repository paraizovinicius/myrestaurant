import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly user = signal<any>(null);

  constructor() {
    this.loadUser();

    supabase.auth.onAuthStateChange(
      (_event, session) => {
        this.user.set(session?.user ?? null);
      }
    );
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
    name: string
  ) {

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password
      });

    if (error) {
      throw error;
    }


    if (data.user) {

      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name
        });

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
}