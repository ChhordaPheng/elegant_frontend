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
        // // const token = useCookie("accessToken")?.value;
        // if (!token) {
        //   throw new Error("Access token is missing.");
        // }

        const { data } = await useFetchDataApi<UserResponse>("/profile", {
          method: "GET",
        });

        // If your API returns error info inside data, handle it here
        if (!data.value || (data.value as any).error) {
          throw new Error(((data.value as any).error?.message) || "Failed to fetch user.");
        }

        if (!data.value || !data.value.data) {
          throw new Error("No user data returned.");
        }

        this.userProfile = data.value.data;
      } catch (err: any) {
        this.error = err.message || "Failed to fetch user.";
        this.userProfile = null;
      } finally {
        this.loading = false;
      }
    },
  },
});
