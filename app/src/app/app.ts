import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../app/core/services/auth.service';
import { RestaurantService } from '../app/core/services/restaurant.service';
import { Restaurant } from './pages/restaurants/types';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly router = inject(Router);
  protected readonly title = signal('MyRestaurant');
  protected readonly currentYear = new Date().getFullYear();
  private readonly authService = inject(AuthService);
  private readonly restaurantService = inject(RestaurantService);

  protected readonly user = this.authService.user;

  protected readonly isLoggedIn = computed(() => !!this.user());
  protected readonly searchTerm = signal('');
  protected readonly searchResults = signal<Restaurant[]>([]);
  protected readonly searchOpen = signal(false);
  protected readonly searchLoading = signal(false);

  async typing(value: string): Promise<void> {
    this.searchTerm.set(value);

    const query = value.trim().toLowerCase();

    if (query.length === 0) {
      this.searchResults.set([]);
      this.searchOpen.set(false);
      return;
    }

    this.searchLoading.set(true);

    try {
      const restaurants = await this.restaurantService.getRestaurants();

      this.searchResults.set(
        restaurants
          .filter((restaurant) => {
            const haystack = [
              restaurant.name,
              restaurant.description ?? '',
              restaurant.city ?? '',
              restaurant.country ?? ''
            ].join(' ').toLowerCase();

            return haystack.includes(query);
          })
          .slice(0, 8)
      );

      this.searchOpen.set(true);
    } catch (error) {
      console.error('Failed to search restaurants:', error);
      this.searchResults.set([]);
      this.searchOpen.set(false);
    } finally {
      this.searchLoading.set(false);
    }
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
    this.searchResults.set([]);
    this.searchOpen.set(false);
  }

  protected selectSearchResult(restaurantId: string): void {
    this.searchOpen.set(false);
    this.searchTerm.set('');
    this.router.navigate(['/restaurants', restaurantId]);
  }

}
