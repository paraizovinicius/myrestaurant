export interface CommunityStatistics {
  restaurants: number;
  reviews: number;
  members: number;
  priceVotes: number;
}

export interface PopularReview {
    id: string;

    reviewer: string;
    avatar: string | null;

    restaurant: string;

    title: string;
    body: string;

    rating: number;

    likes: number;
    comments: number;

    created_at: string;
}


export interface TrendingRestaurant {
  id: string;
  name: string;
  city: string | null;
  country: string | null;

  averageRating: number;
  reviewCount: number;

  recentReviews: number; // reviews created this week

  imageUrl?: string | null;
}