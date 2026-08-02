import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { UserProfile } from './types';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})

export class ProfilePage {

  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  
  protected readonly user = this.authService.user;
  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly success = signal<string | null>(null);

  protected editingAddress = signal(false);

  protected address = '';
  protected zipcode = '';
  protected city = '';
  protected country = '';

  protected readonly isLoggedIn = computed(() => !!this.user());

  async ngOnInit(): Promise<void> {
    try {

      const profile =
        await this.profileService.getMyProfile();

      this.profile.set(profile);

    } catch(error) {

      console.error(
        'Failed loading profile:',
        error
      );

    } finally {

      this.loading.set(false);

    }

  }

  protected readonly welcomeMessage = computed(() => {
    const profile = this.profile();

    if (!profile) {
      return '';
    }

    const firstName =
      profile.fullName.split(' ')[0];

    return `Welcome, ${firstName}.`;

  });

  startEditingAddress() {
    const profile = this.profile();

    if (!profile) return;

    this.address = profile.address ?? '';
    this.zipcode = profile.zipcode ?? '';
    this.city = profile.city ?? '';
    this.country = profile.country ?? '';

    this.editingAddress.set(true);
  }

  async saveAddress() {

    try {

      await this.profileService.updateProfile({
        address: this.address,
        zipcode: this.zipcode,
        city: this.city,
        country: this.country
      });


      const currentProfile = this.profile();

      if (currentProfile) {

        this.profile.set({
          ...currentProfile,
          address: this.address,
          zipcode: this.zipcode,
          city: this.city,
          country: this.country
        });

      }


      this.editingAddress.set(false);

    } catch (error) {

      console.error(
        'Failed updating address:',
        error
      );

    }

  }

  protected logout(): void {
    this.authService.signOut();
  }

  async sendResetPassword(): Promise<void> {

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {

        await this.authService.resetPassword(this.profile()?.email ?? '');

        this.success.set(
        'If an account exists for this email, a password reset link has been sent.'
        );

    } catch (error: any) {

        this.error.set(
        error.message ?? 'Unable to send reset email.'
        );

    } finally {

        this.loading.set(false);

    }
  }

  protected dateFormat(date: string | null | undefined): string {
    if (!date) {
      return '';
    }
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}