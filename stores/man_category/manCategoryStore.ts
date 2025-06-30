import { defineStore } from 'pinia';
import type { Item, ItemResponse } from '~/types/man_category/man_category';


export const useManIteStore = defineStore('useManIteStore', {
  state: () => ({
    items: [] as Item[],
    total: 0,
    page: 1,
    perPage: 20,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchManItems(page = 1) {
      this.loading = true;
      this.error = null;

      try {
        const baseURL = getBaseURL();
        const responseRef = await useFetchDataApi<ItemResponse>(
          `/items/group/men?page=${page}&per_page=${this.perPage}`
        );
        const response = responseRef.data.value;

        if (response?.success) {
          this.items = response.data.map(item => ({
            ...item,
            variants: item.variants.map(variant => ({
              ...variant,
              image: variant.image.startsWith('http') ? variant.image : baseURL + variant.image,
            })),
            brand: {
              ...item.brand,
              logo_url: item.brand.logo_url.startsWith('http') ? item.brand.logo_url : baseURL + item.brand.logo_url,
            }
          }));
          this.total = response.total;
          this.page = response.page;
        } else {
          this.error = response?.message || 'Unexpected error occurred.';
        }
      } catch (error: any) {
        this.error = error?.data?.message || error?.message || 'Failed to fetch items';
      } finally {
        this.loading = false;
      }
    },
  },
});
