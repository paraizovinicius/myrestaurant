import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface FavoriteCuisine {
  name: string;
  visitsThisMonth: number;
}

interface RecentOrder {
  restaurant: string;
  dish: string;
  date: string;
  total: string;
  status: 'Delivered' | 'Scheduled';
}

interface UserProfile {
  fullName: string;
  email: string;
  city: string;
  memberSince: string;
  loyaltyTier: string;
  savedAddresses: number;
  totalOrders: number;
  wishlistItems: number;
  favoriteCuisines: FavoriteCuisine[];
  recentOrders: RecentOrder[];
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePage {
  // Temporary auth state until real auth/database integration is available.
  protected readonly isLoggedIn = signal(true);

  protected readonly profile = signal<UserProfile>({
    fullName: 'Vinicius Paraizo',
    email: 'vinicius@example.com',
    city: 'Rio de Janeiro',
    memberSince: 'March 2025',
    loyaltyTier: 'Gold',
    savedAddresses: 3,
    totalOrders: 27,
    wishlistItems: 12,
    favoriteCuisines: [
      { name: 'Italian', visitsThisMonth: 5 },
      { name: 'Japanese', visitsThisMonth: 4 },
      { name: 'Mexican', visitsThisMonth: 2 }
    ],
    recentOrders: [
      {
        restaurant: 'Trattoria Alba',
        dish: 'Tagliatelle al Ragu',
        date: '2026-07-21',
        total: '$32.00',
        status: 'Delivered'
      },
      {
        restaurant: 'Sakura House',
        dish: 'Sushi Omakase Set',
        date: '2026-07-19',
        total: '$54.00',
        status: 'Delivered'
      },
      {
        restaurant: 'Casa Sol',
        dish: 'Birria Tacos Combo',
        date: '2026-07-28',
        total: '$24.00',
        status: 'Scheduled'
      }
    ]
  });

  protected readonly welcomeMessage = computed(() => {
    const firstName = this.profile().fullName.split(' ')[0];
    return `Welcome back, ${firstName}.`;
  });
}