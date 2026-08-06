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
import { isPlatformBrowser } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { ReviewLikeService } from '../../core/services/review-like.service';
import { ReviewCommentService } from '../../core/services/review-comment.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { CommunityStatistics } from './types';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('carousel', { static: true }) // #carousel is needed in the <div>
  private readonly carouselRef!: ElementRef<HTMLDivElement>;
  private readonly slideCount = 3;
  private activeSlide = 0;
  private intervalId?: number;

  private readonly profileService = inject(ProfileService);
  private readonly reviewLikeService = inject(ReviewLikeService);
  private readonly reviewCommentService = inject(ReviewCommentService);
  private readonly statisticsService = inject(StatisticsService);

  protected readonly stats = signal<CommunityStatistics | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  async ngOnInit() {
    this.stats.set(
      await this.statisticsService.getCommunityStatistics()
    );
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