import type { Related } from "~/types/related/related";

export const useRelatedStore = defineStore('relatedStore', {
    state: () => ({
        isLoading: false,
        relateds: [] as Related[],
    }),

    actions: {
        async fetchRelateds(itemID: string) {
            this.isLoading = true;
            try {
                const response = await useFetchDataApi<{ data: Related[] }>(`/items/${itemID}/related`);
                this.relateds = response.data.value?.data ?? [];
            } catch (error) {
                console.error('Failed to fetch related items:', error);
                this.relateds = [];
            } finally {
                this.isLoading = false;
            }
        }
    },
})