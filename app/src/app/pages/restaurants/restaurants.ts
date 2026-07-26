import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

type SortBy = 'highestRated' | 'closestToMe';
type PriceRange = 'all' | '$' | '$$' | '$$$' | '$$$$';

interface Restaurant {
  name: string;
  cuisine: string;
  location: string;
  neighborhood: string;
  priceRange: Exclude<PriceRange, 'all'>;
  rating: number;
  distanceKm: number;
  isOpenNow: boolean;
  description: string;
}

@Component({
  selector: 'app-restaurants-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css'
})
export class RestaurantsPage {
  protected readonly pageSize = 6;

  private readonly allRestaurants: Restaurant[] = [
    {
      name: 'Trattoria Alba',
      cuisine: 'Italian',
      location: 'Downtown',
      neighborhood: 'Old Market',
      priceRange: '$$',
      rating: 4.9,
      distanceKm: 0.8,
      isOpenNow: true,
      description: 'Handmade pasta, slow-braised sauces, and a warm dining room built for long dinners.'
    },
    {
      name: 'Sakura House',
      cuisine: 'Japanese',
      location: 'Riverside',
      neighborhood: 'East Bank',
      priceRange: '$$$',
      rating: 4.8,
      distanceKm: 1.2,
      isOpenNow: true,
      description: 'Fresh sushi, precise nigiri, and seasonal small plates with a quiet omakase counter.'
    },
    {
      name: 'Casa Sol',
      cuisine: 'Mexican',
      location: 'Midtown',
      neighborhood: 'Central Square',
      priceRange: '$$',
      rating: 4.7,
      distanceKm: 2.1,
      isOpenNow: false,
      description: 'Tacos, grilled meats, and bright salsas with a late-night mezcal bar.'
    },
    {
      name: 'Mizu Garden',
      cuisine: 'Japanese',
      location: 'Harbor View',
      neighborhood: 'North Pier',
      priceRange: '$$$$',
      rating: 4.6,
      distanceKm: 3.4,
      isOpenNow: true,
      description: 'A refined tasting menu with seafood-led courses and a focused sake list.'
    },
    {
      name: 'La Mesa Roja',
      cuisine: 'Mexican',
      location: 'Uptown',
      neighborhood: 'Rose District',
      priceRange: '$$',
      rating: 4.5,
      distanceKm: 1.8,
      isOpenNow: true,
      description: 'Street-food flavors, house tortillas, and smoky sauces served in a bright room.'
    },
    {
      name: 'Osteria Bellini',
      cuisine: 'Italian',
      location: 'South End',
      neighborhood: 'Canal Walk',
      priceRange: '$$$',
      rating: 4.4,
      distanceKm: 2.9,
      isOpenNow: false,
      description: 'Classic antipasti, wood-fired mains, and a wine list centered on Italian regions.'
    },
    {
      name: 'Rin Thai Kitchen',
      cuisine: 'Thai',
      location: 'Downtown',
      neighborhood: 'Market Row',
      priceRange: '$$',
      rating: 4.6,
      distanceKm: 0.6,
      isOpenNow: true,
      description: 'Green curry, wok-fired noodles, and fragrant herbs with fast lunch service.'
    },
    {
      name: 'Bistro Verde',
      cuisine: 'French',
      location: 'Museum Quarter',
      neighborhood: 'Civic Center',
      priceRange: '$$$',
      rating: 4.3,
      distanceKm: 4.1,
      isOpenNow: true,
      description: 'Seasonal plates, crisp pastries, and a slow-paced dining room for special occasions.'
    },
    {
      name: 'Sabor Norte',
      cuisine: 'Latin American',
      location: 'West End',
      neighborhood: 'Granary District',
      priceRange: '$$',
      rating: 4.2,
      distanceKm: 3.7,
      isOpenNow: true,
      description: 'Charcoal-grilled dishes, bright citrus marinades, and a lively dinner menu.'
    },
    {
      name: 'Green Spoon',
      cuisine: 'Healthy',
      location: 'Lakeside',
      neighborhood: 'Park Lane',
      priceRange: '$',
      rating: 4.1,
      distanceKm: 2.4,
      isOpenNow: false,
      description: 'Bowls, salads, smoothies, and fast weekday lunches with simple ingredients.'
    },
    {
      name: 'Bamboo Wok',
      cuisine: 'Chinese',
      location: 'Northside',
      neighborhood: 'Station Heights',
      priceRange: '$$',
      rating: 4.0,
      distanceKm: 5.3,
      isOpenNow: true,
      description: 'Wok dishes, dumplings, and family-style plates with generous portions.'
    },
    {
      name: 'El Patio',
      cuisine: 'Spanish',
      location: 'Seaside',
      neighborhood: 'Marina Promenade',
      priceRange: '$$$',
      rating: 4.4,
      distanceKm: 6.0,
      isOpenNow: true,
      description: 'Tapas, paella, and shared plates with an easygoing terrace atmosphere.'
    }
  ];

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

  protected trackByRestaurant(index: number, restaurant: Restaurant): string {
    return restaurant.name;
  }

  protected readonly sortLabel = computed(() => {
    return this.sortBy() === 'closestToMe' ? 'Closest to me' : 'Highest rated';
  });
}