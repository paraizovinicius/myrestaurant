import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../core/services/review.service';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { FeedReviewItem } from './types';

const PAGE_SIZE = 10;

type FeedViewMode = 'global' | 'nearby';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feed.html',
  styleUrl: './feed.css'
})
export class FeedPage implements OnInit, OnDestroy {

  private readonly reviewService = inject(ReviewService);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly reviews = signal<FeedReviewItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly hasMore = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly viewMode = signal<FeedViewMode>('global');
  protected readonly userCity = signal<string | null>(null);
  protected readonly nearbyWarning = signal<string | null>(null);

  protected readonly sentinel = viewChild<ElementRef<HTMLDivElement>>('sentinel');

  private observer: IntersectionObserver | null = null;
  private offset = 0;
  private warningTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const sentinelRef = this.sentinel();

      this.observer?.disconnect();
      this.observer = null;

      if (!isPlatformBrowser(this.platformId) || !sentinelRef) {
        return;
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.loadMore();
          }
        },
        { rootMargin: '400px' }
      );

      this.observer.observe(sentinelRef.nativeElement);
    });
  }

  ngOnInit(): void {
    this.loadMore();
    this.loadUserCity();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();

    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }
  }

  private async loadUserCity(): Promise<void> {
    if (!this.authService.user()) {
      return;
    }

    try {

      const profile = await this.profileService.getMyProfile();
      this.userCity.set(profile?.city ?? null);

    } catch (error) {

      console.error('Failed to load profile for feed filter:', error);

    }
  }

  protected setViewMode(mode: FeedViewMode): void {
    if (mode === this.viewMode()) {
      return;
    }

    if (mode === 'nearby' && !this.userCity()) {
      this.showNearbyWarning();
      return;
    }

    this.viewMode.set(mode);

    this.reviews.set([]);
    this.offset = 0;
    this.hasMore.set(true);
    this.loading.set(true);
    this.error.set(null);

    this.loadMore();
  }

  private showNearbyWarning(): void {
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }

    this.nearbyWarning.set(
      this.authService.user()
        ? "Set your location in your profile to use Near You."
        : "Sign in and set your location in your profile to use Near You."
    );

    this.warningTimeout = setTimeout(() => {
      this.nearbyWarning.set(null);
      this.warningTimeout = null;
    }, 4000);
  }

  protected async loadMore(): Promise<void> {
    if (this.loadingMore() || !this.hasMore()) {
      return;
    }

    this.loadingMore.set(true);
    this.error.set(null);

    try {

      const city = this.viewMode() === 'nearby' ? this.userCity() : null;
      const nextReviews = await this.reviewService.getReviewsFeed(this.offset, PAGE_SIZE, city);

      this.offset += nextReviews.length;
      this.reviews.update((current) => [...current, ...nextReviews]);
      this.hasMore.set(nextReviews.length === PAGE_SIZE);

    } catch (error) {

      console.error('Failed to load feed:', error);
      this.error.set('Could not load the feed right now. Please try again later.');

    } finally {

      this.loading.set(false);
      this.loadingMore.set(false);

    }
  }

  protected trackByReview(index: number, review: FeedReviewItem): string {
    return review.id;
  }
}
