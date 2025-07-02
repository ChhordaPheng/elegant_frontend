import { defineStore } from 'pinia';
import type { Item, ItemResponse } from '~/types/woman_category/woman_category';

export const useWomanIteStore = defineStore('useWomanIteStore', {
  state: () => ({
    items: [] as Item[],
    total: 0,
    page: 1,
    perPage: 20,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    // Add getters for computed values
    totalPages: (state) => Math.ceil(state.total / state.perPage),
    hasItems: (state) => state.items.length > 0,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
  },

  actions: {
    async fetchWomanItems(page = 1) {
      this.loading = true;
      this.error = null;

      try {
        const baseURL = getBaseURL();
        const responseRef = await useFetchDataApi<ItemResponse>(
          `/items/group/women?page=${page}&per_page=${this.perPage}`
        );
        const response = responseRef.data.value;

        if (response?.success) {
          this.items = response.data.map(item => ({
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
          this.page = response.page || 1;
        } else {
          this.error = response?.message || 'Unexpected error occurred.';
          this.items = [];
        }
      } catch (error: any) {
        console.error('Error fetching woman items:', error);
        this.error = error?.data?.message || error?.message || 'Failed to fetch items';
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    // Add method to clear items
    clearItems() {
      this.items = [];
      this.total = 0;
      this.page = 1;
      this.error = null;
    },

    // Add method to update page
    setPage(newPage: number) {
      this.page = newPage;
      this.fetchWomanItems(newPage);
    },
  },
});