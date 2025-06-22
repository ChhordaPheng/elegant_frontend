<script setup lang="ts">
const tab = ref<"account" | "password">("account");
const tabs = [
  { label: "Edit Info", value: "account" },
  { label: "Change Password", value: "password" },
];

const account = ref({
  name: "Chhorda Pheng",
  email: "chhorda@example.com",
  gender: "male",
  dob: "1995-06-18",
});

const password = ref({
  old: "",
  new: "",
  confirm: "",
});

const showCard = ref(false);
onMounted(() => {
  // trigger card appear animation
  showCard.value = true;
});

// Avatar image URL, default
const avatarUrl = ref("images/dada.jpg");

const fileInput = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.style.display = "block"; // temporarily show
    fileInput.value.focus();
    fileInput.value.click();
    fileInput.value.style.display = "none"; // hide again
  }
}
function onFileSelected(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files && files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(files[0]);
  }
}

// Underline animation variables
const underlineLeft = ref(0);
const underlineWidth = ref(0);

// Calculate position and width of the underline below active tab
function updateUnderline() {
  nextTick(() => {
    const activeTab = document.querySelector(
      `.tab-wrapper .v-tab--active`
    ) as HTMLElement;
    if (activeTab) {
      underlineLeft.value = activeTab.offsetLeft;
      underlineWidth.value = activeTab.offsetWidth;
    }
  });
}

// Watch tab to update underline on change
watch(tab, () => updateUnderline());

// Initial underline set
updateUnderline();

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function saveAccount() {
  console.log("Saving account:", account.value);
}

function changePassword() {
  if (password.value.new !== password.value.confirm) {
    alert("Passwords do not match!");
    return;
  }
  console.log("Changing password:", password.value);
}
</script>

<template>
  <v-container max-width="700" class="py-5">
    <transition name="card-appear" appear>
      <v-card
        v-if="showCard"
        class="pa-6 relative overflow-hidden"
        elevation="6"
        rounded="xl"
      >
        <!-- PROFILE INFO -->
        <v-row
          align="center"
          class="mb-6 bg-grey-lighten-4 pa-4 rounded-lg elevation-1 relative"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-avatar
              size="80"
              class="cursor-pointer pulse-glow"
              @click="triggerFileInput"
            >
              <v-img :src="avatarUrl" />
            </v-avatar>
          </v-hover>

          <div class="ml-4">
            <div class="text-xl font-semibold">{{ account.name }}</div>
            <div class="text-sm text-grey">{{ account.email }}</div>
            <div class="text-sm text-grey capitalize">
              {{ account.gender }} • {{ formatDate(account.dob) }}
            </div>
          </div>
          <!-- Hidden file input -->
          <!-- Single hidden file input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onFileSelected"
          />
        </v-row>

        <!-- Tabs -->
        <v-tabs v-model="tab" color="transparent" class="tab-wrapper">
          <v-tab
            v-for="item in tabs"
            :key="item.value"
            :value="item.value"
            class="tab-item"
          >
            {{ item.label }}
          </v-tab>
          <div
            class="animated-underline"
            :style="{
              left: underlineLeft + 'px',
              width: underlineWidth + 'px',
            }"
          ></div>
        </v-tabs>

        <v-divider class="my-4" />

        <!-- Tab Content -->
        <v-window v-model="tab" class="tab-content">
          <v-window-item value="account">
            <transition name="slide-fade" mode="out-in">
              <v-form @submit.prevent="saveAccount" key="account-form">
                <v-text-field
                  v-model="account.name"
                  label="Full Name"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  class="mb-4 mt-2"
                />

                <v-text-field
                  v-model="account.email"
                  label="Email Address"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  type="email"
                  class="mb-4"
                />

                <v-radio-group
                  v-model="account.gender"
                  label="Gender"
                  inline
                  class="mb-4"
                >
                  <v-radio label="Male" value="male" />
                  <v-radio label="Female" value="female" />
                  <v-radio label="Other" value="other" />
                </v-radio-group>

                <v-text-field
                  v-model="account.dob"
                  label="Date of Birth"
                  prepend-inner-icon="mdi-calendar"
                  type="date"
                  variant="outlined"
                  class="mb-6"
                />

                <v-btn type="submit" color="primary" block class="animated-btn">
                  Save Changes
                </v-btn>
              </v-form>
            </transition>
          </v-window-item>

          <v-window-item value="password">
            <transition name="slide-fade" mode="out-in">
              <v-form @submit.prevent="changePassword" key="password-form">
                <v-text-field
                  v-model="password.old"
                  label="Old Password"
                  prepend-inner-icon="mdi-lock"
                  type="password"
                  variant="outlined"
                  class="mb-4 mt-2"
                />

                <v-text-field
                  v-model="password.new"
                  label="New Password"
                  prepend-inner-icon="mdi-lock"
                  type="password"
                  variant="outlined"
                  class="mb-4"
                />

                <v-text-field
                  v-model="password.confirm"
                  label="Confirm Password"
                  prepend-inner-icon="mdi-lock-check"
                  type="password"
                  variant="outlined"
                  class="mb-6"
                />

                <v-btn type="submit" color="primary" block class="animated-btn">
                  Change Password
                </v-btn>
              </v-form>
            </transition>
          </v-window-item>
        </v-window>
      </v-card>
    </transition>
  </v-container>
</template>

<style scoped>
.card-appear-enter-active {
  animation: cardFadeScaleIn 0.5s ease forwards;
}
@keyframes cardFadeScaleIn {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Colorful animated underline */
.tab-wrapper {
  position: relative;
  overflow: visible;
}
.animated-underline {
  position: absolute;
  bottom: 0;
  height: 4px;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(45deg, #ff6ec4, #7873f5, #4ade80);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tab item text */
.tab-item {
  font-weight: 600;
  color: #444;
  transition: color 0.3s ease;
}
.v-tab--active.tab-item {
  color: #5c4def;
}

/* Slide + fade transition for tab content */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.pulse-glow {
  animation: pulseGlow 2.5s infinite;
  border-radius: 50%;
  cursor: pointer;
}
</style>
