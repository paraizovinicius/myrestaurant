import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { restaurantSummaries, type RestaurantPriceRange } from './restaurant-catalog';

type SortBy = 'highestRated' | 'closestToMe';
type PriceRange = 'all' | RestaurantPriceRange;
type RestaurantSummary = (typeof restaurantSummaries)[number];

@Component({
  selector: 'app-restaurants-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css'
})
export class RestaurantsPage {
  protected readonly pageSize = 6;
  private readonly allRestaurants = restaurantSummaries;

  protected readonly selectedCuisines = signal<string[]>([]);
  protected readonly locationFilter = signal('');
  protected readonly priceRange = signal<PriceRange>('all');
  protected readonly minimumRating = signal(0);
  protected readonly openNowOnly = signal(false);
  protected readonly sortBy = signal<SortBy>('highestRated');
  protected readonly currentPage = signal(1);
  protected readonly sortMenuOpen = signal(false);

  protected readonly cuisines = [
    'Italian',
    'Japanese',
    'Mexican',
    'Thai',
    'French',
    'Latin American',
    'Healthy',
    'Chinese',
    'Spanish'
  ];

  protected readonly sortedAndFilteredRestaurants = computed(() => {
    const cuisineFilters = this.selectedCuisines();
    const locationFilter = this.locationFilter().trim().toLowerCase();
    const priceRange = this.priceRange();
    const minimumRating = this.minimumRating();
    const openNowOnly = this.openNowOnly();
    const sortBy = this.sortBy();

    const filtered = this.allRestaurants.filter((restaurant) => {
      const matchesCuisine = cuisineFilters.length === 0 || cuisineFilters.includes(restaurant.cuisine);
      const matchesLocation =
        locationFilter.length === 0 ||
        [restaurant.location, restaurant.neighborhood, restaurant.name].some((field) =>
          field.toLowerCase().includes(locationFilter)
        );
      const matchesPrice = priceRange === 'all' || restaurant.priceRange === priceRange;
      const matchesRating = restaurant.rating >= minimumRating;
      const matchesOpenNow = !openNowOnly || restaurant.isOpenNow;

      return matchesCuisine && matchesLocation && matchesPrice && matchesRating && matchesOpenNow;
    });

    return filtered.sort((left, right) => {
      if (sortBy === 'closestToMe') {
        if (left.distanceKm !== right.distanceKm) {
          return left.distanceKm - right.distanceKm;
        }

        return right.rating - left.rating;
      }

      if (left.rating !== right.rating) {
        return right.rating - left.rating;
      }

      return left.distanceKm - right.distanceKm;
    });
  });

  protected readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.sortedAndFilteredRestaurants().length / this.pageSize));
  });

  protected readonly visibleRestaurants = computed(() => {
    const currentPage = this.currentPage();
    const startIndex = (currentPage - 1) * this.pageSize;

    return this.sortedAndFilteredRestaurants().slice(startIndex, startIndex + this.pageSize);
  });

  protected readonly pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  });

  protected readonly resultLabel = computed(() => {
    const total = this.sortedAndFilteredRestaurants().length;

    if (total === 0) {
      return 'No restaurants match these filters.';
    }

    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, total);

    return `Showing ${start}-${end} of ${total} restaurants`;
  });

  protected toggleCuisine(cuisine: string): void {
    const current = this.selectedCuisines();

    if (current.includes(cuisine)) {
      this.selectedCuisines.set(current.filter((item) => item !== cuisine));
    } else {
      this.selectedCuisines.set([...current, cuisine]);
    }

    this.currentPage.set(1);
  }

  protected setLocationFilter(value: string): void {
    this.locationFilter.set(value);
    this.currentPage.set(1);
  }

  protected setPriceRange(value: PriceRange): void {
    this.priceRange.set(value);
    this.currentPage.set(1);
  }

  protected setMinimumRating(value: string): void {
    this.minimumRating.set(Number(value));
    this.currentPage.set(1);
  }

  protected setOpenNowOnly(value: boolean): void {
    this.openNowOnly.set(value);
    this.currentPage.set(1);
  }

  protected chooseSort(sort: SortBy): void {
    this.sortBy.set(sort);
    this.sortMenuOpen.set(false);
    this.currentPage.set(1);
  }

  protected toggleSortMenu(): void {
    this.sortMenuOpen.update((current) => !current);
  }

  protected resetFilters(): void {
    this.selectedCuisines.set([]);
    this.locationFilter.set('');
    this.priceRange.set('all');
    this.minimumRating.set(0);
    this.openNowOnly.set(false);
    this.sortBy.set('highestRated');
    this.sortMenuOpen.set(false);
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }

  protected trackByRestaurant(index: number, restaurant: RestaurantSummary): string {
    return restaurant.slug;
  }

  protected readonly sortLabel = computed(() => {
    return this.sortBy() === 'closestToMe' ? 'Closest to me' : 'Highest rated';
  });
}