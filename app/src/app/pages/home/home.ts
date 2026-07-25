import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

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