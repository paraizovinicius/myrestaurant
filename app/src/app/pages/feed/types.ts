export interface FeedReviewItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  likes: number;
  comments: number;
}
