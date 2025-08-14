import { defineStore } from "pinia";
import type { DiscountedItemsResponse, DataItem } from "~/types/discount/discount";

export const useDiscountStore = defineStore("DiscountStore", {
  state: () => ({
    isLoading: false,
    discountedItems: [] as DataItem[],
  }),

  actions: {
    async fetchDiscountedItems() {
      this.isLoading = true;
      try {
        const response = await useFetchDataApi<DiscountedItemsResponse>("/items/discounted");

        if (response.data.value?.success) {
          this.discountedItems = response.data.value.data;
        }

      } catch (error) {
        console.error("Failed to fetch discounted items:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
