<script setup>
import {
  ref,
  computed,
  watchEffect,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useDisplay } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const drawer = ref(false);
const group = ref(null);
const dialog = ref(false);
const showLogoutDialog = ref(false);
const activeButton = ref("login");
const display = useDisplay();

// Safe access to display properties
const smAndDown = computed(() => display?.smAndDown?.value ?? false);

const SiteInfoStore = useSiteInfoStore();
const { site_info } = storeToRefs(SiteInfoStore);

const userProfileStore = useProfileStore();
const { userProfile } = storeToRefs(userProfileStore);

// Use authentication store with correct property names
const loginStore = useLoginStore();
const { authenticated, user } = storeToRefs(loginStore);

// Initialize reactive values with defaults to prevent undefined errors
const safeIsAuthenticated = computed(() => authenticated?.value ?? false);
const safeUser = computed(() => user?.value ?? {});

// Check if we're in development mode using Nuxt's way
const isDevelopment = computed(() => {
  // Use Nuxt's runtime config or check for dev mode
  if (typeof window !== "undefined") {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.port === "3000"
    );
  }
  return false;
});

const menus = [
  { title: "HOME", value: "home", path: "/" },
  { title: "WOMAN", value: "woman", path: "/woman" },
  { title: "MAN", value: "man", path: "/man" },
  { title: "KID", value: "kid", path: "/kid" },
  { title: "ABOUT US", value: "about_us", path: "/about-us" },
  { title: "CONTACT US", value: "contact_us", path: "/contact-us" },
];

const btnSize = computed(() => (smAndDown.value ? "x-small" : "small"));
const btnDensity = computed(() => (smAndDown.value ? "compact" : "default"));
const avatarSize = computed(() => (smAndDown.value ? 24 : 40));

const route = useRoute();
const router = useRouter();

// Add loading state to prevent UI conflicts during navigation
const isNavigating = ref(false);

// Logout functionality

const handleLogout = () => {
  showLogoutDialog.value = true;
};

const cancelLogout = () => {
  showLogoutDialog.value = false;
};

const performLogout = () => {
  showLogoutDialog.value = false; // Prevent looping

  // Clear auth
  const token = useCookie("accessToken");
  token.value = null;

  localStorage.removeItem("user");
  localStorage.removeItem("auth_token");

  loginStore.authenticated = false;
  loginStore.user = {};
  router.push("/");
};

// Function to get cookie value (for checking auth status)
const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  } catch (error) {
    console.error("Error getting cookie:", error);
    return null;
  }
};

// Check authentication status from cookies
const checkAuthStatus = () => {
  if (typeof window === "undefined") return;

  try {
    // Get the accessToken cookie (this is what your app uses)
    const accessToken = getCookie("accessToken") || useCookie("accessToken").value;

    if (accessToken && accessToken !== "null" && accessToken !== "undefined") {
      // Token exists, user should be authenticated
      if (!safeIsAuthenticated.value) {
        loginStore.authenticated = true;

        // Try to get user data from localStorage or set default
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            loginStore.user = JSON.parse(userData);
          } catch (error) {
            loginStore.user = { name: "User" }; // Fallback
          }
        } else {
          loginStore.user = { name: "User" }; // Default user object
        }
      }
    } else {
      // No token found
      if (safeIsAuthenticated.value) {
        loginStore.authenticated = false;
        loginStore.user = {};
      }
    }
  } catch (error) {
    // Set safe defaults on error
    loginStore.authenticated = false;
    loginStore.user = {};
  }
};

// Enhanced navigation with error handling and loading state
const handleNavigation = async (path, menuValue) => {
  if (isNavigating.value) {
    return;
  }

  try {
    isNavigating.value = true;

    // Close drawer immediately
    drawer.value = false;

    // Set active group
    if (menuValue) {
      group.value = menuValue;
    }

    // Add small delay to let current page cleanup properly
    await nextTick();

    // Navigate programmatically
    await router.push(path);
  } catch (error) {
    // Reset group on error
    const match = menus.find((m) => m.path === route.path);
    group.value = match ? match.value : null;
  } finally {
    // Reset loading state after a short delay
    setTimeout(() => {
      isNavigating.value = false;
    }, 300);
  }
};

// SCROLL DETECTION LOGIC
const showAppBar = ref(true);
let lastScrollY = 0;

const handleScroll = () => {
  if (isNavigating.value) return; // Don't handle scroll during navigation

  try {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScrollY && currentScroll > 100) {
      showAppBar.value = false;
    } else {
      showAppBar.value = true;
    }

    lastScrollY = currentScroll;
  } catch (error) {
    console.error("Error in handleScroll:", error);
  }
};

// Update active menu based on current route - with error handling
watchEffect(() => {
  try {
    const match = menus.find((m) => m.path === route?.path);
    group.value = match ? match.value : null;
  } catch (error) {
    group.value = null;
  }
});

// Watch for route changes - with error handling
watch(
  () => route?.path,
  (newPath, oldPath) => {
    try {
      drawer.value = false;
      isNavigating.value = false; // Reset navigation state on route change
    } catch (error) {
      console.error("Error in route change watcher:", error);
    }
  },
  { immediate: false }
);

// let authCheckInterval: ReturnType<typeof setInterval>;

onMounted(async () => {
  try {
    await SiteInfoStore.fetchSiteInfo();
    await userProfileStore.fetchUserProfile();
    checkAuthStatus();
  } catch (error) {
    console.error("Error fetching site info:", error);
  }
});

onBeforeUnmount(() => {
  try {
    clearInterval(authCheckInterval); // ✅ This will now work correctly
    window.removeEventListener("scroll", handleScroll);
  } catch (error) {
    console.error("Error in cleanup:", error);
  }
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
        v-if="smAndDown"
        variant="text"
        :disabled="isNavigating"
        @click.stop="drawer = !drawer"
      />

      <v-row class="w-100 d-flex align-center justify-space-between no-gutters">
        <!-- Desktop Menu -->
        <v-col cols="6" sm="4" md="4" v-if="!smAndDown">
          <div class="d-flex justify-space-between align-center">
            <button
              v-for="menu in menus"
              :key="menu.value"
              @click="handleNavigation(menu.path, menu.value)"
              :disabled="isNavigating"
              class="nav-button"
              :class="{
                active: group === menu.value,
                inactive: group !== menu.value,
                navigating: isNavigating,
              }"
            >
              <span
                v-if="isNavigating && group === menu.value"
                class="loading-spinner"
              ></span>
              {{ menu.title }}
            </button>
          </div>
        </v-col>

        <!-- Center: Logo -->
        <v-col cols="3" class="d-flex justify-center align-center">
          <button
            @click="handleNavigation('/', 'home')"
            :disabled="isNavigating"
            class="logo-button"
          >
            <img
              class="w-20 transition-opacity duration-200"
              :class="{ 'opacity-50': isNavigating }"
              :src="site_info?.site_logo || '/logo/logo.png'"
              alt="Site Logo"
              @error="$event.target.src = '/logo/logo.png'"
            />
          </button>
        </v-col>

        <!-- Right: Action buttons -->
        <v-col
          cols="9"
          sm="7"
          md="10"
          lg="4"
          class="text-center d-flex justify-evenly align-center"
        >
          <!-- Search button -->
          <v-btn
            :size="btnSize"
            :density="btnDensity"
            icon="line-md:search"
            variant="elevated"
            :disabled="isNavigating"
          />
          <!-- favorite button -->
          <v-btn
            :size="btnSize"
            :density="btnDensity"
            icon="solar:heart-linear"
            variant="elevated"
            :disabled="isNavigating"
            @click="handleNavigation('/favorite', null)"
          />

          <!-- Cart button -->
          <v-btn
            :size="btnSize"
            :density="btnDensity"
            icon="solar:bag-4-outline"
            variant="elevated"
            :disabled="isNavigating"
            @click="handleNavigation('/cart', null)"
          />

          <!-- Profile button -->
          <v-btn
            :size="btnSize"
            :density="btnDensity"
            icon="iconoir:user"
            variant="elevated"
            :disabled="isNavigating"
            @click="handleNavigation('/my-account', null)"
          />

          <!-- Language selector -->
          <div>
            <img
              :style="{
                width: avatarSize + 'px',
                height: avatarSize + 'px',
                cursor: isNavigating ? 'not-allowed' : 'pointer',
                opacity: isNavigating ? 0.5 : 1,
              }"
              class="rounded-full hover:opacity-80 transition-all duration-200"
              src="flags/Flag_of_Cambodia.svg.png"
              alt="Cambodian Flag"
              @click="!isNavigating && (dialog = true)"
            />

            <v-dialog v-model="dialog" max-width="400">
              <v-card>
                <v-card-text>
                  <Language />
                </v-card-text>
              </v-card>
            </v-dialog>
          </div>

          <!-- Authentication buttons -->
          <div
            class="bg-gray-200 rounded-full px-1 py-1 flex items-center space-x-1 max-w-full overflow-hidden"
            :class="{ 'opacity-50': isNavigating }"
          >
            <!-- Show Login/Register when not authenticated -->
            <template v-if="!safeIsAuthenticated">
              <button
                class="auth-btn"
                :class="{ active: activeButton === 'login' }"
                :disabled="isNavigating"
                @click="
                  handleNavigation('/login', null);
                  activeButton = 'login';
                "
              >
                Login
              </button>

              <button
                class="auth-btn"
                :class="{ active: activeButton === 'register' }"
                :disabled="isNavigating"
                @click="
                  handleNavigation('/register', null);
                  activeButton = 'register';
                "
              >
                Register
              </button>
            </template>

            <!-- Show Welcome message and Logout when authenticated -->
            <template v-else>
              <div class="auth-btn text-sm">
                <!-- Hi, {{ userProfile?.last_name || "User" }} -->
                {{ userProfile?.last_name || "User" }}
              </div>

              <button
                class="auth-btn logout-btn"
                :disabled="isNavigating"
                @click="handleLogout"
                title="Logout"
              >
                Logout
              </button>
            </template>
          </div>
        </v-col>
      </v-row>
    </v-app-bar>
    <v-dialog
      v-model="showLogoutDialog"
      max-width="420"
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-xl pa-4" elevation="8">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon color="red" class="mr-2">mdi-logout</v-icon>
          Confirm Logout
        </v-card-title>

        <v-card-text class="text-body-2 text-grey-darken-1">
          Are you sure you want to log out? You’ll need to sign in again to access your
          account.
        </v-card-text>

        <v-card-actions class="justify-end mt-2">
          <v-btn
            variant="tonal"
            color="primary   "
            class="rounded-lg"
            @click="cancelLogout"
          >
            <v-icon start>mdi-close</v-icon>
            Cancel
          </v-btn>

          <v-btn variant="flat" color="red" class="rounded-lg" @click="performLogout">
            <v-icon start>mdi-logout</v-icon>
            Logout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      location="left"
      temporary
      app
      fixed
      v-if="smAndDown"
    >
      <v-list>
        <v-list-item
          v-for="menu in menus"
          :key="menu.value"
          @click="handleNavigation(menu.path, menu.value)"
          :disabled="isNavigating"
          link
          class="mobile-menu-item"
        >
          <v-list-item-title>
            <span
              v-if="isNavigating && group === menu.value"
              class="loading-spinner mr-2"
            ></span>
            {{ menu.title }}
          </v-list-item-title>
        </v-list-item>

        <!-- Mobile authentication options -->
        <template v-if="!safeIsAuthenticated">
          <v-list-item
            @click="
              handleNavigation('/login', null);
              activeButton = 'login';
            "
            :disabled="isNavigating"
            link
            class="mobile-menu-item"
          >
            <v-list-item-title>
              <span v-if="isNavigating" class="loading-spinner mr-2"></span>
              Login
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            @click="
              handleNavigation('/register', null);
              activeButton = 'register';
            "
            :disabled="isNavigating"
            link
            class="mobile-menu-item"
          >
            <v-list-item-title>
              <span v-if="isNavigating" class="loading-spinner mr-2"></span>
              Register
            </v-list-item-title>
          </v-list-item>
        </template>

        <!-- Mobile user info when authenticated -->
        <template v-else>
          <v-list-item class="mobile-menu-item" disabled>
            <v-list-item-title class="text-gray-600">
              Welcome, {{ safeUser?.name || safeUser?.email || "User" }}
            </v-list-item-title>
          </v-list-item>

          <!-- Mobile logout option -->
          <v-list-item
            @click="handleLogout"
            :disabled="isNavigating"
            link
            class="mobile-menu-item logout-item"
          >
            <v-list-item-title class="text-red-600"> Logout </v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Loading overlay during navigation -->
    <v-overlay
      v-model="isNavigating"
      class="align-center justify-center"
      style="z-index: 9999"
      opacity="0.3"
    >
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </v-overlay>

    <!-- Main content -->
    <v-main style="height: 100vh; padding-top: 64px">
      <div style="height: 100%; overflow-y: auto">
        <!-- Error Boundary for page content -->
        <Suspense>
          <template #default>
            <NuxtPage />
          </template>
          <template #fallback>
            <div class="d-flex align-center justify-center" style="height: 400px">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </template>
        </Suspense>
        <Footer />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.nav-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 15px;
  font-weight: 500;
  color: #9ca3af;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.nav-button.active {
  color: #000;
  font-weight: bold;
}

.nav-button.inactive:hover:not(:disabled) {
  color: #6b7280;
}

.nav-button.navigating {
  opacity: 0.7;
}

.logo-button {
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logo-button:disabled {
  cursor: not-allowed;
}

.auth-btn {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: #000;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.auth-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.auth-btn.active {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logout-btn {
  background: #fee2e2 !important;
  color: #dc2626 !important;
}

.logout-btn:hover:not(:disabled) {
  background: #fecaca !important;
}

.mobile-menu-item:disabled {
  opacity: 0.6;
  pointer-events: none;
}

.logout-item {
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 8px;
}

.loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #666;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.transition-all {
  transition: all 0.3s ease;
}

.transition-opacity {
  transition: opacity 0.2s ease;
}
</style>
