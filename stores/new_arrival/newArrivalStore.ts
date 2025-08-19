import { defineStore } from 'pinia';
import type {
    Item,
    ItemResponse,
    FilterParams,
} from '~/types/new_arrival/new_arrival';

export const useNewArrivalStore = defineStore('newArrivalStore', {
    state: () => ({
        isLoading: false,
        newArrival: [] as Item[],
        newArrivalCount: 0,
        total: 0,
        page: 1,
        perPage: 20,
        selectedItem: null as Item | null,
        error: null as string | null,
        currentFilters: {} as FilterParams,
    }),

    getters: {
        getAllItems: (state) => state.newArrival,
        getItemById: (state) => (id: string) =>
            state.newArrival.find((item) => item.id === id),
        getVariantsByItemId: (state) => (id: string) =>
            state.newArrival.find((item) => item.id === id)?.variants ?? [],
        getBrands: (state) => {
            const brands = state.newArrival.map((item) => item.brand);
            return Array.from(new Map(brands.map(b => [b.id, b])).values());
        },
        totalPages: (state) => state.perPage > 0 ? Math.ceil(state.total / state.perPage) : 0,
        hasItems: (state) => state.newArrival.length > 0,
        hasError: (state) => !!state.error,
    },

    actions: {
        // Updated buildQueryString method in your store
        buildQueryString(filters: FilterParams): string {
            const params = new URLSearchParams();

            // Add pagination
            params.append('page', (filters.page || this.page).toString());
            params.append('per_page', (filters.per_page || this.perPage).toString());

            // Only add per_page if it's specified in filters
            // For "all" case, we don't add per_page parameter
            if (filters.per_page !== undefined) {
                params.append('per_page', filters.per_page.toString());
            }

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

        async fetchNewArrivals(filters: FilterParams = {}) {
            // Set loading state consistently
            this.isLoading = true;
            this.error = null;

            try {
                // Merge defaults with provided filters
                // Don't set default per_page if not provided - let backend handle it
                const mergedFilters = {
                    page: filters.page || this.page,
                    ...filters
                };

                // Only set per_page if it's explicitly provided
                if (filters.per_page === undefined && this.perPage) {
                    // Only add per_page if we have a specific perPage set
                    // For "all" case, this.perPage won't be set
                    mergedFilters.per_page = this.perPage;
                }

                this.currentFilters = mergedFilters;

                const queryString = this.buildQueryString(mergedFilters);
                const endpoint = `/items/new-arrival?${queryString}`;
                const res = await useFetchDataApi<ItemResponse>(endpoint);

                const response = res?.data?.value;
                if (response && Array.isArray(response.data)) {
                    // Use consistent property assignment
                    this.newArrival = response.data;
                    this.newArrivalCount = response.new_arrival;
                    this.total = response.pagination.total;
                    this.page = response.pagination.current_page;

                    // Handle per_page for "all" case
                    // If no per_page was sent, use the total as perPage for UI purposes
                    if (filters.per_page === undefined && !this.perPage) {
                        this.perPage = response.pagination.total;
                    } else {
                        this.perPage = response.pagination.per_page || this.perPage;
                    }
                } else {
                    console.warn('Invalid items fetched:', response);
                    this.newArrival = [];
                }
            } catch (error: any) {
                console.error('Failed to fetch items:', error);
                this.error = error?.message ?? 'Failed to fetch new arrivals';
                this.newArrival = [];
            } finally {
                // Always set loading to false in finally block
                this.isLoading = false;
            }
        },

        setSelectedItem(itemId: string) {
            this.selectedItem = this.newArrival.find((item) => item.id === itemId) || null;
        },

        // Apply filters method
        async applyFilters(filters: FilterParams) {
            // Reset to page 1 when applying new filters
            const filtersWithPage = { ...filters, page: 1 };
            await this.fetchNewArrivals(filtersWithPage);
        },

        // Clear items
        clearItems() {
            this.newArrival = [];
            this.total = 0;
            this.page = 1;
            this.error = null;
            this.currentFilters = {};
        },

        // Set page and maintain current filters
        async setPage(newPage: number) {
            this.page = newPage;
            const filtersWithNewPage = { ...this.currentFilters, page: newPage };
            await this.fetchNewArrivals(filtersWithNewPage);
        },

        // Refresh with current filters
        async refreshWithCurrentFilters() {
            await this.fetchNewArrivals(this.currentFilters);
        },
    },
});