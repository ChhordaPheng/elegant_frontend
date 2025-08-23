import type { Delivery, DeliveryResponse } from "~/types/delivery/delivery";

export const useDeliveryStore = defineStore("deliveryStore", {
  state: () => ({
    isLoading: false,
    deliveries: [] as Delivery[],
    error: null as string | null,
  }),

  getters: {
    getDeliveryById: (state) => (id: string) => {
      return state.deliveries.find(delivery => delivery.id === id);
    },
    
    getDefaultDelivery: (state) => {
      return state.deliveries.length > 0 ? state.deliveries[0] : null;
    }
  },

  actions: {
    async fetchDeliveries() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await useFetchDataApi<DeliveryResponse>("/delivery");

        if (response.data?.value?.status === 'success') {
          this.deliveries = response.data.value.data;
          return response.data.value;
        } else {
          throw new Error(response.data?.value?.message || 'Failed to fetch deliveries');
        }

      } catch (error: any) {
        this.error = error.message || 'Failed to fetch deliveries';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearDeliveries() {
      this.deliveries = [];
      this.error = null;
    }
  },
});