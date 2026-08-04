import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, computed, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant, PriceLevelVoteCount, Reviews} from '../restaurants/types';
import { ReviewComments, ReviewLikes } from './types';
import { PriceLevelService } from '../../core/services/price-level.service';
import { ReviewService } from '../../core/services/review.service';
import { ReviewStatsService } from '../../core/services/reviewstats.service';
import { AuthService } from '../../core/services/auth.service';

type ReviewSortBy = 'likes' | 'mostRecent';
type ReviewRatingFilter = 'all' | '0-2' | '3-4' | '5-6' | '7-8' | '9-10';


@Component({
  selector: 'app-restaurant-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.css'
})

export class RestaurantDetailsPage {
  private readonly restaurantService = inject(RestaurantService);
  private readonly priceLevelService = inject(PriceLevelService);
  private readonly reviewService = inject(ReviewService);
  private readonly reviewStatsService = inject(ReviewStatsService); // fetch likes and comments
  private readonly authService = inject(AuthService);
  
  private readonly route = inject(ActivatedRoute);

  protected readonly restaurant = signal<Restaurant | null>(null);
  protected readonly priceVotes = signal<PriceLevelVoteCount[]>([]);
  protected readonly userPriceVote = signal<number | null>(null);
  protected readonly reviews = signal<Reviews[]>([]);
  protected readonly reviewLikes = signal<ReviewLikes[]>([]);
  protected readonly reviewComments = signal<ReviewComments[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly user = this.authService.user; // fetches user data
  protected readonly isLoggedIn = computed(() => !!this.user());

  protected readonly reviewPageSize = 5;
  protected readonly reviewSortBy = signal<ReviewSortBy>('mostRecent');
  protected readonly reviewRatingFilter = signal<ReviewRatingFilter>('all');
  protected readonly reviewSortDropdownOpen = signal(false);
  protected readonly reviewRatingDropdownOpen = signal(false);
  protected readonly reviewPage = signal(1);

  protected readonly reviewSortOptions = [
    { value: 'likes', label: 'Likes' },
    { value: 'mostRecent', label: 'Most recent' }
  ] as const;

  protected readonly reviewRatingOptions = [
    { value: 'all', label: 'All ratings (0-10)' },
    { value: '0-2', label: '0 to 2' },
    { value: '3-4', label: '3 to 4' },
    { value: '5-6', label: '5 to 6' },
    { value: '7-8', label: '7 to 8' },
    { value: '9-10', label: '9 to 10' }
  ] as const;

  protected readonly processedReviews = computed(() => {
    const sortBy = this.reviewSortBy();
    const ratingFilter = this.reviewRatingFilter();

    const filtered = this.reviews().filter((review) => {
      if (ratingFilter === 'all') {
        return true;
      }

      if (ratingFilter === '0-2') {
        return review.rating >= 0 && review.rating <= 2;
      }

      if (ratingFilter === '3-4') {
        return review.rating >= 3 && review.rating <= 4;
      }

      if (ratingFilter === '5-6') {
        return review.rating >= 5 && review.rating <= 6;
      }

      if (ratingFilter === '7-8') {
        return review.rating >= 7 && review.rating <= 8;
      }

      return review.rating >= 9 && review.rating <= 10;
    });

    return filtered.sort((left, right) => {
      if (sortBy === 'likes') {
        const leftLikes = this.reviewLikesFor(left);
        const rightLikes = this.reviewLikesFor(right);

        if (rightLikes !== leftLikes) {
          return rightLikes - leftLikes;
        }
      }

      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    });
  });

  protected readonly reviewTotalPages = computed(() => {
    return Math.max(1, Math.ceil(this.processedReviews().length / this.reviewPageSize));
  });

  protected readonly visibleReviews = computed(() => {
    const page = this.reviewPage();
    const startIndex = (page - 1) * this.reviewPageSize;

    return this.processedReviews().slice(startIndex, startIndex + this.reviewPageSize);
  });

  protected readonly reviewPageNumbers = computed(() => {
    return Array.from({ length: this.reviewTotalPages() }, (_, index) => index + 1);
  });

  protected readonly reviewResultLabel = computed(() => {
    const total = this.processedReviews().length;

    if (total === 0) {
      return 'No reviews match these filters.';
    }

    const start = (this.reviewPage() - 1) * this.reviewPageSize + 1;
    const end = Math.min(start + this.reviewPageSize - 1, total);

    return `Showing ${start}-${end} of ${total} reviews`;
  });

  protected readonly currentReviewSortLabel = computed(() => {
    return this.reviewSortOptions.find((option) => option.value === this.reviewSortBy())?.label ?? 'Sort by';
  });

  protected readonly currentReviewRatingLabel = computed(() => {
    return this.reviewRatingOptions.find((option) => option.value === this.reviewRatingFilter())?.label ?? 'All ratings';
  });

  private readonly reviewLikesCountById = computed(() => {
    const counts: Record<string, number> = {};

    for (const like of this.reviewLikes()) {
      counts[like.review_id] = (counts[like.review_id] ?? 0) + 1;
    }

    return counts;
  });

  private readonly reviewCommentsCountById = computed(() => {
    const counts: Record<string, number> = {};

    for (const comment of this.reviewComments()) {
      counts[comment.review_id] = (counts[comment.review_id] ?? 0) + 1;
    }

    return counts;
  });

  private reviewLikesFor(review: Reviews): number {
    return this.reviewLikesCountById()[review.id] ?? 0;
  }

  private reviewCommentsTotal(review: Reviews): number {
    return this.reviewCommentsCountById()[review.id] ?? 0;
  }

  private async loadRestaurantDetails(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const restaurant = await this.restaurantService.getRestaurant(id);

      if (!restaurant) {
        throw new Error(`Restaurant not found for id: ${id}`);
      }

      this.restaurant.set(restaurant);

      const [priceVotes, reviews] = await Promise.all([
        this.priceLevelService.getPriceSummary([restaurant.id]),
        this.reviewService.getReviewsForRestaurant(restaurant.id)
      ]);

      const currentUser = this.authService.user();

      if (currentUser) {
        const vote = await this.priceLevelService.getUserVote(
          restaurant.id,
          currentUser.id
        );

        this.userPriceVote.set(vote as number | null);
      } else {
        this.userPriceVote.set(null);
      }

      const typedReviews = (reviews ?? []) as Reviews[];
      const reviewIds = typedReviews.map((review) => review.id);

      const [reviewLikes, reviewComments] = await Promise.all([
        this.reviewStatsService.getReviewLikes(reviewIds),
        this.reviewStatsService.getReviewComments(reviewIds)
      ]);

      this.priceVotes.set(priceVotes);
      this.reviews.set(typedReviews);
      this.reviewLikes.set((reviewLikes ?? []) as ReviewLikes[]);
      this.reviewComments.set((reviewComments ?? []) as ReviewComments[]);
      this.reviewPage.set(1);

    } catch (error) {
      console.error('Failed to load restaurant:', error);
      this.error.set('Failed to load restaurant details.');
      this.restaurant.set(null);
      this.priceVotes.set([]);
      this.reviews.set([]);
      this.reviewLikes.set([]);
      this.reviewComments.set([]);

    } finally {
      this.loading.set(false);

      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }

  // Price level methods
  protected priceLevelFor(restaurantId: string): number | null {
    const votes = this.priceVotes()
      .filter(vote => vote.restaurant_id === restaurantId);

    if (votes.length === 0) {
      return null;
    }

    const totalVotes = votes.reduce(
      (sum, vote) => sum + vote.vote_count,
      0
    );

    const weightedSum = votes.reduce(
      (sum, vote) => sum + vote.price_level * vote.vote_count,
      0
    );

    return weightedSum / totalVotes;
  }

  protected fullPriceLabel(priceLevel: number | null): string {
    if (priceLevel === null) {
      return 'Unknown';
    }

    const full = Math.floor(Math.max(1, Math.min(priceLevel, 4)));

    return (
      '$'.repeat(full)
    );
  }

  protected hasHalfPrice(priceLevel: number | null): boolean {
    if (priceLevel === null) {
      return false;
    }

    const fraction = priceLevel % 1;

    return fraction > 0 && fraction < 1;
  }

  protected priceOpacity(priceLevel: number | null): number {
    if (priceLevel === null) {
      return 0;
    }

    const fraction = priceLevel % 1;

    if (fraction === 0) {
      return 0;
    }

    if (fraction < 0.3) {
      return 0.3;
    }

    if (fraction < 0.6) {
      return 0.5;
    }

    return 0.65;
  }

  protected returnPriceVotes() : PriceLevelVoteCount[] {
    return this.priceVotes();
  }

  protected priceVotePercentage(voteCount: number): number {
    const totalVotes = this.priceVotes().reduce(
      (sum, vote) => sum + vote.vote_count,
      0
    );

    if (totalVotes === 0) {
      return 0;
    }

    return (voteCount / totalVotes) * 100;
  }

  // Voting Price level methods
  
  protected async voteForPriceLevel(
    restaurantId: string,
    userId: string,
    priceLevel: number
  ): Promise<void> {

    try {

      if (priceLevel < 1 || priceLevel > 4) {
        throw new Error('Price level must be between 1 and 4');
      }

      await this.priceLevelService.voteForPriceLevel(
        restaurantId,
        userId,
        priceLevel
      );

      this.userPriceVote.set(priceLevel);

      this.priceVotes.set(
        await this.priceLevelService.getPriceSummary([restaurantId])
      );

    } catch (error) {
      console.error(error);
    }
  }

  protected async deleteVoteForPriceLevel(
    restaurantId: string,
    userId: string
  ): Promise<void> {

    try {

      await this.priceLevelService.deleteVoteForPriceLevel(
        restaurantId,
        userId
      );

      this.userPriceVote.set(null);

      this.priceVotes.set(
        await this.priceLevelService.getPriceSummary([restaurantId])
      );

    } catch (error) {
      console.error(error);
    }
  }

  // Review methods

  protected reviewLikesCount(review: Reviews): number {
    return this.reviewLikesFor(review);
  }

  protected reviewCommentsCount(review: Reviews): number {
    return this.reviewCommentsTotal(review);
  }

  protected chooseReviewSort(value: string): void {
    this.reviewSortBy.set(value as ReviewSortBy);
    this.reviewSortDropdownOpen.set(false);
    this.reviewPage.set(1);
  }

  protected chooseReviewRatingFilter(value: string): void {
    this.reviewRatingFilter.set(value as ReviewRatingFilter);
    this.reviewRatingDropdownOpen.set(false);
    this.reviewPage.set(1);
  }

  protected toggleReviewSortDropdown(): void {
    this.reviewSortDropdownOpen.update((current) => !current);
    this.reviewRatingDropdownOpen.set(false);
  }

  protected toggleReviewRatingDropdown(): void {
    this.reviewRatingDropdownOpen.update((current) => !current);
    this.reviewSortDropdownOpen.set(false);
  }

  protected goToReviewPage(page: number): void {
    if (page < 1 || page > this.reviewTotalPages()) {
      return;
    }

    this.reviewPage.set(page);
  }

  protected trackByReview(index: number, review: Reviews): string {
    return review.id ?? `${review.user_id}-${review.created_at}-${index}`;
  }

  // Constructor

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.error.set('Restaurant ID is missing.');
        this.restaurant.set(null);
        this.priceVotes.set([]);
        this.reviews.set([]);
        this.reviewLikes.set([]);
        this.reviewComments.set([]);
        this.loading.set(false);
        return;
      }

      this.loadRestaurantDetails(id);
    });
  }
}