import type { Size, SizeResponse } from "~/types/size/size";

export const useSizeStore = defineStore("SizeStore", {
    state: () => ({
        isLoading: false,
        sizes: [] as Size[],
    }),

    actions: {
        async fetchSize() {
            this.isLoading = true;
            try {
                const response = await useFetchDataApi<SizeResponse>("/sizes");

                if (response.data.value?.success) {
                    this.sizes = response.data.value.data;
                }

            } catch (error) {
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
