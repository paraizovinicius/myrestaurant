import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../core/services/review.service';
import { FeedReviewItem } from './types';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feed.html',
  styleUrl: './feed.css'
})
export class FeedPage implements OnInit, OnDestroy {

  private readonly reviewService = inject(ReviewService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly reviews = signal<FeedReviewItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly hasMore = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly sentinel = viewChild<ElementRef<HTMLDivElement>>('sentinel');

  private observer: IntersectionObserver | null = null;
  private offset = 0;

  constructor() {
    effect(() => {
      const sentinelRef = this.sentinel();

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
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  protected async loadMore(): Promise<void> {
    if (this.loadingMore() || !this.hasMore()) {
      return;
    }

    this.loadingMore.set(true);
    this.error.set(null);

    try {

      const nextReviews = await this.reviewService.getReviewsFeed(this.offset, PAGE_SIZE);

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
