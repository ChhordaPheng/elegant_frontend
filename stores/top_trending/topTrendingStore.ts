import { defineStore } from "pinia";
import type { BestSeller, BestSellerResponse } from "~/types/best_seller/best_seller";
import type { TopTrending, TopTrendingResponse } from "~/types/top_trending/top_trending";

export const useTopTrendingStore = defineStore("useTopTrendingStore", {
    state: () => ({
        isLoading: false,
        topTrendings: [] as TopTrending[],
    }),

    actions: {
        async fetchTopTrendings() {
            this.isLoading = true;
            try {
                const response = await useFetchDataApi<TopTrendingResponse>("/items/top-trending");

                if (response.data.value?.success) {
                    this.topTrendings = response.data.value.data;
                }

            } catch (error) {
                console.error("Failed to fetch best sellers:", error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
