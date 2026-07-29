export interface FavoriteCuisine {
  name: string;
  visitsThisMonth: number;
}

export interface RecentOrder {
  restaurant: string;
  dish: string;
  date: string;
  total: string;
  status: 'Delivered' | 'Scheduled';
}

export interface UserProfile {
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