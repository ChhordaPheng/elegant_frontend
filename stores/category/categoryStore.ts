import type { Category, CategoryResponse } from "~/types/category/category";

export const useCategoryStore = defineStore("categoryStory", {
    state: () => ({
        isLoading: false,
        categories: [] as Category[],
    }),

    actions: {
        async fetchCategories() {
            try {
                const response = await useFetchDataApi<CategoryResponse>('/categories');
                if (response.data.value?.success) {
                    this.categories = response.data.value.data;
                }
            } catch (error: any) {
                console.error("Failed to fetch the categories");
            } finally {
                this.isLoading = false;
            }
        }
    }
})