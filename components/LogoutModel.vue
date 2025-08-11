<script setup lang="ts">
const authenticated = useLoginStore();

// Define model for dialog visibility
const showLogout = defineModel<boolean>('showLogout', { default: false });

const router = useRouter();

// Clear all cookies and redirect to login
const clearCookies = async () => {
  // Clear all cookies
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [name] = cookie.split('=');
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Reset Pinia store
  authenticated.$reset();
  
  // Close dialog
  showLogout.value = false;
  
  // Redirect to login
  router.push('/login');
};

const cancelLogout = () => {
  showLogout.value = false;
};
</script>

<template>
  <v-dialog v-model="showLogout" max-width="430">
    <template #default="{ isActive }">
      <v-card class="text-center rounded-lg">
        <v-card-title class="text-red mt-5">
          <span class="uppercase">{{ $t('content.log_out') || 'Log Out' }}</span>
        </v-card-title>

        <v-card-text>
          {{ $t('content.wanna_log_out') || 'Are you sure you want to log out?' }}
        </v-card-text>

        <v-card-actions>
          <v-row class="justify-center my-5">
            <v-btn
              variant="tonal"
              color="red-darken-2"
              class="!capitalize mx-2"
              @click="cancelLogout"
            >
              {{ $t('buttons.cancel') || 'Cancel' }}
            </v-btn>
            <v-btn
              variant="tonal"
              color="blue-darken-2"
              class="!capitalize mx-2"
              @click="clearCookies"
            >
              {{ $t('buttons.ok') || 'OK' }}
            </v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>