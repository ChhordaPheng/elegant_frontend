<script setup lang="ts">
definePageMeta({
  layout: "login-layout",
});

const tab = ref("register");

const activeButton = computed(() => tab.value);
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
              <v-text-field
                class="text-white blur-input"
                label="Phone Number"
                prepend-inner-icon="mdi-phone"
                variant="underlined"
              />

              <v-text-field
                label="OTP"
                prepend-inner-icon="mdi-lock"
                variant="underlined"
                class="text-white blur-input"
              />
              <v-btn block color="warning" class="mt-4">LOGIN</v-btn>
            </v-card-text>
          </v-tabs-window-item>

          <!-- Register Form -->
          <v-tabs-window-item value="register">
            <v-card-text>
              <v-text-field
                label="Phone Number"
                prepend-inner-icon="mdi-cellphone"
                variant="underlined"
                class="text-white blur-input"
              />
              <v-text-field
                label="User Name"
                prepend-inner-icon="mdi-account"
                variant="underlined"
                class="text-white blur-input"
              />
              <v-text-field
                label="OTP"
                prepend-inner-icon="mdi-shield-key"
                variant="underlined"
                class="text-white blur-input"
              >
                <template #append-inner>
                  <v-btn size="small" variant="text" color="white"
                    >Request OTP</v-btn
                  >
                </template>
              </v-text-field>

              <v-btn block color="warning" class="mt-4">REGISTER</v-btn>
            </v-card-text>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
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
  color: rgba(255, 255, 255, 0.1) !important;
}

.blur-input :deep(.v-field__input input::placeholder) {
  color: rgba(255, 255, 255, 0.1) !important;
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
</style>
