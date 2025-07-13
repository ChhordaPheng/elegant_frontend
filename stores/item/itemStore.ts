import { defineStore } from 'pinia';
import type { Item, ItemResponse } from '~/types/item/item';

// stores/itemStore.ts
export const useItemStore = defineStore('itemStore', {
    state: () => ({
        item: null as Item | null,
        isLoading: false,
        error: null as string | null,
    }),
    actions: {
        async fetchItemById(id: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const { data } = await useFetchDataApi<ItemResponse>(`/api/items/${id}`);
                if ((data.value as any)?.status === 'error') {
                    this.error = (data.value as any).message || 'Failed to fetch item.';
                    this.item = null;
                } else if ((data.value as any)?.data) {
                    this.item = (data.value as any).data;
                }
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch item.';
            } finally {
                this.isLoading = false;
            }
        },
    },
});

