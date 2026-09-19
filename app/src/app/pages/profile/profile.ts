import { CommonModule } from '@angular/common';
import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { UserProfile, UserReviewSummary } from './types';
import { FollowedUser } from '../user-profile/types';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ReviewService } from '../../core/services/review.service';
import { FollowService } from '../../core/services/follow.service';
import { GoogleMapsService } from '../../core/services/google-maps.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type FollowTab = 'followers' | 'following';
type AddressAutocompleteState = 'loading' | 'ready' | 'error';


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
  private readonly reviewService = inject(ReviewService);
  private readonly followService = inject(FollowService);
  private readonly googleMapsService = inject(GoogleMapsService);
  private errorClearTimeout: ReturnType<typeof setTimeout> | null = null;
  private successClearTimeout: ReturnType<typeof setTimeout> | null = null;
  private addressAutocompleteElement: google.maps.places.PlaceAutocompleteElement | null = null;

  protected readonly user = this.authService.user;
  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly myReviews = signal<UserReviewSummary[]>([]);
  protected readonly reviewsLoading = signal(true);
  protected readonly followers = signal<FollowedUser[]>([]);
  protected readonly following = signal<FollowedUser[]>([]);
  protected readonly followListsLoading = signal(true);
  protected readonly activeFollowTab = signal<FollowTab>('followers');
  protected readonly followerCount = computed(() => this.followers().length);
  protected readonly followingCount = computed(() => this.following().length);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly success = signal<string | null>(null);

  protected editingAddress = signal(false);
  protected readonly addressAutocompleteContainer = viewChild<ElementRef<HTMLDivElement>>('addressAutocompleteContainer');
  protected readonly addressAutocompleteState = signal<AddressAutocompleteState>('loading');
  protected readonly addressAutocompleteError = signal<string | null>(null);
  protected readonly addressSelected = signal(false);
  protected readonly selectedAddressPreview = signal('');

  protected address = '';
  protected zipcode = '';
  protected city = '';
  protected country = '';

  protected readonly isLoggedIn = computed(() => !!this.user());

  constructor() {
    effect(() => {
      const container = this.addressAutocompleteContainer();

      this.addressAutocompleteElement = null;

      if (!container) {
        return;
      }

      this.addressAutocompleteState.set('loading');
      this.addressAutocompleteError.set(null);

      this.googleMapsService
        .attachAutocomplete(container.nativeElement, (parsed) => {
          this.address = parsed.address;
          this.zipcode = parsed.zipcode;
          this.city = parsed.city;
          this.country = parsed.country;

          this.selectedAddressPreview.set(parsed.formattedAddress);
          this.addressSelected.set(true);
        })
        .then((element) => {
          element.value = this.selectedAddressPreview();

          this.addressAutocompleteElement = element;
          this.addressAutocompleteState.set('ready');
        })
        .catch((error) => {
          console.error('Failed to load address autocomplete:', error);

          this.addressAutocompleteError.set('Address search is currently unavailable. Please try again later.');
          this.addressAutocompleteState.set('error');
        });
    });
  }

  async ngOnInit(): Promise<void> {
    try {

      const profile = await this.profileService.getMyProfile();
      this.loading.set(false);
      this.profile.set(profile);

      if (profile) {
        this.loadMyReviews(profile.id);
        this.loadFollowLists(profile.id);
      } else {
        this.reviewsLoading.set(false);
        this.followListsLoading.set(false);
      }

    } catch(error) {

      console.error(
        'Failed loading profile:',
        error
      );

      this.reviewsLoading.set(false);

    }

  }

  private async loadMyReviews(userId: string): Promise<void> {
    this.reviewsLoading.set(true);

    try {

      const reviews = await this.reviewService.getReviewsWithRestaurantByUser(userId);
      this.myReviews.set(reviews);

    } catch (error) {

      console.error(
        'Failed loading your reviews:',
        error
      );

      this.myReviews.set([]);

    } finally {

      this.reviewsLoading.set(false);

    }
  }

  private async loadFollowLists(userId: string): Promise<void> {
    this.followListsLoading.set(true);

    try {

      const [followers, following] = await Promise.all([
        this.followService.getFollowers(userId),
        this.followService.getFollowing(userId)
      ]);

      this.followers.set(followers);
      this.following.set(following);

    } catch (error) {

      console.error(
        'Failed loading follow lists:',
        error
      );

      this.followers.set([]);
      this.following.set([]);

    } finally {

      this.followListsLoading.set(false);

    }
  }

  protected setFollowTab(tab: FollowTab): void {
    this.activeFollowTab.set(tab);
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

    const hasExistingAddress = !!(profile.address || profile.city || profile.country);

    this.selectedAddressPreview.set(this.buildFullAddress(profile));
    this.addressSelected.set(hasExistingAddress);

    this.editingAddress.set(true);
  }

  protected cancelEditingAddress(): void {
    this.editingAddress.set(false);
  }

  protected clearAddress(): void {
    this.address = '';
    this.zipcode = '';
    this.city = '';
    this.country = '';

    this.selectedAddressPreview.set('');
    this.addressSelected.set(true);

    const autocomplete = this.addressAutocompleteElement;

    if (autocomplete) {
      autocomplete.value = '';
    }
  }

  private buildFullAddress(profile: UserProfile): string {
    return [profile.address, profile.city, profile.zipcode, profile.country]
      .filter((part): part is string => !!part && part.trim().length > 0)
      .join(', ');
  }

  protected async saveAddress() {

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