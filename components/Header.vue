<script setup>
import { ref, watch } from "vue";
import { useDisplay } from "vuetify";

const drawer = ref(false);
const group = ref(null);
const activeButton = ref("login");
const display = useDisplay();
const { smAndDown } = useDisplay(); // true on xs & sm screens (< 960 px)

const items = [
  { title: "HOME", value: "home" },
  { title: "WOMAN", value: "woman" },
  { title: "MAN", value: "man" },
  { title: "ABOUT US", value: "about_us" },
  { title: "CONTACT US", value: "contact-us" },
];

const btnSize = computed(() => (smAndDown.value ? "x-small" : "small"));
const btnDensity = computed(() => (smAndDown.value ? "compact" : "default"));
const avatarSize = computed(() => (smAndDown.value ? 24 : 40));
watch(group, () => {
  drawer.value = false;
});
</script>

<template>
  <v-card class="w-100">
    <v-layout class="w-100">
      <v-app-bar>
        <!-- Burger icon only on mobile -->
        <v-app-bar-nav-icon
          v-if="display.smAndDown.value"
          variant="text"
          @click.stop="drawer = !drawer"
        />

        <v-row class="w-100 d-flex align-center justify-space-between">
          <!-- Menu list (desktop only) -->
          <v-col
            cols="6"
            sm="4"
            md="4"
            class="mt-2"
            v-if="!display.smAndDown.value"
          >
            <v-list
              class="d-flex justify-between items-center text-gray-500 font-extrabold"
            >
              <v-list-item
                v-for="item in items"
                :key="item.value"
                :value="item.value"
                @click="group = item.value"
              >
                <v-list-item-title>
                  <p
                    class="text-[15px] cursor-pointer"
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

          <!-- Center: Logo -->
          <v-col cols="3" class="d-flex justify-center align-center">
            <img class="w-20" src="logo/logo.png" />
          </v-col>

          <!-- Right: Search, Cart, User, Language, Login/Register -->
          <v-col
            cols="9"
            sm="7"
            md="10"
            lg="4"
            class="text-center d-flex justify-evenly align-center"
          >
            <!-- icon buttons -->
            <v-btn
              :size="btnSize"
              :density="btnDensity"
              icon="line-md:search"
              variant="elevated"
            />
            <v-btn
              :size="btnSize"
              :density="btnDensity"
              icon="solar:bag-4-outline"
              variant="elevated"
            />
            <v-btn
              :size="btnSize"
              :density="btnDensity"
              icon="iconoir:user"
              variant="elevated"
            />

            <!-- flag -->
            <v-avatar :size="avatarSize" variant="elevated">
              <img class="size-10" src="flags/Flag_of_Cambodia.svg.png" />
            </v-avatar>

            <!-- login / register group -->
            <div class="bg-gray-200 !p-[7px] rounded-full">
              <v-btn
                :size="btnSize"
                :density="btnDensity"
                class="!text-black !font-semibold"
                rounded
                :variant="activeButton === 'login' ? 'elevated' : 'text'"
                @click="activeButton = 'login'"
              >
                Login
              </v-btn>

              <v-btn
                :size="btnSize"
                :density="btnDensity"
                class="ml-2 !text-black !font-semibold"
                rounded
                :variant="activeButton === 'register' ? 'elevated' : 'text'"
                @click="activeButton = 'register'"
              >
                Register
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-app-bar>

      <!-- Sidebar Menu (only on mobile) -->
      <v-navigation-drawer
        v-model="drawer"
        location="left"
        temporary
        v-if="display.smAndDown.value"
      >
        <v-list>
          <v-list-item
            v-for="item in items"
            :key="item.value"
            :value="item.value"
            @click="group = item.value"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <NuxtPage />
      </v-main>
    </v-layout>
  </v-card>
</template>
