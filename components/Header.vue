<script setup>
import { ref, watch } from "vue";
import { useDisplay } from "vuetify";

const drawer = ref(false);
const group = ref(null);
const activeButton = ref("login");

const items = [
  { title: "HOME", value: "home" },
  { title: "WOMAN", value: "woman" },
  { title: "MAN", value: "man" },
  { title: "ABOUT US", value: "about_us" },
  { title: "CONTACT US", value: "contact-us" },
];

const display = useDisplay();

watch(group, () => {
  drawer.value = false;
});
</script>
<template>
  <v-card class="w-100">
    <v-layout class="w-100">
      <v-app-bar height="64">
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" />
        <v-row>
          <v-col class="mt-2">
            <v-list
              class="d-flex justify-between items-center text-gray-500 font-extrabold"
            >
              <v-list-item
                v-for="item in items"
                :key="item.value"
                :value="item.value"
              >
                <v-list-item-title>
                  <p
                  class="text-[15px]"
                    :class="{
                      '!text-black font-bold': group === item.value,
                      'text-gray-400 font-medium': group !== item.value,
                    }"
                  >
                    {{ item.title }}
                  </p>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="3" class="d-flex justify-center align-center">
            <img class="size-20" src="logo/logo.png" />
          </v-col>
          <v-col class="text-center d-flex justify-evenly align-center">
            <v-btn size="small" icon="line-md:search" variant="elevated" />
            <v-btn size="small" icon="solar:bag-4-outline" variant="elevated" />
            <v-btn size="small" icon="iconoir:user" variant="elevated" />
            <v-avatar variant="elevated">
              <img class="size-10" src="flags/Flag_of_Cambodia.svg.png" />
            </v-avatar>
            <div class="bg-gray-200 !p-[7px] rounded-full">
              <v-btn
                class="!text-black !font-semibold"
                rounded
                size="small"
                :variant="activeButton === 'login' ? 'elevated' : 'text'"
                @click="activeButton = 'login'"
              >
                Login
              </v-btn>
              <v-btn
                class="ml-2 !text-black !font-semibold"
                rounded
                size="small"
                :variant="activeButton === 'register' ? 'elevated' : 'text'"
                @click="activeButton = 'register'"
              >
                Register
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        :location="display.mobile ? 'left' : undefined"
        temporary
      >
        <v-list :items="items" />
      </v-navigation-drawer>

      <v-main>
        <NuxtPage />
      </v-main>
    </v-layout>
  </v-card>
</template>
<style scoped></style>
