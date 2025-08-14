import { defineStore } from 'pinia';
import type { Item, ItemResponse } from '~/types/item/item';

// Update your interfaces to match actual API response
export interface ItemListResponse {
  status: string;
  status_code: number;
  message: string;
  data: Item[];
}

export interface SingleItemResponse {
  status: string;
  status_code: number;
  message: string;
  data: Item;
}

export const useItemStore = defineStore('itemStore', {
  state: () => ({
    item: null as Item | null,
    items: [] as Item[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    // Fetch all items (list)
    async fetchItems() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await useFetchDataApi<ItemListResponse>("/items");
        
        if (response.data.value?.status === 'success' && response.data.value.data) {
          // Fix: Assign the array directly, not wrapped in another array
          this.items = response.data.value.data;
        } else {
          this.items = [];
          this.error = response.data.value?.message || "Failed to fetch items.";
        }
      } catch (err: any) {
        this.items = [];
        this.error = err.message || "Failed to fetch items.";
        console.error('❌ Error in fetchItems:', err);
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch a single item by ID
    async fetchItemById(id: string) {
      
      // Validate ID
      if (!id || id.trim() === '') {
        this.error = "Invalid item ID provided";
        console.error("❌ Invalid ID:", `"${id}"`);
        return;
      }

      this.isLoading = true;
      this.error = null;
      this.item = null; // Clear previous item

      try {        
        const response = await useFetchDataApi<SingleItemResponse>(`/items/${id}`);
        
        // Check for response structure
        if (!response.data?.value) {
          this.error = "Invalid response format from API";
          console.error("❌ No data.value in response");
          return;
        }

        const responseData = response.data.value;
        
        // Fix: Check for status === 'success' instead of success property
        if (responseData.status === 'success' && responseData.data) {
          this.item = responseData.data;
        } else {
          this.error = responseData.message || "Item not found or invalid response";
        }

      } catch (err: any) {
        console.error('💥 Exception in fetchItemById:', err);
        this.item = null;
        
        // More specific error messages
        if (err.message?.includes('fetch')) {
          this.error = "Network error - unable to reach server";
        } else if (err.message?.includes('404')) {
          this.error = "Item not found";
        } else if (err.message?.includes('500')) {
          this.error = "Server error - please try again later";
        } else {
          this.error = err.message || "Failed to fetch item";
        }
        
      } finally {
        this.isLoading = false;
      }
    },

    // Helper method to find item by ID in the items array
    findItemById(id: string): Item | null {
      if (!this.items || !Array.isArray(this.items) || !id) {
        return null;
      }
      return this.items.find(item => item.id === id) || null;
    },
  },
});