import type { Banner, BannerResponse } from '~/types/banner/banner';

export const useBannerStore = defineStore('banner', {
  state: () => ({
    banners: [] as Banner[],
    loading: false,
  }),

  actions: {
    async fetchBanners() {
      this.loading = true;
      try {
        const res = await useFetchDataApi<BannerResponse>('/banners');

        if (res.data?.value?.data) {
          this.banners = res.data.value.data;
        } else {
          throw new Error('No banner data returned');
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      } finally {
        this.loading = false;
      }
    },
  },
});
