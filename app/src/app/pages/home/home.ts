import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { StatisticsService } from '../../core/services/statistics.service';
import { CommunityStatistics, PopularReview, TrendingRestaurant } from './types';
import { PopularReviewsService } from '../../core/services/popular-reviews.service';
import { PopularRestaurantsService } from '../../core/services/popular-restaurants.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('carousel', { static: true }) // #carousel is needed in the <div>
  private readonly carouselRef!: ElementRef<HTMLDivElement>;
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

  constructor(
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // 1. Fetch all home page data concurrently instead of waterfalling
      const [stats, reviews, restaurants] = await Promise.all([
        this.statisticsService.getCommunityStatistics(),
        this.popularReviewsService.getPopularReviews(5),
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

    this.intervalId = window.setInterval(() => this.advanceSlide(), 10000); // every 10 seconds
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
    } 
  }

  private advanceSlide(): void {
    const carousel = this.carouselRef.nativeElement;

    this.activeSlide = (this.activeSlide + 1) % this.slideCount;

    carousel.scrollTo({
      left: carousel.clientWidth * this.activeSlide,
      behavior: 'smooth'
    });
  }
}