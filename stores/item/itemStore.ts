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

export interface SearchParams {
  search?: string;
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
}

export const useItemStore = defineStore('itemStore', {
  state: () => ({
    item: null as Item | null,
    items: [] as Item[],
    searchResults: [] as Item[],
    isLoading: false,
    isSearching: false,
    error: null as string | null,
    searchError: null as string | null,
    lastSearchQuery: null as SearchParams | null,
    currentSearchParams: {} as SearchParams,
  }),

  getters: {
    // Get filtered items based on current search
    filteredItems: (state) => {
      return state.searchResults.length > 0 ? state.searchResults : state.items;
    },
  },

  actions: {
    // Fetch all items (list)
    async fetchItems(searchParams?: SearchParams) {
      this.isLoading = true;
      this.error = null;

      try {
        // Build query string for API call
        let endpoint = "/items";
        if (searchParams && Object.keys(searchParams).length > 0) {
          const queryParams = new URLSearchParams();
          
          Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              queryParams.append(key, value.toString());
            }
          });
          
          if (queryParams.toString()) {
            endpoint += `?${queryParams.toString()}`;
          }
        }

        const response = await useFetchDataApi<ItemListResponse>(endpoint);
        
        if (response.data.value?.status === 'success' && response.data.value.data) {
          this.items = response.data.value.data;
          
          // If this was a search, also update search results
          if (searchParams && Object.keys(searchParams).length > 0) {
            this.searchResults = response.data.value.data;
            this.lastSearchQuery = searchParams;
            this.currentSearchParams = searchParams;
          }
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

    // Dedicated search method
    async searchItems(searchParams: SearchParams) {
      this.isSearching = true;
      this.searchError = null;

      try {
        // Build query string
        const queryParams = new URLSearchParams();
        
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, value.toString());
          }
        });

        const endpoint = `/items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await useFetchDataApi<ItemListResponse>(endpoint);
        
        if (response.data.value?.status === 'success' && response.data.value.data) {
          this.searchResults = response.data.value.data;
          this.lastSearchQuery = searchParams;
          this.currentSearchParams = searchParams;
          this.searchError = null;
        } else {
          this.searchResults = [];
          this.searchError = response.data.value?.message || "No items found.";
        }
      } catch (err: any) {
        this.searchResults = [];
        this.searchError = err.message || "Search failed.";
        console.error('❌ Error in searchItems:', err);
      } finally {
        this.isSearching = false;
      }
    },

    // Clear search results
    clearSearch() {
      this.searchResults = [];
      this.lastSearchQuery = null;
      this.currentSearchParams = {};
      this.searchError = null;
    },

    // Fetch items based on URL query parameters
    async fetchItemsFromURL(route: any) {
      const searchParams: SearchParams = {};
      
      // Extract search parameters from route query
      if (route.query.search) searchParams.search = route.query.search;
      if (route.query.category_id) searchParams.category_id = route.query.category_id;
      if (route.query.brand_id) searchParams.brand_id = route.query.brand_id;
      if (route.query.min_price) searchParams.min_price = parseFloat(route.query.min_price);
      if (route.query.max_price) searchParams.max_price = parseFloat(route.query.max_price);

      // If we have search params, use them
      if (Object.keys(searchParams).length > 0) {
        await this.searchItems(searchParams);
      } else {
        // Otherwise fetch all items
        await this.fetchItems();
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