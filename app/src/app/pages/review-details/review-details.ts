import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../core/services/review.service';
import { ReviewStatsService } from '../../core/services/reviewstats.service';
import { AuthService } from '../../core/services/auth.service';
import { ReviewLikeService } from '../../core/services/review-like.service';
import { ReviewCommentService } from '../../core/services/review-comment.service';
import { ProfileService } from '../../core/services/profile.service';
import { Reviews, ReviewComments, ReviewLikes } from './types';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-review-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review-details.html',
  styleUrl: './review-details.css'
})

export class ReviewDetailsPage {

    private readonly reviewService = inject(ReviewService);
    private readonly reviewStatsService = inject(ReviewStatsService);

    private readonly authService = inject(AuthService);
    private readonly reviewLikeService = inject(ReviewLikeService);
    private readonly reviewCommentService = inject(ReviewCommentService);
    private readonly profileService = inject(ProfileService);

    private readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);

    protected readonly review = signal<Reviews | null>(null);
    protected readonly reviewLikes = signal<ReviewLikes[]>([]);
    protected readonly reviewComments = signal<ReviewComments[]>([]);
    protected readonly profiles = signal<Record<string, { name: string; loyaltyTier: string | null }>>({});
    protected readonly loading = signal(true);
    protected readonly error = signal<string | null>(null);
    protected readonly actionError = signal<string | null>(null);
    protected readonly commentDraft = signal('');
    protected readonly isLiking = signal(false);
    protected readonly isSubmittingComment = signal(false);
    protected readonly deletingCommentId = signal<string | null>(null);
    protected readonly reviewAuthorProfiles = signal<Record<string, { name: string; loyaltyTier: string | null }>>({});
  

    protected readonly user = this.authService.user;
    protected readonly isLoggedIn = computed(() => !!this.user());
    protected readonly hasUserLiked = signal(false);
    protected readonly likesCount = computed(() => this.reviewLikes().length);
    protected readonly commentsCount = computed(() => this.reviewComments().length);

    private async loadReviewDetails(reviewId: string): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        this.actionError.set(null);

        try {
            const review: Reviews | null = await this.reviewService.getReview(reviewId);
            if (!review) {
                throw new Error('Review not found');
            }
            this.review.set(review);

            await this.refreshReviewStats(reviewId);
        } catch (error) {
            console.error('Error loading review details:', error);
            this.error.set('Could not load review details right now. Please try again.');
        } finally {
            this.loading.set(false);
        }
    }

    private async refreshReviewStats(reviewId: string): Promise<void> {
        const likes: ReviewLikes[] = await this.reviewStatsService.getReviewLikesByReviewId(reviewId);
        const comments: ReviewComments[] = await this.reviewStatsService.getReviewCommentsByReviewId(reviewId);
        const hasLiked = await this.reviewLikeService.hasLiked(reviewId);
        const currentReview = this.review();

        this.reviewLikes.set(likes);
        this.reviewComments.set(
            [...comments].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
        );
        this.hasUserLiked.set(hasLiked);

        if (currentReview) {
            await this.loadProfilesForReview(currentReview.user_id, comments.map((comment) => comment.user_id));
        }
    }

    private async loadProfilesForReview(reviewUserId: string, commentUserIds: string[]): Promise<void> {
        const userIds = Array.from(new Set([reviewUserId, ...commentUserIds]));
        const profiles = await this.profileService.getProfilesByIds(userIds);

        this.profiles.set(
            profiles.reduce<Record<string, { name: string; loyaltyTier: string | null }>>((accumulator, profile) => {
                accumulator[profile.id] = {
                    name: profile.name ?? 'Anonymous user',
                    loyaltyTier: profile.loyalty_tier ?? null
                };

                return accumulator;
            }, {})
        );
    }

    protected async likeReview(): Promise<void> {
        const currentReview = this.review();
        if (!currentReview || !this.isLoggedIn()) {
            this.actionError.set('Sign in to like this review.');
            return;
        }

        this.isLiking.set(true);
        this.actionError.set(null);

        try {
            await this.reviewLikeService.likeReview(currentReview.id);
            await this.refreshReviewStats(currentReview.id);
        } catch (error) {
            console.error('Error liking review:', error);
            this.actionError.set('Could not like this review right now.');
        } finally {
            this.isLiking.set(false);
        }
    }

    protected async unlikeReview(): Promise<void> {
        const currentReview = this.review();
        if (!currentReview || !this.isLoggedIn()) {
            this.actionError.set('Sign in to unlike this review.');
            return;
        }

        this.isLiking.set(true);
        this.actionError.set(null);

        try {
            await this.reviewLikeService.unlikeReview(currentReview.id);
            await this.refreshReviewStats(currentReview.id);
        } catch (error) {
            console.error('Error unliking review:', error);
            this.actionError.set('Could not unlike this review right now.');
        } finally {
            this.isLiking.set(false);
        }
    }

    protected async CommentReview(): Promise<void> {
        const currentReview = this.review();
        const body = this.commentDraft().trim();

        if (!currentReview || !this.isLoggedIn()) {
            this.actionError.set('Sign in to add a comment.');
            return;
        }

        if (!body) {
            this.actionError.set('Write a comment before submitting.');
            return;
        }

        this.isSubmittingComment.set(true);
        this.actionError.set(null);

        try {
            await this.reviewCommentService.createComment(currentReview.id, body);
            this.commentDraft.set('');
            await this.refreshReviewStats(currentReview.id);
        } catch (error) {
            console.error('Error creating comment:', error);
            this.actionError.set('Could not publish your comment right now.');
        } finally {
            this.isSubmittingComment.set(false);
        }
    }

    protected async DeleteCommentReview(commentId: string): Promise<void> {
        const currentReview = this.review();
        const currentUserId = this.user()?.id;
        const comment = this.reviewComments().find((item) => item.id === commentId);

        if (!currentReview || !currentUserId || !comment) {
            this.actionError.set('Unable to delete this comment.');
            return;
        }

        if (comment.user_id !== currentUserId) {
            this.actionError.set('You can only delete your own comments.');
            return;
        }

        this.deletingCommentId.set(commentId);
        this.actionError.set(null);

        try {
            await this.reviewCommentService.deleteComment(commentId);
            await this.refreshReviewStats(currentReview.id);
        } catch (error) {
            console.error('Error deleting comment:', error);
            this.actionError.set('Could not delete your comment right now.');
        } finally {
            this.deletingCommentId.set(null);
        }
    }

    protected canDeleteComment(comment: ReviewComments): boolean {
        return comment.user_id === this.user()?.id;
    }

    protected profileName(userId: string): string {
        return this.profiles()[userId]?.name ?? 'Anonymous user';
    }

    protected profileLoyaltyTier(userId: string): string | null {
        return this.profiles()[userId]?.loyaltyTier ?? null;
    }


    constructor() {
        this.route.paramMap.subscribe((params) => {
        const id = params.get('id');


        if (!id) {
            console.error('No review ID provided in route parameters.');
            return;
        }
        this.loadReviewDetails(id);
        });
    }
}