import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { PriceLevelService } from '../../core/services/price-level.service';
import { ReviewService } from '../../core/services/review.service';
import { Restaurant, PriceLevelVoteCount, ReviewRating } from './types';

type SortBy = 'name' | 'newest' | 'priceLow' | 'priceHigh';
type PriceFilter = 'all' | '1' | '2' | '3' | '4' | 'unknown';
type PriceLevelBin = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-restaurants-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css'
})
export class RestaurantsPage {
  private readonly restaurantService = inject(RestaurantService);
  private readonly priceLevelService = inject(PriceLevelService);
  private readonly reviewService = inject(ReviewService);

  protected readonly pageSize = 6;
  protected readonly restaurants = signal<Restaurant[]>([]);
  protected readonly priceVotes = signal<PriceLevelVoteCount[]>([]);
  protected readonly weightedPriceLevels = signal<Record<string, number>>({});
  protected readonly reviews = signal<ReviewRating[]>([]);
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
  ] as const;


  private priceLevelBin(priceLevel: number | null): PriceLevelBin | null {
    if (priceLevel === null) {
      return null;
    }

    if (priceLevel < 1.5) {
      return 1;
    }

    if (priceLevel < 2.5) {
      return 2;
    }

    if (priceLevel < 3.5) {
      return 3;
    }

    return 4;
  }

  private async loadPriceLevels(): Promise<void> {

    let restaurantIds = this.restaurants().map(restaurant => restaurant.id);
  

    const priceVotes = await this.priceLevelService.getPriceSummary(restaurantIds);

    if (priceVotes.length === 0) return;

    this.priceVotes.set(priceVotes);

    // 1. Group votes by restaurant_id
    const votesByRestaurant = priceVotes.reduce((acc, vote) => {
      
      const rId = vote.restaurant_id; 

      if (!acc[rId]) acc[rId] = [];
      acc[rId].push(vote);
      return acc;
    }, {} as Record<string, PriceLevelVoteCount[]>);

    // 2. Calculate weighted average for each restaurant
    const updatedWeightedLevels: Record<string, number> = {
      ...this.weightedPriceLevels()
    };

    for (const [restaurantId, votes] of Object.entries(votesByRestaurant)) {
      const totalVotes = votes.reduce((sum, v) => sum + v.vote_count, 0);
      const weightedSum = votes.reduce((sum, v) => sum + v.price_level * v.vote_count, 0);

      if (totalVotes > 0) {
        updatedWeightedLevels[restaurantId] = weightedSum / totalVotes;
      }
    }
    this.weightedPriceLevels.set(updatedWeightedLevels);
  }

  private async loadReviews(): Promise<void> {
    const visible = this.visibleRestaurants();

    const restaurantIds = visible.map(
      restaurant => restaurant.id
    );

    const reviews = await this.reviewService.getReviewsRates(restaurantIds);
    this.reviews.set(reviews);

  }

  async ngOnInit(): Promise<void> {
    try {
      const restaurants = await this.restaurantService.getRestaurants();

      this.restaurants.set(restaurants);

      await this.loadPriceLevels();

      await this.loadReviews();

      // console.log(this.weightedPriceLevels());

    } catch (error) {
      console.error('Failed to load restaurants:', error);
      this.error.set('Failed to load restaurants.');
    } finally {
      this.loading.set(false);
    }
  }

  protected readonly filteredRestaurants = computed(() => {
    const searchTerm = this.searchTerm().toLowerCase();
    const cityFilter = this.cityFilter().toLowerCase();
    const priceFilter = this.priceFilter();
    const allWeightedPrices = this.weightedPriceLevels(); // Synchronously read the signal

    return this.restaurants().filter((restaurant) => {
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
      const matchesCity = cityFilter.length === 0 || 
        (restaurant.city ?? '').toLowerCase().includes(cityFilter) || 
        (restaurant.country ?? '').toLowerCase().includes(cityFilter);

      let matchesPrice = true;
      const priceLevelBin = this.priceLevelBin(this.weightedPriceLevels()[restaurant.id] ?? null);
      
      if (priceFilter === 'unknown') {
        matchesPrice = priceLevelBin === null;
      } else if (priceFilter !== 'all') {
        matchesPrice = priceLevelBin === parseInt(priceFilter, 10);
      }

      return matchesSearch && matchesCity && matchesPrice;
    });
  });

  // Price level methods


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

  // Review methods

  protected averageRatingFor(restaurantId: string): number | null {
    const reviews = this.reviews().filter(
      review => review.restaurant_id === restaurantId
    );

    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return total / reviews.length;
  }


  // Pagination and Sorting

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

  protected async goToPage(page: number): Promise<void> {
    this.currentPage.set(page);
    // await this.loadPriceLevels();
    await this.loadReviews();
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
}