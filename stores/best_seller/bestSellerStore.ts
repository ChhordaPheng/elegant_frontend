import { defineStore } from "pinia";
import type { BestSeller, BestSellerResponse } from "~/types/best_seller/best_seller";

export const useBestSellerStore = defineStore("BestSellerStore", {
    state: () => ({
        isLoading: false,
        bestSellers: [] as BestSeller[],
    }),

    actions: {
        async fetchBestSellers() {
            this.isLoading = true;
            try {
                const response = await useFetchDataApi<BestSellerResponse>("/items/best-sellers");

                if (response.data.value?.success) {
                    this.bestSellers = response.data.value.data;
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
