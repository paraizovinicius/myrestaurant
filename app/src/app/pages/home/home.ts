import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  signal,
  ViewChildren
} from '@angular/core';
import { isPlatformBrowser, DatePipe, SlicePipe } from '@angular/common';
import { StatisticsService } from '../../core/services/statistics.service';
import { CommunityStatistics, PopularReview, TrendingRestaurant } from './types';
import { PopularReviewsService } from '../../core/services/popular-reviews.service';
import { PopularRestaurantsService } from '../../core/services/popular-restaurants.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, DatePipe, SlicePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChildren('carousel')
  private readonly carouselsRef!: QueryList<ElementRef<HTMLDivElement>>;
  private readonly slideCount = 3;
  private activeSlide = 0;
  private intervalId?: number;
  
  private readonly statisticsService = inject(StatisticsService);
  private readonly popularReviewsService = inject(PopularReviewsService);
  private readonly popularRestaurantsService = inject(PopularRestaurantsService);

  protected readonly stats = signal<CommunityStatistics | null>(null);
  protected readonly popularReviews = signal<PopularReview[]>([]);
  protected readonly popularRestaurants = signal<TrendingRestaurant[]>([]);

  protected readonly loading = signal(true);

  private readonly platformId = inject(PLATFORM_ID);
  protected readonly mobile = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
  ) {
    if (!isPlatformBrowser(this.platformId)) {
          return;
        }
    
        const mediaQuery = window.matchMedia('(max-width: 700px)');
        const updateMobileState = () => this.mobile.set(mediaQuery.matches);
    
        updateMobileState();
        mediaQuery.addEventListener('change', updateMobileState);
        this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', updateMobileState));
  }

  async ngOnInit(): Promise<void> {
    try {
      // 1. Fetch all home page data concurrently instead of waterfalling
      const [stats, reviews, restaurants] = await Promise.all([
        this.statisticsService.getCommunityStatistics(),
        this.popularReviewsService.getPopularReviews(5), // this one fetches avatar photos as well
        this.popularRestaurantsService.getPopularRestaurants(5)
      ]);

      // 2. Clear loading state BEFORE setting data signals to prevent DOM teardown mid-render
      this.loading?.set(false);

      // 3. Batch signal updates
      this.stats.set(stats);
      this.popularReviews.set(reviews);
      this.popularRestaurants.set(restaurants);
    } catch (error) {
      console.error('Failed to load homepage data:', error);
      this.loading?.set(false);
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.intervalId = window.setInterval(() => this.advanceSlide(), 10000);
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
    } 
  }

  private advanceSlide(): void {
    this.activeSlide = (this.activeSlide + 1) % this.slideCount;

    // Iterate through every matched carousel
    this.carouselsRef.forEach((carouselRef) => {
      const carousel = carouselRef.nativeElement;

      carousel.scrollTo({
        left: carousel.clientWidth * this.activeSlide,
        behavior: 'smooth'
      });
    });
  }
}