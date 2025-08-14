<script setup lang="ts">
definePageMeta({
  layout: "login-layout",
});

const tab = ref("register");
const activeButton = computed(() => tab.value);
const snackbar = ref<boolean>(false);
const errors = ref<Record<string, string>>({});
const messageInvalid = ref("");
const dialog = ref<boolean>(false);

// Password visibility toggles
const showLoginPassword = ref<boolean>(false);
const showRegisterPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);

const loginStore = useLoginStore();
const registerStore = useRegisterStore();
const otpStore = useOtpRequestStore();
type Errors = Record<string, string>;

const handleLogin = async () => {
  try {
    errors.value = {};
    messageInvalid.value = "";
    snackbar.value = false;

    if (!loginStore.user.phone_number) {
      errors.value.username = "Username is required";
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
    } else {
      messageInvalid.value = "Login failed. Please try again.";
      snackbar.value = true;
    }
  } catch (error: any) {
    if (error?.response?.data?.errors) {
      errors.value = error.response.data.errors as Errors;
    } else if (error?.response?.data?.error) {
      messageInvalid.value = error.response.data.error;
    } else {
      messageInvalid.value = "An unexpected error occurred.";
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
      dialog.value = true;
    }
  } catch (error: any) {
    if (error?.response?.data?.errors) {
      errors.value = error.response.data.errors as Errors;
    } else if (error?.response?.data?.error) {
      messageInvalid.value = error.response.data.error;
    } else {
      messageInvalid.value = "An unexpected error occurred.";
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
      dialog.value = false;
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
  dialog.value = false;
  otpStore.otpRequest.otp_code = "";
};
</script>

<template>
  <v-parallax height="100vh" src="/backgrounds/bg-login.jpeg">
    <div
      class="d-flex flex-column align-center justify-center fill-height text-white"
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
          <v-tabs-window-item value="login">
            <v-card-text>
              <!-- Login Form -->
              <v-form @submit.prevent="handleLogin">
                <v-text-field
                  v-model="loginStore.user.phone_number"
                  class="text-white blur-input"
                  label="Phone Number"
                  prepend-inner-icon="mdi-phone"
                  variant="underlined"
                  :error-messages="errors.username"
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
                  type="submit"
                  block
                  color="warning"
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
                />
                <v-text-field
                  v-model="registerStore.user.phone_number"
                  label="Phone Number"
                  prepend-inner-icon="mdi-cellphone"
                  variant="underlined"
                  class="text-white blur-input"
                  :error-messages="errors.phone_number"
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
                  color="warning"
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

      <!-- Snackbar for messages -->
      <v-snackbar
        timeout="3000"
        :color="
          messageInvalid.includes('successful') ||
          messageInvalid.includes('completed') ||
          messageInvalid.includes('sent')
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
          >
          </v-btn>
        </template>
      </v-snackbar>

      <!-- OTP Verification Dialog -->
      <v-dialog v-model="dialog" width="400" persistent>
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

            <div class="d-flex gap-2 mt-4">
              <v-btn
                type="submit"
                color="warning"
                block
                :loading="otpStore.isSpinning"
              >
                Verify OTP
              </v-btn>

              <v-btn color="grey" variant="outlined" @click="closeOTPDialog">
                Cancel
              </v-btn>
            </div>
          </v-form>
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
</style>
