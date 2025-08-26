import { defineStore } from 'pinia';
import type { Item, ItemListResponse, ItemResponse, SearchParams, SingleItemResponse, FilterParams } from '~/types/item/item';

export const useItemStore = defineStore('itemStore', {
  state: () => ({
    item: null as Item | null,
    items: [] as Item[],
    searchResults: [] as Item[],
    loading: false,
    isSearching: false,
    error: null as string | null,
    searchError: null as string | null,
    lastSearchQuery: null as SearchParams | null,
    currentSearchParams: {} as SearchParams,
    total: 0,
    page: 1,
    perPage: 20,
    // Store current filters (aligned with man store)
    currentFilters: {} as FilterParams,
  }),

  getters: {
    // Get filtered items based on current search
    filteredItems: (state) => {
      return state.searchResults.length > 0 ? state.searchResults : state.items;
    },
    totalPages: (state) => Math.ceil(state.total / state.perPage),
    hasItems: (state) => state.items.length > 0,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
  },

  actions: {
    // Build query string from filters (aligned with man store)
    buildQueryString(filters: FilterParams): string {
      const params = new URLSearchParams();

      // Add pagination
      params.append('page', (filters.page || this.page).toString());
      params.append('per_page', (filters.per_page || this.perPage).toString());

      // Add filters if they exist
      if (filters.brand_id) params.append('brand_id', filters.brand_id);
      if (filters.color_id) params.append('color_id', filters.color_id);
      if (filters.size_id) params.append('size_id', filters.size_id);
      if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
      if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);

      return params.toString();
    },

    // Fetch all items (updated to use FilterParams)
    async fetchItems(filters: FilterParams = {}) {
      this.loading = true;
      this.error = null;

      // Store current filters for reference
      this.currentFilters = { ...filters };

      try {
        // Build query string for API call
        let endpoint = "/items";
        
        if (filters && Object.keys(filters).length > 0) {
          const queryParams = new URLSearchParams();

          Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              queryParams.append(key, value.toString());
            }
          });

          if (queryParams.toString()) {
            endpoint += `?${queryParams.toString()}`;
          }
        }

        const response = await useFetchDataApi<ItemResponse>(endpoint);

        if (response.data.value?.success === true && response.data.value.data) {
          this.items = response.data.value.data;
          this.total = (response.data.value as any).total || 0;
          this.page = (response.data.value as any).page || 1;

          // If this was a search, also update search results
          if (filters && Object.keys(filters).length > 0) {
            this.searchResults = response.data.value.data;
            this.lastSearchQuery = filters as SearchParams;
            this.currentSearchParams = filters as SearchParams;
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
        this.loading = false;
      }
    },

    // Apply filters method (aligned with man store)
    async applyFilters(filters: FilterParams) {
      // Reset to page 1 when applying new filters
      const filtersWithPage = { ...filters, page: 1 };
      await this.fetchItems(filtersWithPage);
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

    // Clear items (aligned with man store)
    clearItems() {
      this.items = [];
      this.total = 0;
      this.page = 1;
      this.error = null;
      this.currentFilters = {};
    },

    // Set page and maintain current filters (aligned with man store)
    async setPage(newPage: number) {
      this.page = newPage;
      const filtersWithNewPage = { ...this.currentFilters, page: newPage };
      await this.fetchItems(filtersWithNewPage);
    },

    // Refresh with current filters (aligned with man store)
    async refreshWithCurrentFilters() {
      await this.fetchItems(this.currentFilters);
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

      this.loading = true;
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
        this.loading = false;
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