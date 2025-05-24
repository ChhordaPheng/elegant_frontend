import { defineStore } from 'pinia';
import type { loginTypes, LoginResponse } from '~/types/login/login';

export const useLoginStore = defineStore('useLoginStore', {
  state: () => ({
    authenticated: false,
    isSpinning: false,
    user: {} as loginTypes,
  }),
  actions: {
    async fetchLogin() {
      this.isSpinning = true;

      try {
        const response = await useFetchDataApi<LoginResponse>('/auth/login', {
          method: 'POST',
          body: {
            user_name: this.user.user_name,
            password: this.user.password,
          }
        });

        const data = response.data;

        if (data && data.value) {
          const token = useCookie('accessToken');
          token.value = data.value.data.token;
          this.authenticated = true;
          navigateTo({ name: 'index' });
          return data.value;
        } else {
          // If API returns with no expected data, treat as failure
          throw new Error('Login failed. No data returned.');
        }

      } catch (error: any) {
        // Normalize and rethrow the error for caller to handle
        if (error?.response?.data) {
          throw error.response.data; // Forward structured API error
        } else {
          throw { error: error.message || "Unknown error" };
        }

      } finally {
        this.isSpinning = false;
      }
    }
  }
});
