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
  id: string;

  fullName: string;
  email: string | undefined;
  avatarUrl: string | null;
  phone: string | null;

  city: string | null;
  country: string | null;
  address: string | null;
  zipcode: string | null;

  loyaltyTier: string;

  memberSince: string;
}