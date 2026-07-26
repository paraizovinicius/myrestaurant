import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from './types';

type SortBy = 'name' | 'newest' | 'priceLow' | 'priceHigh';
type PriceFilter = 'all' | '1' | '2' | '3' | '4' | 'unknown';

@Component({
  selector: 'app-restaurants-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css'
})
export class RestaurantsPage {
  private readonly restaurantService = inject(RestaurantService);

  protected readonly pageSize = 6;
  protected readonly restaurants = signal<Restaurant[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly searchTerm = signal('');
  protected readonly cityFilter = signal('');
  protected readonly priceFilter = signal<PriceFilter>('all');
  protected readonly sortBy = signal<SortBy>('name');
  protected readonly currentPage = signal(1);
  protected readonly sortMenuOpen = signal(false);

  protected readonly priceOptions = [
    { value: 'all', label: 'All prices' },
    { value: '1', label: '$' },
    { value: '2', label: '$$' },
    { value: '3', label: '$$$' },
    { value: '4', label: '$$$$' },
    { value: 'unknown', label: 'Unknown' }
  ] as const;

  async ngOnInit(): Promise<void> {
    try {
      const restaurants = await this.restaurantService.getRestaurants();
      this.restaurants.set(restaurants);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      this.error.set('Failed to load restaurants.');
    } finally {
      this.loading.set(false);
    }
  }

  protected readonly filteredRestaurants = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const cityFilter = this.cityFilter().trim().toLowerCase();
    const priceFilter = this.priceFilter();
    const sortBy = this.sortBy();

    const filtered = this.restaurants().filter((restaurant) => {
      const haystack = [
        restaurant.name,
        restaurant.description ?? '',
        restaurant.city ?? '',
        restaurant.country ?? '',
        restaurant.phone ?? '',
        restaurant.website_url ?? ''
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchTerm.length === 0 || haystack.includes(searchTerm);
      const matchesCity = cityFilter.length === 0 || (restaurant.city ?? '').toLowerCase().includes(cityFilter);
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'unknown' ? restaurant.price_level === null : String(restaurant.price_level ?? '') === priceFilter);

      return matchesSearch && matchesCity && matchesPrice;
    });

    return filtered.sort((left, right) => {
      if (sortBy === 'newest') {
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      }

      if (sortBy === 'priceLow') {
        return (left.price_level ?? Number.POSITIVE_INFINITY) - (right.price_level ?? Number.POSITIVE_INFINITY);
      }

      if (sortBy === 'priceHigh') {
        return (right.price_level ?? Number.NEGATIVE_INFINITY) - (left.price_level ?? Number.NEGATIVE_INFINITY);
      }

      return left.name.localeCompare(right.name);
    });
  });

  protected readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredRestaurants().length / this.pageSize));
  });

  protected readonly visibleRestaurants = computed(() => {
    const currentPage = this.currentPage();
    const startIndex = (currentPage - 1) * this.pageSize;

    return this.filteredRestaurants().slice(startIndex, startIndex + this.pageSize);
  });

  protected readonly pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  });

  protected readonly resultLabel = computed(() => {
    const total = this.filteredRestaurants().length;

    if (total === 0) {
      return this.loading() ? 'Loading restaurants...' : 'No restaurants match these filters.';
    }

    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, total);

    return `Showing ${start}-${end} of ${total} restaurants`;
  });

  protected chooseSort(sort: SortBy): void {
    this.sortBy.set(sort);
    this.sortMenuOpen.set(false);
    this.currentPage.set(1);
  }

  protected toggleSortMenu(): void {
    this.sortMenuOpen.update((current) => !current);
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.cityFilter.set('');
    this.priceFilter.set('all');
    this.sortBy.set('name');
    this.sortMenuOpen.set(false);
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }

  protected trackByRestaurant(index: number, restaurant: Restaurant): string {
    return restaurant.id;
  }

  protected readonly sortLabel = computed(() => {
    switch (this.sortBy()) {
      case 'newest':
        return 'Newest first';
      case 'priceLow':
        return 'Price: low to high';
      case 'priceHigh':
        return 'Price: high to low';
      default:
        return 'Name A-Z';
    }
  });

  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  protected setCityFilter(value: string): void {
    this.cityFilter.set(value);
    this.currentPage.set(1);
  }

  protected setPriceFilter(value: string): void {
    this.priceFilter.set(value as PriceFilter);
    this.currentPage.set(1);
  }

  protected priceLabel(priceLevel: number | null): string {
    if (priceLevel === null) {
      return 'Unknown';
    }

    return '$'.repeat(Math.max(1, Math.min(priceLevel, 4)));
  }
}