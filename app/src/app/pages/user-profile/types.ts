export interface PublicProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  loyaltyTier: string;
  memberSince: string;
}

export interface FollowedUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export type { UserReviewSummary } from '../profile/types';
