import type { Color,ColorResponse } from "~/types/color/color";

export const useColorStore = defineStore("ColorStore", {
    state: () => ({
        isLoading: false,
        colors: [] as Color[],
    }),

    actions: {
        async fetchColors() {
            this.isLoading = true;
            try {
                const response = await useFetchDataApi<ColorResponse>("/colors");

                if (response.data.value?.success) {
                    this.colors = response.data.value.data;
                }

            } catch (error) {
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
