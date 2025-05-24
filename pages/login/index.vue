<!-- <script setup lang="ts">

definePageMeta({
  layout: "login-layout",
});
interface Errors {
  username?: string;
  password?: string;
}
const snackbar = ref<boolean>(false);
const isSpinning = ref<boolean>(false);
const showPassword = ref<boolean>(true);
const loginStore = useLoginStore();
const siteInfoStore = useSiteInfoStore();
const errors = ref<Errors>({});
const messageInvalid = ref<string>("");
async function handleLogin() {
  try {
    siteInfoStore.isSpinning = true;
    errors.value = {};
    messageInvalid.value = "";
    snackbar.value = false;

    if (!loginStore.user.user_name) {
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

    if (response && response.data) {
      console.log("Login successful:", response.data);
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
  } finally {
    siteInfoStore.isSpinning = false;
  }
}


const PasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

</script>

<template>
  <div class="h-screen w-full flex flex-col border">
    <div class="cloudsLogo flex items-center justify-center flex-col">
      <div class="wrapImage mt-5">
        <v-img
          width="241"
          height="135"
          src="public/"
        />
      </div>
    </div>

    <div class="flex items-center justify-center p-0 m-0 w-full flex-col">
      <div class="w-full d-flex items-center justify-center flex-col py-3">
        <span class="text-[#18A2DD] text-[48px] text-center font-bold">
          {{ $t("form.welcome") }}
        </span>
      </div>
      <div class="wrap-form w-full md:w-full px-5 md:px-0">
        <v-form @submit.prevent="handleLogin">
          <v-row class="wrap-btn w-full items-center justify-between py-3">
            <v-col class="12">
              <v-btn
                block
                minHeight="55"
                color="#069BDA"
                class="btn-login !capitalize sm:!text-[16px] md:!text-[25px] lg:!text-[16px] md:!rounded-lg"
              >
                {{ $t("form.login_system") }}
              </v-btn>
            </v-col>
            <v-col class="px-0">
              <v-btn
                block
                minHeight="55"
                variant="outlined"
                class="btn-register !capitalize mx-2 !border-[#069BDA]"
              >
                {{ $t("form.register") }}
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field
                :label="$t('form.username')"
                class="username-label"
                v-model="loginStore.user.user_name"
                variant="outlined"
                :error-messages="
                  errors.username ? [$t('form.username_is_required')] : []
                "
              >
                <template #prepend-inner>
                  <v-icon :icon="aliases.user"></v-icon>
                </template>
              </v-text-field>
            </v-col>  
            <v-col cols="12">
              <v-text-field
                @click:append-inner="PasswordVisibility"
                class="password-label custom-password-field"
                :label="$t('form.password')"
                :append-inner-icon="
                  showPassword ? 'mdi-light:eye' : 'ph:eye-slash-light'
                "
                :type="showPassword ? 'password' : 'text'"
                v-model="loginStore.user.password"
                variant="outlined"
                :error-messages="
                  errors.password ? [$t('form.password_is_required')] : []
                "
              >
                <template #prepend-inner>
                  <v-icon :icon="aliases.key"></v-icon>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <div class="border-b-2 py-5">
            <v-btn
              :loading="siteInfoStore.isSpinning"
              color="#069BDA"
              minHeight="55"
              class="btn-submit sign-in w-full sm:mb-0 md:mb-10 lg:mb-3"
              type="submit"
            >
              {{ $t("form.login") }}
            </v-btn>
          </div>
        </v-form>

        <div>
          <v-snackbar
            timeout="2000"
            color="#D3EEF9"
            location="top center"
            v-model="snackbar"
          >
            {{ $t("notification.username_password_in_correct") }}
            <template v-slot:actions>
              <v-btn color="red" variant="text" @click="snackbar = false">
                {{ $t("notification.close") }}
              </v-btn>
            </template>
          </v-snackbar>
        </div>
      </div>
    </div>

    <div class="mt-auto h-auto w-full max-w-full">
      <v-row class="pa-0 ma-0 w-full max-w-full">
        <v-col class="pa-0 ma-0 w-full max-w-full" cols="12">
          <div class="container w-full max-w-full h-[100px]">
            <div class="curved w-full max-w-full"></div>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<style>
.cloudsLogo {
  background-image: url(/icons/cloud.png), url(/icons/cloud.png),
    url(/icons/cloud.png), url(/icons/cloud.png);
  background-size: 40px, 40px, 140px, 40px;
  background-position: 1% 65%, 10% 15%, 75% 60%, 92% 25%;
  min-height: 100px;
}
.container {
  position: relative;
  width: 100%;
  background-color: #3498db;
}

.curved {
  position: absolute;
  width: 100%;
  height: 90px;
  background-color: rgb(255, 255, 255);
  border-bottom-left-radius: 80%;
  border-bottom-right-radius: 100%;
}
.v-input__details {
  padding: 0 !important;
}
.password.v-input__details {
  margin-bottom: 15px !important;
  padding: 0 !important;
}
@media screen and (max-width: 1024px) {
  .cloudsLogo {
    background-image: url(/icons/cloud.png), url(/icons/cloud.png),
      url(/icons/cloud.png), url(/icons/cloud.png);
    background-size: 40px, 40px, 140px, 40px;
    background-position: 1% 65%, 10% 15%, 60% 41%, 92% 25%;
  }
  .btn-submit,
  .btn-register,
  .btn-login {
    height: 80px !important;
    font-size: 30px !important;
  }
  .username-label input,
  .password-label input {
    padding: 1.5rem;
    font-size: 2rem;
    margin-top: 15px;
  }
}
@media screen and (max-width: 640px) {
  .cloudsLogo {
    background-image: url(/icons/cloud.png), url(/icons/cloud.png),
      url(/icons/cloud.png), url(/icons/cloud.png);
    background-size: 40px, 40px, 140px, 40px;
    background-position: 1% 65%, 10% 15%, 72% 41%, 92% 25%;
  }
  .btn-submit,
  .btn-register,
  .btn-login {
    height: 55px !important;
    font-size: 16px !important;
  }
  .username-label input,
  .password-label input {
    padding: 1rem;
    font-size: 1rem;
    margin-top: 0px;
  }
}

.v-text-field input:focus,
.v-text-field input:active {
  --tw-ring-shadow: none !important;
}
</style> -->
<template>
  <div>
    hehe
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>