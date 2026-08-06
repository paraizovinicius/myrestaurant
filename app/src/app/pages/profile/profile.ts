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
  private errorClearTimeout: ReturnType<typeof setTimeout> | null = null;
  private successClearTimeout: ReturnType<typeof setTimeout> | null = null;
  
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

      const profile = await this.profileService.getMyProfile();
      this.loading.set(false);
      this.profile.set(profile);
    } catch(error) {

      console.error(
        'Failed loading profile:',
        error
      );

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

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const userId = await this.profileService.getMyUserId();

    if (!userId) {
      this.setTimedMessage('error', 'You must be signed in to update your avatar.');
      return;
    }

    // 700 KB limit
    if (file.size > 700 * 1024) {
      this.setTimedMessage('error', 'File size exceeds 700KB limit.');
      return;
    }

    try {
      await this.profileService.updateProfileAvatar(userId, file);

      const updatedProfile = await this.profileService.getMyProfile();

      this.profile.set(updatedProfile);

      this.error.set(null);
      this.setTimedMessage('success', 'Avatar updated.');
    } catch (error) {
      console.error('Failed to upload avatar', error);
      this.setTimedMessage('error', 'Failed to upload avatar.');
    }
  }

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

        this.setTimedMessage(
          'success',
          'If an account exists for this email, a password reset link has been sent.'
        );

    } catch (error: any) {

        this.setTimedMessage(
          'error',
          error.message ?? 'Unable to send reset email.'
        );

    } finally {

        this.loading.set(false);

    }
  }

  private setTimedMessage(
    type: 'error' | 'success',
    message: string
  ): void {
    const signal = type === 'error' ? this.error : this.success;
    const timeoutRef = type === 'error' ? 'errorClearTimeout' : 'successClearTimeout';

    const currentTimeout = this[timeoutRef];

    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }

    signal.set(message);

    this[timeoutRef] = setTimeout(() => {
      signal.set(null);
      this[timeoutRef] = null;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.errorClearTimeout) {
      clearTimeout(this.errorClearTimeout);
    }

    if (this.successClearTimeout) {
      clearTimeout(this.successClearTimeout);
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