import { defineStore } from 'pinia';
import type { Women, WomenResponse, FilterParams } from '~/types/woman_category/woman_category';

// Define filter interface

export const useWomanIteStore = defineStore('useWomanIteStore', {
  state: () => ({
    women: [] as Women[],
    total: 0,
    page: 1,
    perPage: 20,
    loading: false,
    error: null as string | null,
    // Store current filters
    currentFilters: {} as FilterParams,
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.total / state.perPage),
    hasItems: (state) => state.women.length > 0,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
  },

  actions: {
    // Build query string from filters
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

    async fetchWomanItems(filters: FilterParams = {}) {
      this.loading = true;
      this.error = null;

      // Store current filters for reference
      this.currentFilters = { ...filters };

      try {
        const baseURL = getBaseURL();
        const queryString = this.buildQueryString(filters);
        const endpoint = `/items/group/women?${queryString}`;

        const responseRef = await useFetchDataApi<WomenResponse>(endpoint);
        const response = responseRef.data.value;

        if (response?.success) {
          this.women = response.data.map(item => ({
            ...item,
            variants: item.variants?.map(variant => ({
              ...variant,
              image: variant.image?.startsWith('http')
                ? variant.image
                : baseURL + variant.image,
              final_price: variant.final_price || parseFloat(variant.price || '0'),
            })) || [],
            brand: item.brand ? {
              ...item.brand,
              logo_url: item.brand.logo_url?.startsWith('http')
                ? item.brand.logo_url
                : baseURL + item.brand.logo_url,
            } : {
              id: '',
              name: '',
              slug: '',
              description: '',
              logo_url: '',
              is_featured: 0,
              created_at: '',
              updated_at: '',
            },
          }));
          this.total = response.total || 0;
          this.page = response.page || filters.page || 1;
          this.perPage = filters.per_page || this.perPage;
        } else {
          this.error = response?.message || 'Unexpected error occurred.';
          this.women = [];
        }
      } catch (error: any) {
        console.error('Error fetching woman items:', error);
        this.error = error?.data?.message || error?.message || 'Failed to fetch items';
        this.women = [];
      } finally {
        this.loading = false;
      }
    },

    // Apply filters method
    async applyFilters(filters: FilterParams) {
      const filtersWithPage = { ...filters };
      if (!filtersWithPage.page) filtersWithPage.page = 1; // Only force page if not provided
      await this.fetchWomanItems(filtersWithPage);
    },

    // Clear items
    clearItems() {
      this.women = [];
      this.total = 0;
      this.page = 1;
      this.error = null;
      this.currentFilters = {};
    },

    // Set page and maintain current filters
    async setPage(newPage: number) {
      this.page = newPage;
      const filtersWithNewPage = { ...this.currentFilters, page: newPage };
      await this.fetchWomanItems(filtersWithNewPage);
    },

    // Refresh with current filters
    async refreshWithCurrentFilters() {
      await this.fetchWomanItems(this.currentFilters);
    },
  },
});