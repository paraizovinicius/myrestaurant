import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from '../restaurants/types';

@Component({
  selector: 'app-restaurant-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.css'
})



export class RestaurantDetailsPage {
  private readonly restaurantService = inject(RestaurantService);
  private readonly route = inject(ActivatedRoute);

  protected readonly restaurant = signal<Restaurant | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected priceLabel(priceLevel: number | null): string {
    if (priceLevel === null) {
      return 'Unknown';
    }

    return '$'.repeat(Math.max(1, Math.min(priceLevel, 4)));
  }

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