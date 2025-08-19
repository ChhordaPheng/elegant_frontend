import { defineStore } from "pinia";
import type { TopTrending, TopTrendingResponse, FilterParams } from "~/types/top_trending/top_trending";

export const useTopTrendingStore = defineStore("useTopTrendingStore", {
    state: () => ({
        isLoading: false,
        topTrendings: [] as TopTrending[],
        topTrendingCount: 0,
        total: 0,
        page: 1,
        perPage: 20, // Set a default value instead of 0
        selectedItem: null as TopTrending | null,
        error: null as string | null,
        currentFilters: {} as FilterParams,
    }),

    getters: {
        getAllItems: (state) => state.topTrendings,
        getItemById: (state) => (id: string) =>
            state.topTrendings.find((item) => item.id === id),
        getVariantsByItemId: (state) => (id: string) =>
            state.topTrendings.find((item) => item.id === id)?.variants ?? [],
        getBrands: (state) => {
            const brands = state.topTrendings.map((item) => item.brand);
            return Array.from(new Map(brands.map(b => [b.id, b])).values());
        },
        totalPages: (state) => state.perPage > 0 ? Math.ceil(state.total / state.perPage) : 0,
        hasItems: (state) => state.topTrendings.length > 0,
        getIsLoading: (state) => state.isLoading, // Renamed to avoid confusion
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

        async fetchTopTrendings(filters: FilterParams = {}) {
            try {
                // Set loading state
                this.isLoading = true;
                this.error = null;

                // Merge defaults + provided filters
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
                const endpoint = `/items/top-trending?${queryString}`;

                const res = await useFetchDataApi<TopTrendingResponse>(endpoint);

                const response = res?.data?.value;
                if (response && Array.isArray(response.data)) {
                    // Update state properties
                    this.topTrendings = response.data;
                    this.topTrendingCount = response.top_trending;
                    this.total = response.pagination.total;
                    this.page = response.pagination.current_page;
                } else {
                    console.warn('Invalid items fetched:', response);
                    this.topTrendings = [];
                    this.total = 0;
                }
            } catch (error) {
                console.error("Failed to fetch top trending items:", error);
                this.error = error instanceof Error ? error.message : "Failed to fetch items";
                // Reset data on error
                this.topTrendings = [];
                this.total = 0;
                throw error;
            } finally {
                // Always reset loading state
                this.isLoading = false;
            }
        },

        setSelectedItem(itemId: string) {
            this.selectedItem = this.topTrendings.find((item) => item.id === itemId) || null;
        },

        // Apply filters method
        async applyFilters(filters: FilterParams) {
            const filtersWithPage = { ...filters, page: 1 };
            await this.fetchTopTrendings(filtersWithPage);
        },

        // Clear items
        clearItems() {
            this.topTrendings = [];
            this.total = 0;
            this.page = 1;
            this.error = null;
            this.currentFilters = {};
        },

        // Set page and maintain current filters
        async setPage(newPage: number) {
            this.page = newPage;
            const filtersWithNewPage = { ...this.currentFilters, page: newPage };
            await this.fetchTopTrendings(filtersWithNewPage);
        },

        // Refresh with current filters
        async refreshWithCurrentFilters() {
            await this.fetchTopTrendings(this.currentFilters);
        },

        // Manual setter for loading state (if needed)
        setLoading(value: boolean) {
            this.isLoading = value;
        },

        // Manual error setter
        setError(error: string | null) {
            this.error = error;
        }
    },
});