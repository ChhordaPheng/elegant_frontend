import type { User, UserResponse } from "~/types/profile/profile";

export const useProfileStore = defineStore("userProfileStore", {
    state: () => ({
        userProfile: null as User | null,
        loading: false,
        error: "" as string | null,
    }),

    actions: {
        async fetchUserProfile() {
            this.loading = true;
            this.error = null;

            try {
                const response = await useFetch<UserResponse>('/profile', {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${useCookie('token').value}`,
                    },
                });

                this.userProfile = response.data.value?.data ?? null;
            } catch (err: any) {
                this.error = err?.data?.message || "Failed to fetch user.";
                this.userProfile = null;
            } finally {
                this.loading = false;
            }
        },
    },
});
