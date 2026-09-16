export interface PublicProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  loyaltyTier: string;
  memberSince: string;
}

export type { UserReviewSummary } from '../profile/types';
