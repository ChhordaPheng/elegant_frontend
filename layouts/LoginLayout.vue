<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
onMounted(async () => {
  const storedLanguage = localStorage.getItem('lang');
  if(storedLanguage){
    locale.value = storedLanguage;
  }
});
</script>
<template>
  <div class="w-full md:w-full lg:w-[430px] mx-auto h-full">
    <v-app>
      <v-main>
        <NuxtPage />
      </v-main>
    </v-app>
  </div>
</template>

<style scoped></style>
