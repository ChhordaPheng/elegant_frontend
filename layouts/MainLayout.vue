<script setup>
import { useDisplay } from "vuetify";

const drawer = ref(false);
const group = ref(null);
const dialog = ref(false);
const activeButton = ref("login");
const display = useDisplay();
const { smAndDown } = display;
const SiteInfoStore = useSiteInfoStore();
const { site_info } = storeToRefs(SiteInfoStore);

const menus = [
  { title: "HOME", value: "home", path: "/" },
  { title: "WOMAN", value: "woman", path: "/woman" },
  { title: "MAN", value: "man", path: "/man" },
  { title: "ABOUT US", value: "about_us", path: "/about-us" },
  { title: "CONTACT US", value: "contact_us", path: "/contact-us" },
];

const btnSize = computed(() => (smAndDown.value ? "x-small" : "small"));
const btnDensity = computed(() => (smAndDown.value ? "compact" : "default"));
const avatarSize = computed(() => (smAndDown.value ? 24 : 40));

watch(group, () => {
  drawer.value = false;
});

// SCROLL DETECTION LOGIC
const showAppBar = ref(true);
let lastScrollY = 0;

const handleScroll = () => {
  const currentScroll = window.scrollY;

  // Only hide if scroll is down and not at the top
  if (currentScroll > lastScrollY && currentScroll > 100) {
    showAppBar.value = false;
  } else {
    showAppBar.value = true;
  }

  lastScrollY = currentScroll;
};

const route = useRoute();

watchEffect(() => {
  const match = menus.find((m) => m.path === route.path);
  group.value = match ? match.value : null;
});

onMounted(async () => {
  await SiteInfoStore.fetchSiteInfo();
  window.addEventListener("scroll", handleScroll);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <v-app>
    <v-app-bar
      v-show="showAppBar"
      elevation="2"
      fixed
      app
      class="transition-all duration-300"
      style="z-index: 1000"
    >
      <!-- Burger icon only on mobile -->
      <v-app-bar-nav-icon
        v-if="display.smAndDown.value"
        variant="text"
        @click.stop="drawer = !drawer"
      />

      <v-row class="w-100 d-flex align-center justify-space-between no-gutters">
        <!-- Menu list (desktop only) -->
        <v-col
          cols="6"
          sm="4"
          md="4"
          v-if="!display.smAndDown.value"
        >
          <v-list
            class="d-flex justify-between items-center text-gray-500 font-extrabold bg-transparent"
          >
            <v-list-item
              v-for="menu in menus"
              :key="menu.value"
              :to="menu.path"
              link
              exact
              @click="group = menu.value"
            >
              <v-list-item-title>
                <span
                  class="text-[15px]"
                  :class="{
                    '!text-black font-bold': group === menu.value,
                    'text-gray-400 font-medium': group !== menu.value,
                  }"
                >
                  {{ menu.title }}
                </span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
        <!-- Center: Logo -->
        <v-col cols="3" class="d-flex justify-center align-center">
          <NuxtLink to="/">
            <img class="w-20" :src="site_info.site_logo" />
          </NuxtLink>
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
          <!-- add to cart  -->
          <NuxtLink to="/cart">
            <v-btn
              :size="btnSize"
              :density="btnDensity"
              icon="solar:bag-4-outline"
              variant="elevated"
            />
          </NuxtLink>

          <!-- profile  -->
          <NuxtLink to="/my-account">
            <v-btn
              :size="btnSize"
              :density="btnDensity"
              icon="iconoir:user"
              variant="elevated"
            />
          </NuxtLink>

          <!-- Flag triggers dialog -->
          <div>
            <img
              :style="{
                width: avatarSize + 'px',
                height: avatarSize + 'px',
                cursor: 'pointer',
              }"
              class="rounded-full"
              src="flags/Flag_of_Cambodia.svg.png"
              alt="Cambodian Flag"
              @click="dialog = true"
            />

            <!-- Dialog -->
            <v-dialog v-model="dialog" max-width="400">
              <v-card>
                <v-card-text>
                  <Language />
                </v-card-text>
              </v-card>
            </v-dialog>
          </div>
          <!-- login / register group -->
          <div
            class="bg-gray-200 rounded-full px-1 py-1 flex items-center space-x-1 max-w-full overflow-hidden"
          >
            <NuxtLink to="/login" class="flex-1">
              <v-btn
                block
                :size="btnSize"
                :density="btnDensity"
                class="!text-black !font-semibold"
                rounded
                :variant="activeButton === 'login' ? 'elevated' : 'text'"
                @click="activeButton = 'login'"
              >
                Login
              </v-btn>
            </NuxtLink>

            <NuxtLink to="/login" class="flex-1">
              <v-btn
                block
                :size="btnSize"
                :density="btnDensity"
                class="!text-black !font-semibold"
                rounded
                :variant="activeButton === 'register' ? 'elevated' : 'text'"
                @click="activeButton = 'register'"
              >
                Register
              </v-btn>
            </NuxtLink>
          </div>
        </v-col>
      </v-row>
    </v-app-bar>

    <!-- Sidebar Menu (only on mobile) - Fixed positioning and height -->
    <v-navigation-drawer
      v-model="drawer"
      location="left"
      temporary
      app
      fixed
      class="h-screen"
      style="
        height: 100vh !important;
        position: fixed !important;
        z-index: 1001;
      "
      v-if="display.smAndDown.value"
    >
      <v-list>
        <v-list-item
          v-for="menu in menus"
          :key="menu.value"
          :to="menu.path"
          link
          exact
          :value="menu.value"
          @click="group = menu.value"
        >
          <v-list-item-title>{{ menu.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main content area with proper scrolling -->
    <v-main class="overflow-auto" style="height: 100vh; padding-top: 64px">
      <div class="h-full overflow-y-auto">
        <NuxtPage />
        <Footer />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Ensure proper scrolling behavior */
.v-main {
  height: 100vh;
  overflow: hidden;
}

.v-main > div {
  height: 100%;
  overflow-y: auto;
}

/* Fix for navigation drawer */
.v-navigation-drawer {
  position: fixed !important;
  height: 100vh !important;
  z-index: 1001 !important;
}
</style>
