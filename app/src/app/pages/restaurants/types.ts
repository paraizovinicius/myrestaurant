export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address_line1: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website_url: string | null;
  price_level: number | null;
  created_at: string;
  updated_at: string;
}

export interface Reviews {
  restaurant_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  visited_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceLevelVoteCount {
  restaurant_id: string;
  price_level: number;
  vote_count: number;
}