import { CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { getRestaurantBySlug, restaurantCatalog } from '../restaurants/restaurant-catalog';

@Component({
  selector: 'app-restaurant-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.css'
})



export class RestaurantDetailsPage {
  private readonly route = inject(ActivatedRoute);

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');

      this.restaurant = getRestaurantBySlug(slug);

      this.relatedRestaurants = restaurantCatalog
        .filter((item) => item.slug !== this.restaurant?.slug)
        .slice(0, 3);

      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  protected restaurant = getRestaurantBySlug(
    this.route.snapshot.paramMap.get('slug')
  );

  protected relatedRestaurants = restaurantCatalog;
}