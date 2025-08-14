// stores/promotion/promotionStore.ts
import type { Promotion, PromotionResponse } from "~/types/promotion/promotion";

export const usePromotionStore = defineStore("PromotionStore", {
    state: () => ({
        isLoading: false,
        promotions: {} as Promotion,
        countdownInterval: null as any
    }),

    actions: {
        async fetchPromotion() {
            this.isLoading = true;
            try {
                const response = await useFetchDataApi<PromotionResponse>("/promotions/featured");

                if (response.data.value?.success) {
                    this.promotions = response.data.value.data;

                    // Clear old countdown interval if it exists
                    if (this.countdownInterval) clearInterval(this.countdownInterval);

                    // Start new countdown timer
                    this.startCountdown();
                }

            } catch (error) {
                console.error('Error in fetchPromotion:', error);
            } finally {
                this.isLoading = false;
            }
        },

        startCountdown() {
            if (!this.promotions?.countdown) return;

            this.countdownInterval = setInterval(() => {
                if (this.promotions.countdown.total_seconds > 0) {
                    this.promotions.countdown.total_seconds--;

                    const total = this.promotions.countdown.total_seconds;
                    this.promotions.countdown.days = Math.floor(total / (60 * 60 * 24));
                    this.promotions.countdown.hours = Math.floor((total % (60 * 60 * 24)) / 3600);
                    this.promotions.countdown.minutes = Math.floor((total % 3600) / 60);
                    this.promotions.countdown.seconds = total % 60;
                } else {
                    clearInterval(this.countdownInterval);
                }
            }, 1000);
        }
    }
});

