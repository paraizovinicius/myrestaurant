import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicProfile, UserReviewSummary } from './types';
import { ProfileService } from '../../core/services/profile.service';
import { ReviewService } from '../../core/services/review.service';
import { FollowService } from '../../core/services/follow.service';
import { AuthService } from '../../core/services/auth.service';

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
  private readonly followService = inject(FollowService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  protected readonly profile = signal<PublicProfile | null>(null);
  protected readonly reviews = signal<UserReviewSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly user = this.authService.user;
  protected readonly isLoggedIn = computed(() => !!this.user());
  protected readonly isOwnProfile = computed(() => this.user()?.id === this.profile()?.id);

  protected readonly followerCount = signal(0);
  protected readonly followingCount = signal(0);
  protected readonly isFollowing = signal(false);
  protected readonly followActionPending = signal(false);
  protected readonly followError = signal<string | null>(null);

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

      const currentUserId = this.user()?.id;

      const [reviews, followerCount, followingCount, isFollowing] = await Promise.all([
        this.reviewService.getReviewsWithRestaurantByUser(userId),
        this.followService.getFollowerCount(userId),
        this.followService.getFollowingCount(userId),
        currentUserId && currentUserId !== userId
          ? this.followService.isFollowing(userId)
          : Promise.resolve(false)
      ]);

      this.reviews.set(reviews);
      this.followerCount.set(followerCount);
      this.followingCount.set(followingCount);
      this.isFollowing.set(isFollowing);

    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.error.set('Could not load this profile right now.');
      this.profile.set(null);
      this.reviews.set([]);
      this.followerCount.set(0);
      this.followingCount.set(0);
      this.isFollowing.set(false);

    } finally {
      this.loading.set(false);
    }
  }

  protected async toggleFollow(): Promise<void> {
    const profile = this.profile();

    if (!profile) {
      return;
    }

    this.followActionPending.set(true);
    this.followError.set(null);

    try {

      if (this.isFollowing()) {
        await this.followService.unfollow(profile.id);
        this.isFollowing.set(false);
        this.followerCount.update((count) => Math.max(0, count - 1));
      } else {
        await this.followService.follow(profile.id);
        this.isFollowing.set(true);
        this.followerCount.update((count) => count + 1);
      }

    } catch (error) {
      console.error('Failed to update follow status:', error);
      this.followError.set('Could not update follow status right now.');

    } finally {
      this.followActionPending.set(false);
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
