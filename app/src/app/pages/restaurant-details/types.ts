export interface ReviewLikes {
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface ReviewComments {
    review_id: string;
    user_id: string;
    comment: string;
    created_at: string;
    updated_at: string;
}