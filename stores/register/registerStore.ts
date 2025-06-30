import type { RegisterResponse, RegisterTypes } from "~/types/register/register";

export const useRegisterStore = defineStore('useRegisterStore', {
    state: () => ({
        isSpinning: false,
        user: {
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            password: '',
            password_confirmation: ''
        } as RegisterTypes
    }),
    actions: {
        async fetchRegister() {
            this.isSpinning = true;

            try {
                const response = await useFetchDataApi<RegisterResponse>('/register', {
                    method: 'POST',
                    body: {
                        first_name: this.user.first_name,
                        last_name: this.user.last_name,
                        email: this.user.email,
                        phone_number: this.user.phone_number,
                        password: this.user.password,
                        password_confirmation: this.user.password_confirmation
                    }
                });

                const data = response.data;

                if (data && data.value) {
                    // Don't navigate to login immediately, let the component handle OTP flow
                    return data.value;
                } else {
                    throw new Error('Registration failed. No data returned.');
                }

            } catch (error: any) {
                if (error?.response?.data) {
                    throw error.response.data;
                } else {
                    throw { error: error.message || "Unknown error" };
                }
            } finally {
                this.isSpinning = false;
            }
        },
        
        // Clear user data after successful registration
        clearUserData() {
            this.user = {
                first_name: '',
                last_name: '',
                email: '',
                phone_number: '',
                password: '',
                password_confirmation: ''
            };
        }
    }
})