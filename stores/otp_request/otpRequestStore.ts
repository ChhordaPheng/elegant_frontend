import type { OtpRequestTypes, OtpRequestResponse } from "~/types/otp_request/otp_request";

export const useOtpRequestStore = defineStore('useOtpRequestStore', {
    state: () => ({
        isSpinning: false,
        otpRequest: {
            phone_number: '',
            otp_code: ''
        } as OtpRequestTypes
    }),
    actions: {
        async handleOtpRequest(isVerify = false) {
            this.isSpinning = true;

            const body: Record<string, string> = {
                phone_number: this.otpRequest.phone_number
            };

            if (isVerify) {
                body.otp_code = this.otpRequest.otp_code;
            }

            try {
                const response = await useFetchDataApi<OtpRequestResponse>('/verify-registration-otp', {
                    method: 'POST',
                    body
                });

                const data = response.data;

                if (data && data.value) {
                    return data.value;
                } else {
                    throw new Error(`${isVerify ? 'OTP verification' : 'OTP request'} failed. No data returned.`);
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

        clearOtpData() {
            this.otpRequest = {
                phone_number: '',
                otp_code: ''
            };
        }
    }

});