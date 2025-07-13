import { defineStore } from 'pinia';
import type {
    Item,
    ItemResponse,
} from '~/types/new_arrival/new_arrival';

export const useNewArrivalStore = defineStore('itemStore', {
    state: () => ({
        isLoading: false,
        items: [] as Item[],
        newArrivalCount: 0,
        selectedItem: null as Item | null,
    }),

    getters: {
        getAllItems: (state) => state.items,
        getItemById: (state) => (id: string) =>
            state.items.find((item) => item.id === id),
        getVariantsByItemId: (state) => (id: string) =>
            state.items.find((item) => item.id === id)?.variants ?? [],
        getBrands: (state) => {
            const brands = state.items.map((item) => item.brand);
            return Array.from(new Map(brands.map(b => [b.id, b])).values()); // remove duplicates
        },
    },

    actions: {
        async fetchNewArrivals() {
            this.isLoading = true;
            try {
                const res = await useFetchDataApi<ItemResponse>('/items/new-arrival');

                const fetched = res?.data?.value?.data;
                if (Array.isArray(fetched)) {
                    this.items = fetched;
                    this.newArrivalCount = res.data.value.new_arrival;
                } else {
                    console.warn('Invalid items fetched:', fetched);
                    this.items = []; // fallback to empty
                }
            } catch (error) {
                console.error('Failed to fetch items:', error);
                this.items = []; // fallback on error
            } finally {
                this.isLoading = false;
            }
        },

        setSelectedItem(itemId: string) {
            this.selectedItem = this.items.find((item) => item.id === itemId) || null;
        },

        clearSelectedItem() {
            this.selectedItem = null;
        },
    },
});
