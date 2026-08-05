export interface Reviews {
  id: string;
  restaurant_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  visited_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewLikes {
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface ReviewComments {
  id: string;
    review_id: string;
    user_id: string;
  body: string;
    created_at: string;
    updated_at: string;
}