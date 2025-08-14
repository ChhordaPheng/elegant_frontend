import type { AddressRequest, AddressResponse, User, UserResponse, ChangePasswordRequest, ChangePasswordResponse, GetAddressResponse, DeleteAddressResponse, UpdateProfileRequest, UpdateProfileResponse } from "~/types/profile/profile";

export const useProfileStore = defineStore("userProfileStore", {
  state: () => ({
    userProfile: null as User | null,
    loading: false,
    error: "" as string | null,
    passwordChanging: false,
    passwordChangeSuccess: false,
    passwordChangeMessage: "",
  }),

  actions: {
    async fetchUserProfile() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await useFetchDataApi<UserResponse>("/profile", {
          method: "GET",
        });

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

    async changePassword(payload: ChangePasswordRequest) {
      this.passwordChanging = true;
      this.passwordChangeSuccess = false;
      this.passwordChangeMessage = "";

      try {
        const { data } = await useFetchDataApi<ChangePasswordResponse>("/change-password", {
          method: "POST",
          body: payload,
        });

        if (!data.value || data.value.status_code !== 200 || !data.value.success) {
          throw new Error(data.value?.message || "Failed to change password.");
        }

        this.passwordChangeSuccess = true;
        this.passwordChangeMessage = data.value.message;
      } catch (err: any) {
        this.passwordChangeMessage = err.message || "Password change failed.";
      } finally {
        this.passwordChanging = false;
      }
    },

    async addAdress(payload: AddressRequest) {
      try {
        const { data } = await useFetchDataApi<AddressResponse>("/addresses", {
          method: "POST",
          body: payload,
        });

        if (!data.value || !data.value.success) {
          throw new Error(data.value?.message || "Failed to add address.");
        }

        return data.value.data; // Return the added address
      } catch (err: any) {
        throw new Error(err.message || "Failed to add address.");
      }
    },

    async getAddress() {
      this.loading = true;

      try {
        const response = await useFetchDataApi<GetAddressResponse>("/addresses");
        if (response.data.value && response.data.value.success) {
          return response.data.value.data;
        } else {
          console.log("Failed to fetch addresses:", response.data.value?.message);
        }
      } catch (error) {
        return error;
      } finally {
        this.loading = false;
      }
    },

    async updateAddress(payload: AddressRequest, addressID: string) {
      try {
        const { data } = await useFetchDataApi<AddressResponse>(`/addresses/${addressID}`, {
          method: "PUT",
          body: payload,
        });

        if (!data.value || !data.value.success) {
          throw new Error(data.value?.message || "Failed to update address.");
        }

        return data.value.data; // Return the updated address
      } catch (err: any) {
        throw new Error(err.message || "Failed to update address.");
      }
    },

    async deleteAddress(addressID: string) {
      try {
        const response = await useFetchDataApi<DeleteAddressResponse>(`/addresses/${addressID}`, {
          method: "DELETE",
        });

        if (!response.data.value || !response.data.value.success) {
          throw new Error(response.data.value?.message || "Failed to delete address.");
        }

        return response.data.value.message; // Return the success message
      } catch (err: any) {
        throw new Error(err.message || "Failed to delete address.");
      }
    },

    async updateProfile(payload: UpdateProfileRequest) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();
        formData.append("_method", "PUT"); // required for Laravel-like PUT override
        formData.append("first_name", payload.first_name);
        formData.append("last_name", payload.last_name);
        formData.append("email", payload.email);
        formData.append("phone_number", payload.phone_number);
        if (payload.profile_image) {
          formData.append("profile_image", payload.profile_image);
        }

        const { data } = await useFetchDataApi<UpdateProfileResponse>("/profile", {
          method: "POST", // must be POST for form-data with _method override
          body: formData,
        });

        if (!data.value || !data.value.data) {
          throw new Error(data.value?.message || "Failed to update profile.");
        }

        this.userProfile = data.value.data; // update store
        return data.value;
      } catch (err: any) {
        this.error = err.message || "Profile update failed.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
