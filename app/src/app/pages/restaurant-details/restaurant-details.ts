import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant, PriceLevelVoteCount} from '../restaurants/types';
import { PriceLevelService } from '../../core/services/price-level.service';

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
  private readonly route = inject(ActivatedRoute);

  protected readonly restaurant = signal<Restaurant | null>(null);
  protected readonly priceVotes = signal<PriceLevelVoteCount[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

async ngOnInit(): Promise<void> {
    try {
      const id = this.route.snapshot.paramMap.get('id');

      if (!id) {
        throw new Error('Restaurant ID is missing.');
      }

      const restaurant =
        await this.restaurantService.getRestaurant(id);

      this.restaurant.set(restaurant);

      const priceVotes =
        await this.priceLevelService.getPriceSummary([restaurant.id]);

      this.priceVotes.set(priceVotes);

    } catch (error) {
      console.error('Failed to load restaurant:', error);
      this.error.set('Failed to load restaurant details.');
      this.restaurant.set(null);

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

  // Constructor

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      this.loading.set(true);
      this.error.set(null);

      this.restaurantService.getRestaurant(id ?? '').then((restaurant) => {
        this.restaurant.set(restaurant);
      }).catch((error) => {
        console.error('Failed to load restaurant:', error);
        this.error.set('Failed to load restaurant details.');
        this.restaurant.set(null);
      }).finally(() => {
        this.loading.set(false);

        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }
}