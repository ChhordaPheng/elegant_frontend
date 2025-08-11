import { defineStore } from 'pinia'
import type { Brand, BrandResponse } from '~/types/brand/brand'

export const useBrandStore = defineStore('brandStore', {
    state: () => ({
        brands: [] as Brand[],
        isLoading: false,
    }),

    getters: {
        featuredBrands: (state) => state.brands.filter(b => b.is_featured === 1),
        nonFeaturedBrands: (state) => state.brands.filter(b => b.is_featured === 0),
        getBrandById: (state) => (id: string) => state.brands.find(b => b.id === id),
    },

    actions: {
        async fetchBrands() {
            this.isLoading = true
            try {
                const response = await useFetchDataApi<BrandResponse>('/brands') // returns { data: Ref<BrandResponse> }
                this.brands = response.data.value?.data ?? []
            } catch (error) {
                console.error('Failed to fetch brands:', error)
            } finally {
                this.isLoading = false
            }
        },
    },

})
