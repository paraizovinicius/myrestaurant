import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicProfile, UserReviewSummary } from './types';
import { ProfileService } from '../../core/services/profile.service';
import { ReviewService } from '../../core/services/review.service';

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})

export class UserProfilePage {

  private readonly profileService = inject(ProfileService);
  private readonly reviewService = inject(ReviewService);
  private readonly route = inject(ActivatedRoute);

  protected readonly profile = signal<PublicProfile | null>(null);
  protected readonly reviews = signal<UserReviewSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly reviewCount = computed(() => this.reviews().length);

  protected readonly averageRating = computed(() => {
    const reviews = this.reviews();

    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);

    return total / reviews.length;
  });

  protected readonly totalLikesReceived = computed(() => {
    return this.reviews().reduce((sum, review) => sum + review.likes, 0);
  });

  private async loadUserProfile(userId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const profile = await this.profileService.getProfileById(userId);

      if (!profile) {
        throw new Error(`Profile not found for id: ${userId}`);
      }

      this.profile.set(profile);

      const reviews = await this.reviewService.getReviewsWithRestaurantByUser(userId);

      this.reviews.set(reviews);

    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.error.set('Could not load this profile right now.');
      this.profile.set(null);
      this.reviews.set([]);

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

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.error.set('User ID is missing.');
        this.loading.set(false);
        return;
      }

      this.loadUserProfile(id);
    });
  }
}
