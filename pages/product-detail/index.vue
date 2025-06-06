<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon v-if="isMobile" @click="drawer = !drawer" />
      <v-toolbar-title>My App</v-toolbar-title>
    </v-app-bar>

    <!-- Navigation Drawer: only shown on mobile -->
    <v-navigation-drawer v-if="isMobile" v-model="drawer" temporary app>
      <v-list>
        <v-list-item title="Home" />
        <v-list-item title="About" />
        <v-list-item title="Contact" />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
        <h1>Welcome</h1>
        <p>The sidebar only appears on mobile screens.</p>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDisplay } from "vuetify";
definePageMeta({
  layout: "shop",
});
const { mdAndDown } = useDisplay();
const isMobile = computed(() => mdAndDown.value);

const drawer = ref(false);
</script>
