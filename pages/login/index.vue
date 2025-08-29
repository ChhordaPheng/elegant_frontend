<script setup lang="ts">
definePageMeta({
  layout: "login-layout",
});

const tab = ref("login");
const activeButton = computed(() => tab.value);
const snackbar = ref<boolean>(false);
const errors = ref<Record<string, string>>({});
const messageInvalid = ref("");
const dialogOTP = ref<boolean>(false);
const forgetPasswordDialog = ref<boolean>(false);
const forgetPasswordStep = ref<number>(1); // 1: Phone input, 2: OTP verification, 3: Set new password

// Password visibility toggles
const showLoginPassword = ref<boolean>(false);
const showRegisterPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);
const showNewPassword = ref<boolean>(false);
const showConfirmNewPassword = ref<boolean>(false);

// Forget password form data
const forgetPasswordForm = ref({
  phone_number: "",
  otp_code: "",
  password: "",
  password_confirmation: "",
});

const isLoadingForgetPassword = ref<boolean>(false);

const loginStore = useLoginStore();
const registerStore = useRegisterStore();
const otpStore = useOtpRequestStore();
type Errors = Record<string, string>;

const emailRule = (v: string) => {
  return /.+@.+\..+/.test(v) || "Email must be valid";
};

const onlyPhoneChars = (e: KeyboardEvent) => {
  const char = e.key;
  const value = (e.target as HTMLInputElement).value;

  // Allow digits
  if (/[0-9]/.test(char)) return;

  // Allow space
  // if (char === " ") return;

  // Allow '+' only if it's the first character
  if (char === "+" && value.length === 0) return;

  // Otherwise block
  e.preventDefault();
};

const sanitizePhoneInput = (value: string) => {
  registerStore.user.phone_number = value
    .replace(/[^0-9+ ]/g, "") // keep digits, +, and spaces
    .replace(/(?!^)\+/g, ""); // remove + if not at the start
};

const handleLogin = async () => {
  try {
    errors.value = {};
    messageInvalid.value = "";
    snackbar.value = false;

    if (!loginStore.user.phone_number) {
      errors.value.username = "Phone number is required";
      snackbar.value = true;
      return;
    }

    if (!loginStore.user.password) {
      errors.value.password = "Password is required";
      snackbar.value = true;
      return;
    }

    const response = await loginStore.fetchLogin();

    if (response && response.customer) {
      console.log("Login successful:", response.customer);
      messageInvalid.value = "Login successful! Welcome back";
      snackbar.value = true;
    } else {
      messageInvalid.value =
        "Login failed. Please check your credentials and try again";
      snackbar.value = true;
    }
  } catch (error: any) {
    if (error?.response?.data?.errors) {
      errors.value = error.response.data.errors as Errors;
      messageInvalid.value = "Please check the errors and try again";
    } else if (error?.response?.data?.error) {
      messageInvalid.value = error.response.data.error;
    } else {
      messageInvalid.value =
        "Login failed. Please check your internet connection and try again";
    }
    snackbar.value = true;
  }
};

const handlerRegister = async () => {
  try {
    errors.value = {};
    messageInvalid.value = "";
    snackbar.value = false;

    // Validate required fields
    if (!registerStore.user.first_name) {
      errors.value.first_name = "First name is required";
      snackbar.value = true;
      return;
    }

    if (!registerStore.user.last_name) {
      errors.value.last_name = "Last name is required";
      snackbar.value = true;
      return;
    }

    if (!registerStore.user.email) {
      errors.value.email = "Email is required";
      snackbar.value = true;
      return;
    }

    if (!registerStore.user.phone_number) {
      errors.value.phone_number = "Phone number is required";
      snackbar.value = true;
      return;
    }

    if (!registerStore.user.password) {
      errors.value.password = "Password is required";
      snackbar.value = true;
      return;
    }

    // Password length validation
    if (registerStore.user.password.length < 8) {
      errors.value.password = "Password must be at least 8 characters long";
      snackbar.value = true;
      return;
    }

    if (
      registerStore.user.password !== registerStore.user.password_confirmation
    ) {
      errors.value.password_confirmation = "Passwords do not match";
      snackbar.value = true;
      return;
    }

    const response = await registerStore.fetchRegister();

    if (response) {
      // After successful registration, copy phone number to OTP store and show OTP dialog
      otpStore.otpRequest.phone_number = registerStore.user.phone_number;
      dialogOTP.value = true;
    }
  } catch (error: any) {
    if (error?.response?.data?.errors) {
      errors.value = error.response.data.errors as Errors;
    } else if (error?.response?.data?.error) {
      messageInvalid.value = error.response.data.error;
    } else {
      messageInvalid.value = "The phone number has already been taken";
    }
    snackbar.value = true;
  }
};

const requestOTP = async () => {
  try {
    if (!otpStore.otpRequest.phone_number) {
      messageInvalid.value = "Phone number is required";
      snackbar.value = true;
      return;
    }

    // For now, let's just show success message
    // You can replace this with actual API call when your backend is ready
    messageInvalid.value = "OTP sent to your phone number";
    snackbar.value = true;

    // If you have the requestOTP method in your store, uncomment this:
    // await otpStore.requestOTP();
  } catch (error: any) {
    if (error?.response?.data?.error) {
      messageInvalid.value = error.response.data.error;
    } else {
      messageInvalid.value = "Failed to send OTP";
    }
    snackbar.value = true;
  }
};

const handleOTPVerification = async () => {
  try {
    errors.value = {};
    messageInvalid.value = "";
    snackbar.value = false;

    if (!otpStore.otpRequest.phone_number) {
      errors.value.phone_number = "Phone number is required";
      snackbar.value = true;
      return;
    }

    if (!otpStore.otpRequest.otp_code) {
      errors.value.otp_code = "OTP code is required";
      snackbar.value = true;
      return;
    }

    const response = await otpStore.handleOtpRequest(true);

    if (response) {
      // OTP verification successful
      dialogOTP.value = false;
      tab.value = "login"; // Switch to login tab
      messageInvalid.value = "Registration completed! Please login.";
      snackbar.value = true;

      // Clear OTP store
      otpStore.otpRequest.otp_code = "";
    }
  } catch (error: any) {
    if (error?.response?.data?.errors) {
      errors.value = error.response.data.errors as Errors;
    } else if (error?.response?.data?.error) {
      messageInvalid.value = error.response.data.error;
    } else {
      messageInvalid.value = "OTP verification failed.";
    }
    snackbar.value = true;
  }
};

const closeOTPDialog = () => {
  dialogOTP.value = false;
  otpStore.otpRequest.otp_code = "";
};

// Forget Password Functions
const openForgetPasswordDialog = () => {
  forgetPasswordDialog.value = true;
  forgetPasswordStep.value = 1;
  forgetPasswordForm.value = {
    phone_number: "",
    otp_code: "",
    password: "",
    password_confirmation: "",
  };
  errors.value = {};
};

const closeForgetPasswordDialog = () => {
  forgetPasswordDialog.value = false;
  forgetPasswordStep.value = 1;
  forgetPasswordForm.value = {
    phone_number: "",
    otp_code: "",
    password: "",
    password_confirmation: "",
  };
  errors.value = {};
  isLoadingForgetPassword.value = false;
};

// COMPLETE FORGET PASSWORD IMPLEMENTATION

// Step 1: Send OTP for forget password (FIXED)
const sendForgetPasswordOTP = async () => {
  try {
    errors.value = {};
    messageInvalid.value = "";
    snackbar.value = false;
    isLoadingForgetPassword.value = true;

    if (!forgetPasswordForm.value.phone_number) {
      errors.value.phone_number = "Phone number is required";
      snackbar.value = true;
      return;
    }

    // FIXED: Use correct endpoint for sending OTP
    const response = await fetch(
      "https://elegantchic.me/api/customer/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: forgetPasswordForm.value.phone_number,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      messageInvalid.value = "OTP sent successfully to your phone number";
      snackbar.value = true;
      forgetPasswordStep.value = 2;
    } else {
      const errorData = await response.json();
      if (errorData.errors) {
        errors.value = errorData.errors;
        messageInvalid.value = "Please check the errors and try again";
      } else {
        messageInvalid.value =
          errorData.message ||
          "Failed to send OTP. Please check your phone number";
      }
      snackbar.value = true;
    }
  } catch (error: any) {
    messageInvalid.value =
      "Network error. Please check your connection and try again";
    snackbar.value = true;
  } finally {
    isLoadingForgetPassword.value = false;
  }
};

// Step 2: Verify OTP for forget password (FIXED)
const verifyForgetPasswordOTP = async () => {
  try {
    errors.value = {};
    messageInvalid.value = "";
    snackbar.value = false;
    isLoadingForgetPassword.value = true;

    if (!forgetPasswordForm.value.otp_code) {
      errors.value.otp_code = "OTP code is required";
      snackbar.value = true;
      return;
    }

    // FIXED: Use correct endpoint for verifying OTP
    const response = await fetch(
      "https://elegantchic.me/api/customer/verify-otp-code",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: forgetPasswordForm.value.phone_number,
          otp_code: forgetPasswordForm.value.otp_code,
        }),
      }
    );

    if (response.ok) {
      messageInvalid.value =
        "OTP verified successfully! Please set your new password";
      snackbar.value = true;
      forgetPasswordStep.value = 3;
    } else {
      const errorData = await response.json();
      if (errorData.errors) {
        errors.value = errorData.errors;
        messageInvalid.value = "Invalid OTP code. Please check and try again";
      } else {
        messageInvalid.value =
          errorData.message || "Invalid OTP code. Please try again";
      }
      snackbar.value = true;
    }
  } catch (error: any) {
    messageInvalid.value =
      "Network error. Please check your connection and try again";
    snackbar.value = true;
  } finally {
    isLoadingForgetPassword.value = false;
  }
};

// Step 3: Reset password (ALREADY CORRECT)
const resetPassword = async () => {
  try {
    errors.value = {};
    messageInvalid.value = "";
    snackbar.value = false;
    isLoadingForgetPassword.value = true;

    // Validate password
    if (!forgetPasswordForm.value.password) {
      errors.value.password = "New password is required";
      snackbar.value = true;
      return;
    }

    if (forgetPasswordForm.value.password.length < 8) {
      errors.value.password = "Password must be at least 8 characters long";
      snackbar.value = true;
      return;
    }

    if (
      forgetPasswordForm.value.password !==
      forgetPasswordForm.value.password_confirmation
    ) {
      errors.value.password_confirmation = "Passwords do not match";
      snackbar.value = true;
      return;
    }

    // Use correct endpoint for resetting password
    const response = await fetch(
      "https://elegantchic.me/api/customer/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: forgetPasswordForm.value.phone_number,
          password: forgetPasswordForm.value.password,
          password_confirmation: forgetPasswordForm.value.password_confirmation,
        }),
      }
    );

    if (response.ok) {
      messageInvalid.value =
        "Password reset successfully! You can now login with your new password";
      snackbar.value = true;
      closeForgetPasswordDialog();
      tab.value = "login";
    } else {
      const errorData = await response.json();
      if (errorData.errors) {
        errors.value = errorData.errors;
        messageInvalid.value = "Please check the errors and try again";
      } else {
        messageInvalid.value =
          errorData.message || "Failed to reset password. Please try again";
      }
      snackbar.value = true;
    }
  } catch (error: any) {
    messageInvalid.value =
      "Network error. Please check your connection and try again";
    snackbar.value = true;
  } finally {
    isLoadingForgetPassword.value = false;
  }
};

// Resend OTP for forget password (FIXED)
const resendForgetPasswordOTP = async () => {
  await sendForgetPasswordOTP();
};
</script>

<template>
  <!-- <v-parallax height="100vh" src="/backgrounds/bg-login.jpeg"> -->
  <v-parallax
    height="100vh"
    src="https://static.vecteezy.com/system/resources/previews/030/640/011/large_2x/modern-men-fashion-in-retail-boutique-store-free-photo.jpg"
    class="relative"
  >
    <!-- Dark + Blur Overlay -->
    <div class="absolute inset-0 bg-black/25 backdrop-blur-md"></div>

    <!-- Content -->
    <div
      class="d-flex flex-column align-center justify-center fill-height text-white relative"
    >
      <v-card
        class="pa-6"
        elevation="8"
        min-width="400"
        style="
          background-color: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
        "
      >
        <v-tabs
          v-model="tab"
          background-color="transparent"
          class="justify-center"
          grow
        >
          <v-tab class="mr-10" value="login">LOGIN</v-tab>
          <v-tab value="register">REGISTER</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
          <!-- Login Form -->
          <v-tabs-window-item value="login">
            <v-card-text>
              <v-form @submit.prevent="handleLogin">
                <v-text-field
                  v-model="loginStore.user.phone_number"
                  class="text-white blur-input"
                  label="Phone Number"
                  prepend-inner-icon="mdi-phone"
                  variant="underlined"
                  :error-messages="errors.username"
                  @keypress="onlyPhoneChars"
                  @input="sanitizePhoneInput"
                  @paste.prevent
                />

                <v-text-field
                  v-model="loginStore.user.password"
                  label="Password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock"
                  variant="underlined"
                  class="text-white blur-input"
                  :error-messages="errors.password"
                >
                  <template #append-inner>
                    <v-btn
                      :icon="showLoginPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      variant="text"
                      size="small"
                      @click="showLoginPassword = !showLoginPassword"
                      style="color: rgba(255, 255, 255, 0.8)"
                    />
                  </template>
                </v-text-field>

                <v-btn
                  variant="text"
                  class="text-white !underline"
                  @click="openForgetPasswordDialog"
                >
                  Forgot password?
                </v-btn>
                <v-btn
                  type="submit"
                  block
                  color="primary"
                  class="mt-4"
                  :loading="loginStore.isSpinning"
                >
                  LOGIN
                </v-btn>
              </v-form>
            </v-card-text>
          </v-tabs-window-item>

          <!-- Register Form -->
          <v-tabs-window-item value="register">
            <v-card-text>
              <v-form @submit.prevent="handlerRegister">
                <v-text-field
                  v-model="registerStore.user.first_name"
                  label="First Name"
                  prepend-inner-icon="basil:user-solid"
                  variant="underlined"
                  class="text-white blur-input"
                  :error-messages="errors.first_name"
                />
                <v-text-field
                  v-model="registerStore.user.last_name"
                  label="Last Name"
                  prepend-inner-icon="mdi-account"
                  variant="underlined"
                  class="text-white blur-input"
                  :error-messages="errors.last_name"
                />

                <v-text-field
                  v-model="registerStore.user.email"
                  label="Email"
                  type="email"
                  prepend-inner-icon="dashicons:email-alt"
                  variant="underlined"
                  class="text-white blur-input"
                  :error-messages="errors.email"
                  :rules="[emailRule]"
                />

                <v-text-field
                  v-model="registerStore.user.phone_number"
                  label="Phone Number"
                  prepend-inner-icon="mdi-cellphone"
                  variant="underlined"
                  class="text-white blur-input"
                  :error-messages="errors.phone_number"
                  @keypress="onlyPhoneChars"
                  @input="sanitizePhoneInput"
                  @paste.prevent
                />

                <v-text-field
                  v-model="registerStore.user.password"
                  label="Password (min. 8 characters)"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi:password"
                  variant="underlined"
                  class="text-white blur-input"
                  :error-messages="errors.password"
                >
                  <template #append-inner>
                    <v-btn
                      :icon="showRegisterPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      variant="text"
                      size="small"
                      @click="showRegisterPassword = !showRegisterPassword"
                      style="color: rgba(255, 255, 255, 0.8)"
                    />
                  </template>
                </v-text-field>
                <v-text-field
                  v-model="registerStore.user.password_confirmation"
                  label="Confirm Password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-shield-key"
                  variant="underlined"
                  class="text-white blur-input"
                  :error-messages="errors.password_confirmation"
                >
                  <template #append-inner>
                    <v-btn
                      :icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      variant="text"
                      size="small"
                      @click="showConfirmPassword = !showConfirmPassword"
                      style="color: rgba(255, 255, 255, 0.8)"
                    />
                  </template>
                </v-text-field>
                <v-btn
                  block
                  color="primary"
                  class="mt-4"
                  type="submit"
                  :loading="registerStore.isSpinning"
                >
                  REGISTER
                </v-btn>
              </v-form>
            </v-card-text>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>

      <!-- Snackbar -->
      <v-snackbar
        timeout="3000"
        :color="
          messageInvalid.includes('successful') ||
          messageInvalid.includes('completed') ||
          messageInvalid.includes('sent') ||
          messageInvalid.includes('verified') ||
          messageInvalid.includes('reset')
            ? 'success'
            : 'error'
        "
        location="top center"
        v-model="snackbar"
      >
        {{ messageInvalid || "ឈ្មោះនិងពាកសម្ងាត់មិនត្រឹមត្រូវទេ" }}
        <template v-slot:actions>
          <v-btn
            icon="ic:round-close"
            color="white"
            variant="text"
            @click="snackbar = false"
          />
        </template>
      </v-snackbar>

      <!-- OTP Verification Dialog -->
      <v-dialog v-model="dialogOTP" width="400" persistent>
        <v-card class="bg-grey pa-5">
          <v-card-title class="text-center text-white">
            OTP Verification
          </v-card-title>

          <v-form @submit.prevent="handleOTPVerification">
            <v-text-field
              v-model="otpStore.otpRequest.phone_number"
              class="text-white blur-input"
              label="Phone Number"
              prepend-inner-icon="mdi-phone"
              variant="underlined"
              readonly
              :error-messages="errors.phone_number"
            />

            <v-text-field
              v-model="otpStore.otpRequest.otp_code"
              label="Enter OTP Code"
              prepend-inner-icon="mdi-shield-key"
              variant="underlined"
              class="text-white blur-input"
              :error-messages="errors.otp_code"
              placeholder="Enter the OTP code"
            >
              <template #append-inner>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click="requestOTP"
                  :loading="otpStore.isSpinning"
                >
                  Request OTP
                </v-btn>
              </template>
            </v-text-field>

            <div class="flex justify-evenly">
              <v-btn color="red" @click="closeOTPDialog()"> Cancel </v-btn>
              <v-btn
                type="submit"
                color="primary"
                :loading="otpStore.isSpinning"
              >
                Verify OTP
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-dialog>

      <!-- Forget Password Dialog -->
      <v-dialog v-model="forgetPasswordDialog" width="450" persistent>
        <v-card
          class="pa-6"
          style="
            background-color: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
          "
        >
          <v-card-title class="text-center text-white mb-4">
            <v-icon class="mr-2">mdi-lock-reset</v-icon>
            Reset Password
          </v-card-title>

          <!-- Step 1: Enter Phone Number -->
          <div v-if="forgetPasswordStep === 1">
            <v-card-subtitle class="text-white text-center mb-4">
              Enter your phone number to receive an OTP
            </v-card-subtitle>

            <v-form @submit.prevent="sendForgetPasswordOTP">
              <v-text-field
                v-model="forgetPasswordForm.phone_number"
                class="text-white blur-input"
                label="Phone Number"
                prepend-inner-icon="mdi-phone"
                variant="underlined"
                :error-messages="errors.phone_number"
                placeholder="Enter your phone number"
                @keypress="onlyPhoneChars"
                @input="sanitizePhoneInput"
                @paste.prevent
              />

              <div class="d-flex gap-2 mt-4">
                <v-btn
                  type="submit"
                  color="primary"
                  class="flex-1"
                  :loading="isLoadingForgetPassword"
                >
                  Send OTP
                </v-btn>

                <v-btn
                  color="grey"
                  variant="outlined"
                  class="flex-1"
                  @click="closeForgetPasswordDialog"
                >
                  Cancel
                </v-btn>
              </div>
            </v-form>
          </div>

          <!-- Step 2: Enter OTP -->
          <div v-if="forgetPasswordStep === 2">
            <v-card-subtitle class="text-white text-center mb-4">
              Enter the OTP sent to {{ forgetPasswordForm.phone_number }}
            </v-card-subtitle>

            <v-form @submit.prevent="verifyForgetPasswordOTP">
              <v-text-field
                v-model="forgetPasswordForm.otp_code"
                label="Enter OTP Code"
                prepend-inner-icon="mdi-shield-key"
                variant="underlined"
                class="text-white blur-input"
                :error-messages="errors.otp_code"
                placeholder="Enter the OTP code"
              >
                <template #append-inner>
                  <v-btn
                    size="small"
                    variant="text"
                    color="primary"
                    @click="resendForgetPasswordOTP"
                    :loading="isLoadingForgetPassword"
                  >
                    Resend
                  </v-btn>
                </template>
              </v-text-field>

              <div class="d-flex gap-2 mt-4">
                <v-btn
                  type="submit"
                  color="warning"
                  class="flex-1"
                  :loading="isLoadingForgetPassword"
                >
                  Verify OTP
                </v-btn>

                <v-btn
                  color="grey"
                  variant="outlined"
                  class="flex-1"
                  @click="forgetPasswordStep = 1"
                >
                  = Back
                </v-btn>
              </div>
            </v-form>
          </div>

          <!-- Step 3: Set New Password -->
          <div v-if="forgetPasswordStep === 3">
            <v-card-subtitle class="text-white text-center mb-4">
              Set your new password
            </v-card-subtitle>

            <v-form @submit.prevent="resetPassword">
              <v-text-field
                v-model="forgetPasswordForm.password"
                label="New Password (min. 8 characters)"
                :type="showNewPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                variant="underlined"
                class="text-white blur-input"
                :error-messages="errors.password"
              >
                <template #append-inner>
                  <v-btn
                    :icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    variant="text"
                    size="small"
                    @click="showNewPassword = !showNewPassword"
                    style="color: rgba(255, 255, 255, 0.8)"
                  />
                </template>
              </v-text-field>

              <v-text-field
                v-model="forgetPasswordForm.password_confirmation"
                label="Confirm New Password"
                :type="showConfirmNewPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-shield-key"
                variant="underlined"
                class="text-white blur-input"
                :error-messages="errors.password_confirmation"
              >
                <template #append-inner>
                  <v-btn
                    :icon="showConfirmNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    variant="text"
                    size="small"
                    @click="showConfirmNewPassword = !showConfirmNewPassword"
                    style="color: rgba(255, 255, 255, 0.8)"
                  />
                </template>
              </v-text-field>

              <div class="d-flex gap-2 mt-4">
                <v-btn
                  type="submit"
                  color="success"
                  class="flex-1"
                  :loading="isLoadingForgetPassword"
                >
                  Reset Password
                </v-btn>

                <v-btn
                  color="grey"
                  variant="outlined"
                  class="flex-1"
                  @click="forgetPasswordStep = 2"
                >
                  Back
                </v-btn>
              </div>
            </v-form>
          </div>
        </v-card>
      </v-dialog>
    </div>
  </v-parallax>
</template>

<style scoped>
.v-tab {
  font-weight: bold;
  color: white !important;
}

.v-card-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Custom blur input styling */
.blur-input :deep(.v-field__field) {
  background-color: transparent !important;
}

.blur-input :deep(.v-field__input) {
  background-color: transparent !important;
  color: white !important;
}

.blur-input :deep(.v-field__input input) {
  background-color: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.blur-input :deep(.v-field__input input::placeholder) {
  color: rgba(255, 255, 255, 0.6) !important;
}

.blur-input :deep(.v-label) {
  color: white !important;
}

.blur-input :deep(.v-field__underlay) {
  background-color: transparent !important;
}

/* Focus state */
.blur-input :deep(.v-field--focused .v-field__field) {
  background-color: rgba(255, 255, 255, 0) !important;
}

/* Icons styling */
.blur-input :deep(.v-field__prepend-inner .v-icon) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.blur-input :deep(.v-field__append-inner .v-icon) {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* Error messages styling */
.blur-input :deep(.v-messages__message) {
  color: #ff5252 !important;
}

/* Enhanced Chrome / Edge / Safari autofill override */
.blur-input :deep(input:-webkit-autofill),
.blur-input :deep(input:-webkit-autofill:hover),
.blur-input :deep(input:-webkit-autofill:focus),
.blur-input :deep(input:-webkit-autofill:active) {
  -webkit-box-shadow: none !important;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.9) !important;
  caret-color: white !important;
  border-radius: inherit !important;
  transition: background-color 0s !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

/* Firefox autofill */
.blur-input :deep(input:-internal-autofill-selected) {
  background-color: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
  background-image: none !important;
}

/* Additional autofill state overrides */
.blur-input :deep(input:-webkit-autofill-strong-password) {
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  box-shadow: 0 0 0 1000px transparent inset !important;
  background-color: transparent !important;
}

/* Force transparency on all possible autofill states */
.blur-input :deep(input) {
  background-color: transparent !important;
  background-image: none !important;
}

/* Override any Vuetify autofill styling */
.blur-input :deep(.v-field--variant-filled .v-field__overlay),
.blur-input :deep(.v-field--variant-outlined .v-field__overlay) {
  background-color: transparent !important;
}

/* Ensure no background on the field wrapper */
.blur-input :deep(.v-field) {
  background-color: transparent !important;
}

/* Additional state-specific overrides */
.blur-input :deep(input:autofill) {
  background-color: transparent !important;
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important; /* Safari/Chrome */
  box-shadow: 0 0 0 1000px transparent inset !important;         /* Standard for other browsers */
}

/* Force override with immediate effect */
.blur-input :deep(input:-webkit-autofill) {
  background: transparent !important;
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
  background-image: none !important;
  -webkit-background-clip: text !important;
}

/* Additional aggressive override for persistent cases */
.blur-input :deep(input[autocomplete]),
.blur-input :deep(input[data-com-onepassword-filled]),
.blur-input :deep(input[data-lastpass-autofill]) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
}
</style>
