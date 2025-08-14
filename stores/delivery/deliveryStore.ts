import type { Delivery, DeliveryResponse } from "~/types/delivery/delivery";

export const useDeliveryStore = defineStore("deliveryStore", {
    state: () => ({
        isLoading: false,
        deliveries: [] as Delivery[],
    }),

    actions: {
        async fetchDeliveries() {
            this.isLoading = true;
            try {
                const response = await useFetchDataApi<DeliveryResponse>("/delivery");

                if (response.data?.value?.status === 'success') {
                    return response.data.value;
                } else {
                    throw new Error(response.data?.value?.message || 'Update failed');
                }

            } catch (error) {
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
