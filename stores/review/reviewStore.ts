import type {
  ReviewResponse,
  ReviewItem,
  Pagination,
  ItemInfo,
  ReviewRequest,
  ReviewSubmitResponse,
} from '~/types/review/review';

export const useReviewStore = defineStore('useReviewStore', {
  state: () => ({
    loading: false,
    reviews: [] as ReviewItem[],
    pagination: {} as Pagination,
    itemInfo: null as ItemInfo | null,
  }),

  actions: {
    // Fetch reviews of the logged-in user
    async fetchMyReviews(page = 1) {
      try {
        this.loading = true;
        const response = await useFetchDataApi<ReviewResponse>(
          `/reviews/my-reviews?page=${page}`
        );

        const reviewData = response.data?.value?.data;

        if (reviewData) {
          this.reviews = reviewData.reviews.data;
          this.pagination = reviewData.reviews.pagination;
          this.itemInfo = reviewData.item || null;
          return reviewData;
        } else {
          throw new Error('No review data in response');
        }
      } catch (error) {
        console.error('Error fetching my reviews:', error);
        throw new Error('Failed to load my reviews.');
      } finally {
        this.loading = false;
      }
    },

    // Fetch reviews for a specific item
    async fetchReviews({ itemId, page = 1 }: { itemId: string; page?: number }) {
      try {
        this.loading = true;
        const response = await useFetchDataApi<ReviewResponse>(
          `/reviews/item/${itemId}?page=${page}`
        );

        const reviewData = response.data?.value?.data;

        if (reviewData) {
          this.reviews = reviewData.reviews.data;
          this.pagination = reviewData.reviews.pagination;
          this.itemInfo = reviewData.item;
          return reviewData;
        } else {
          throw new Error('No review data in response');
        }
      } catch (error) {
        console.error('Error fetching item reviews:', error);
        throw new Error('Failed to load item reviews.');
      } finally {
        this.loading = false;
      }
    },

    // Submit a review
    async submitReview(payload: ReviewRequest) {
      try {
        this.loading = true;
        const response = await useFetchDataApi<ReviewSubmitResponse>(
          '/reviews',
          {
            method: 'POST',
            body: payload,
          }
        );

        return response.data?.value;
      } catch (error) {
        console.error('Error submitting review:', error);
        throw new Error('Failed to submit review.');
      } finally {
        this.loading = false;
      }
    },
  },
});
