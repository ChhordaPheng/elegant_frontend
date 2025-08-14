import type { AddToFavRequest, AddToFavResponse, DeleteFavResponse, Favorite, FavoriteResponse, Pagination } from "~/types/favorite/favorite";

export const useFavoriteStore = defineStore("FavoriteStore", {
    state: () => ({
        isLoading: false,
        favorites: [] as Favorite[],
        pagination: null as Pagination | null,
    }),


    actions: {
        async fetchFavorites() {
            this.isLoading = true;
            try {
                const response = await useFetchDataApi<FavoriteResponse>("/favorites");

                if (response.data.value?.success) {
                    this.favorites = response.data.value.data.favorites;
                    this.pagination = response.data.value.data.pagination;
                }
            } catch (error) {
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async addToFav(req: AddToFavRequest) {
            this.isLoading = true;
            try {
                const res = await useFetchDataApi<AddToFavResponse>("/favorites", {
                    method: "POST",
                    body: req,
                });

                if (res.data.value?.success) {
                    await this.fetchFavorites();
                }
            } catch (error) {
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async deleteFav(variantID: string) {
            this.isLoading = true;

            try {
                const res = await useFetchDataApi<DeleteFavResponse>(
                    `/favorites/${variantID}`,
                    { method: "DELETE" }
                );

                if (res.data.value?.success) {
                    // Update store state
                    this.favorites = this.favorites.filter(
                        fav => fav.item_variant.id !== variantID
                    );
                } else {
                    throw new Error(res.data.value?.message || "Failed to delete favorite");
                }
            } finally {
                this.isLoading = false;
            }
        }

    },
});
