import type { Price, PriceResponse } from "~/types/price/price";

export const usePriceStore = defineStore("PriceStore", {
    state: () => ({
        isLoading: false,
        prices: {} as Price,
    }),

    actions: {
        async fetchPrices() {
            this.isLoading = true;
            try {
                const response = await useFetchDataApi<PriceResponse>("/prices");

                if (response.data.value?.success) {
                    this.prices = response.data.value.data;
                }

            } catch (error) {
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
