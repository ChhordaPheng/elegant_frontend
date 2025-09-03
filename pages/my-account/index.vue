<script setup lang="ts">
import type { UpdateProfileRequest } from "~/types/profile/profile";

const tab = ref<"account" | "password" | "address">("account");
const snackbarChangePasswordSuccess = ref<boolean>(false);
const snackbarChangePasswordFail = ref<boolean>(false);
const snackbarAddressSuccess = ref<boolean>(false);
const snackbarAddressFail = ref<boolean>(false);
const snackbarProfileSuccess = ref<boolean>(false);
const snackbarProfileFail = ref<boolean>(false);
const addressMessage = ref<string>("");
const profileMessage = ref<string>("");
const snackbar = ref(false);
const text = ref(""); // message for snackbar
const router = useRouter(); // Make sure this is properly imported

const userStore = useProfileStore();
const { userProfile, loading, passwordChanging } = storeToRefs(userStore);

const tabs = [
  { label: "Edit Info", value: "account" },
  { label: "Change Password", value: "password" },
  { label: "Addresses", value: "address" },
  { label: "Tracking Orders", value: "orders" },
];

// Define all possible statuses as a union type
type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

// Tracking steps configuration
const trackingSteps = ref<
  { status: OrderStatus; label: string; icon: string }[]
>([
  { status: "pending", label: "Pending", icon: "mdi-clock-outline" },
  { status: "confirmed", label: "Confirmed", icon: "mdi-check-circle" },
  { status: "preparing", label: "Preparing", icon: "mdi-chef-hat" },
  { status: "ready", label: "Ready", icon: "mdi-package-variant" },
  { status: "shipped", label: "Shipped", icon: "mdi-truck" },
  { status: "delivered", label: "Delivered", icon: "mdi-home-heart" },
  { status: "completed", label: "Completed", icon: "mdi-check-all" },
]);

const statusOrder: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "shipped",
  "delivered",
  "completed",
];

// Status configurations
const statusColors: Record<OrderStatus, string> = {
  pending: "orange",
  confirmed: "blue",
  preparing: "purple",
  ready: "indigo",
  shipped: "teal",
  delivered: "green",
  completed: "success",
  cancelled: "red",
};

const statusIcons: Record<OrderStatus, string> = {
  pending: "mdi-clock-outline",
  confirmed: "mdi-check-circle",
  preparing: "mdi-chef-hat",
  ready: "mdi-package-variant",
  shipped: "mdi-truck",
  delivered: "mdi-home-heart",
  completed: "mdi-check-all",
  cancelled: "mdi-close-circle",
};
// Computed properties
const hasOrders = computed(() => {
  return userProfile.value?.orders && userProfile.value.orders.length > 0;
});

const sortedOrders = computed(() => {
  if (!userProfile.value?.orders) return [];
  return [...userProfile.value.orders].sort(
    (a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime()
  );
});

// Methods

const getEstimatedDelivery = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString();
};
// Methods
const getStatusColor = (status: OrderStatus): string => {
  return statusColors[status] || "grey";
};

const getStatusIcon = (status: OrderStatus): string => {
  return statusIcons[status] || "mdi-help-circle";
};

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatPaymentMethod = (method: string): string => {
  return method
    .replace("_", " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
};

const getStepColor = (
  orderStatus: OrderStatus,
  stepStatus: OrderStatus
): string => {
  const orderIndex = statusOrder.indexOf(orderStatus);
  const stepIndex = statusOrder.indexOf(stepStatus);

  if (stepIndex < orderIndex) return "success";
  if (stepIndex === orderIndex) return "primary";
  return "grey-lighten-2";
};

const getStepIconColor = (
  orderStatus: OrderStatus,
  stepStatus: OrderStatus
): string => {
  const orderIndex = statusOrder.indexOf(orderStatus);
  const stepIndex = statusOrder.indexOf(stepStatus);

  if (stepIndex <= orderIndex) return "white";
  return "grey";
};

const getStepTextClass = (
  orderStatus: OrderStatus,
  stepStatus: OrderStatus
): string => {
  const orderIndex = statusOrder.indexOf(orderStatus);
  const stepIndex = statusOrder.indexOf(stepStatus);

  if (stepIndex < orderIndex) return "success--text font-weight-bold";
  if (stepIndex === orderIndex) return "primary--text font-weight-bold";
  return "text--secondary";
};

const isCurrentStep = (
  orderStatus: OrderStatus,
  stepStatus: OrderStatus
): boolean => {
  return orderStatus === stepStatus;
};

const isStepCompleted = (
  orderStatus: OrderStatus,
  stepStatus: OrderStatus
): boolean => {
  return statusOrder.indexOf(stepStatus) < statusOrder.indexOf(orderStatus);
};

const isStepPending = (
  orderStatus: OrderStatus,
  stepStatus: OrderStatus
): boolean => {
  return statusOrder.indexOf(stepStatus) > statusOrder.indexOf(orderStatus);
};

const getProgressWidth = (orderStatus: OrderStatus): string => {
  const currentIndex = statusOrder.indexOf(orderStatus);
  const percentage = ((currentIndex + 1) / statusOrder.length) * 100;
  return `${Math.min(percentage, 100)}%`;
};

const account = ref({
  firstname: "",
  lastname: "",
  email: "",
  phone_number: "",
});

const password = ref({
  old: "",
  new: "",
  confirm: "",
});

// Address management
const showAddressDialog = ref(false);
const editingAddress = ref<any>(null);
const addressForm = ref({
  name: "",
  home: "",
  street: "",
  city: "",
  country: "",
});

// Confirm dialog
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref("");
const confirmDialogMessage = ref("");
const confirmDialogAction = ref<(() => Promise<void>) | null>(null);

const showCard = ref(false);
const addressLoading = ref(false);

// Avatar image URL, default
const avatarUrl = ref("images/profile.png");
const fileInput = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.style.display = "block";
    fileInput.value.focus();
    fileInput.value.click();
    fileInput.value.style.display = "none";
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

    // Immediately trigger save if we're on the account tab
    if (tab.value === "account") {
      saveAccount();
    }
  }
}

// Underline animation variables
const underlineLeft = ref(0);
const underlineWidth = ref(0);

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

watch(tab, () => updateUnderline());
updateUnderline();

const saveAccount = async () => {
  userStore.loading = true;
  try {
    const payload: UpdateProfileRequest = {
      first_name: account.value.firstname,
      last_name: account.value.lastname,
      email: account.value.email,
      phone_number: account.value.phone_number,
      profile_image: fileInput.value?.files?.[0] ?? undefined,
    };

    const response = await userStore.updateProfile(payload);

    if (response) {
      // Update local state with new data
      if (userProfile.value) {
        userProfile.value.first_name = account.value.firstname;
        userProfile.value.last_name = account.value.lastname;
        userProfile.value.email = account.value.email;
        userProfile.value.phone_number = account.value.phone_number;
      }

      // Show success message
      profileMessage.value = "Profile updated successfully!";
      snackbarProfileSuccess.value = true;
    }
  } catch (error: any) {
    profileMessage.value = error.message || "Failed to update profile";
    snackbarProfileFail.value = true;
  }
};

const changePassword = async () => {
  if (password.value.new !== password.value.confirm) {
    addressMessage.value = "New password and confirmation do not match.";
    snackbarChangePasswordFail.value = true;
    return;
  }

  try {
    await userStore.changePassword({
      current_password: password.value.old,
      old_password: password.value.old,
      new_password: password.value.new,
      new_password_confirmation: password.value.confirm,
    });

    if (userStore.passwordChangeSuccess) {
      password.value.old = "";
      password.value.new = "";
      password.value.confirm = "";
      addressMessage.value = "Password changed successfully!";
      snackbarChangePasswordSuccess.value = true;
    } else {
      addressMessage.value =
        userStore.passwordChangeMessage || "Failed to change password";
      snackbarChangePasswordFail.value = true;
    }
  } catch (error: any) {
    addressMessage.value = error.message || "Failed to change password";
    snackbarChangePasswordFail.value = true;
  }
};

// Address functions
function openAddAddressDialog() {
  editingAddress.value = null;
  addressForm.value = {
    name: "",
    home: "",
    street: "",
    city: "",
    country: "",
  };
  showAddressDialog.value = true;
}

function openEditAddressDialog(address: any) {
  editingAddress.value = address;
  addressForm.value = {
    name: address.name,
    home: address.home,
    street: address.street,
    city: address.city,
    country: address.country,
  };
  showAddressDialog.value = true;
}

function closeAddressDialog() {
  showAddressDialog.value = false;
  editingAddress.value = null;
  addressForm.value = {
    name: "",
    home: "",
    street: "",
    city: "",
    country: "",
  };
}

const saveAddress = async () => {
  addressLoading.value = true;

  try {
    if (editingAddress.value) {
      // Update existing address
      await userStore.updateAddress(addressForm.value, editingAddress.value.id);
      addressMessage.value = "Address updated successfully!";
      snackbarAddressSuccess.value = true;
    } else {
      // Add new address
      await userStore.addAdress(addressForm.value);
      addressMessage.value = "Address added successfully!";
      snackbarAddressSuccess.value = true;
    }

    // Refresh user profile to get updated addresses
    await userStore.fetchUserProfile();
    closeAddressDialog();
  } catch (error: any) {
    addressMessage.value = error.message || "Failed to save address";
    snackbarAddressFail.value = true;
  } finally {
    addressLoading.value = false;
  }
};

const quickView = (productId: string | number) => {
  try {
    // Convert to string if needed
    const idString = productId.toString();

    // Navigate to product detail page
    router.push({
      path: "/product-detail",
      query: { id: idString },
    });
  } catch (error) {
    console.error("Error during navigation:", error);
    text.value = "Failed to navigate to product detail.";
    snackbar.value = true;
  }
};

// Custom confirm dialog functions
function showConfirm(
  title: string,
  message: string,
  action: () => Promise<void>
) {
  confirmDialogTitle.value = title;
  confirmDialogMessage.value = message;
  confirmDialogAction.value = action;
  showConfirmDialog.value = true;
}

function closeConfirmDialog() {
  showConfirmDialog.value = false;
  confirmDialogAction.value = null;
}

async function handleConfirm() {
  if (confirmDialogAction.value) {
    await confirmDialogAction.value();
  }
  closeConfirmDialog();
}

const deleteAddress = async (addressId: string) => {
  const performDelete = async () => {
    addressLoading.value = true;

    try {
      const message = await userStore.deleteAddress(addressId);
      addressMessage.value = message || "Address deleted successfully!";
      snackbarAddressSuccess.value = true;

      // Refresh user profile to get updated addresses
      await userStore.fetchUserProfile();
    } catch (error: any) {
      addressMessage.value = error.message || "Failed to delete address";
      snackbarAddressFail.value = true;
    } finally {
      addressLoading.value = false;
    }
  };

  showConfirm(
    "Delete Address",
    "Are you sure you want to delete this address? This action cannot be undone.",
    performDelete
  );
};

onMounted(async () => {
  await userStore.fetchUserProfile();
  if (userProfile.value) {
    account.value.firstname = userProfile.value.first_name;
    account.value.lastname = userProfile.value.last_name;
    account.value.email = userProfile.value.email;
    account.value.phone_number = userProfile.value.phone_number;

    // Initialize avatar with user's profile image if available
    if (userProfile.value.profile_image) {
      avatarUrl.value = userProfile.value.profile_image;
    }
  }
  showCard.value = true;
});
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
        <!-- Loading Overlay -->
        <v-overlay
          v-model="loading"
          class="align-center justify-center"
          contained
        >
          <v-progress-circular
            color="primary"
            indeterminate
            size="64"
          ></v-progress-circular>
        </v-overlay>

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
            <div class="text-xl font-semibold">
              {{ userProfile?.full_name }}
            </div>
            <div class="text-sm text-grey">{{ userProfile?.email }}</div>
            <div class="text-sm text-grey capitalize">
              {{ userProfile?.phone_number }}
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onFileSelected"
          />
        </v-row>

        <!-- Tabs -->
        <v-tabs v-model="tab" color="primary" class="tab-wrapper">
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
          <!-- Account Tab -->
          <v-window-item value="account">
            <transition name="slide-fade" mode="out-in">
              <v-form @submit.prevent="saveAccount" key="account-form">
                <v-text-field
                  v-model="account.firstname"
                  label="First Name"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  class="mb-4 mt-2"
                />

                <v-text-field
                  v-model="account.lastname"
                  label="Last Name"
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

                <v-text-field
                  v-model="account.phone_number"
                  label="Phone Number"
                  prepend-inner-icon="mdi-phone"
                  variant="outlined"
                  type="tel"
                  class="mb-4"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  block
                  class="animated-btn"
                  :loading="loading"
                  :disabled="loading"
                >
                  Save Changes
                </v-btn>
              </v-form>
            </transition>
          </v-window-item>

          <!-- Password Tab -->
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

                <v-btn
                  type="submit"
                  color="primary"
                  block
                  class="animated-btn"
                  :loading="passwordChanging"
                  :disabled="passwordChanging"
                >
                  Change Password
                </v-btn>
              </v-form>
            </transition>
          </v-window-item>

          <!-- Address Tab -->
          <v-window-item value="address">
            <transition name="slide-fade" mode="out-in">
              <div key="address-content">
                <div class="d-flex justify-between align-center mb-4">
                  <h3 class="text-h6 font-weight-bold">My Addresses</h3>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="openAddAddressDialog"
                    class="animated-btn"
                    :disabled="addressLoading"
                  >
                    Add Address
                  </v-btn>
                </div>

                <!-- Address List -->
                <div
                  v-if="
                    userProfile?.addresses && userProfile.addresses.length > 0
                  "
                >
                  <v-card
                    v-for="address in userProfile.addresses"
                    :key="address.id"
                    class="mb-3 pa-4 address-card"
                    elevation="2"
                    rounded="lg"
                  >
                    <div class="d-flex justify-between align-start">
                      <div class="flex-grow-1">
                        <h4 class="text-subtitle-1 font-weight-bold mb-2">
                          {{ address.name }}
                        </h4>
                        <div class="text-body-2 text-grey-darken-1">
                          <div class="mb-1">
                            <v-icon size="small" class="mr-2">mdi-home</v-icon>
                            {{ address.home }}
                          </div>
                          <div class="mb-1">
                            <v-icon size="small" class="mr-2">mdi-road</v-icon>
                            {{ address.street }}
                          </div>
                          <div class="mb-1">
                            <v-icon size="small" class="mr-2">mdi-city</v-icon>
                            {{ address.city }}, {{ address.country }}
                          </div>
                        </div>
                      </div>

                      <div class="d-flex flex-column ga-2">
                        <v-btn
                          size="small"
                          color="primary"
                          variant="outlined"
                          icon="mdi-pencil"
                          @click="openEditAddressDialog(address)"
                          :disabled="addressLoading"
                        ></v-btn>
                        <v-btn
                          size="small"
                          color="error"
                          variant="outlined"
                          icon="mdi-delete"
                          @click="deleteAddress(address.id)"
                          :loading="addressLoading"
                          :disabled="addressLoading"
                        ></v-btn>
                      </div>
                    </div>
                  </v-card>
                </div>

                <!-- Empty State -->
                <v-card
                  v-else
                  class="pa-8 text-center"
                  elevation="1"
                  rounded="lg"
                >
                  <v-icon size="64" color="grey-lighten-1" class="mb-4">
                    mdi-map-marker-off
                  </v-icon>
                  <h3 class="text-h6 mb-2 text-grey-darken-1">
                    No addresses yet
                  </h3>
                  <p class="text-body-2 text-grey mb-4">
                    Add your first address to get started with deliveries
                  </p>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="openAddAddressDialog"
                    :disabled="addressLoading"
                  >
                    Add Your First Address
                  </v-btn>
                </v-card>
              </div>
            </transition>
          </v-window-item>

          <!-- Orders Tab -->
          <v-window-item value="orders">
            <div class="px-4 py-6 max-w-[700px] mx-auto">
              <!-- Simplified Header -->
              <div
                class="text-center mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-8 shadow-2xl"
              >
                <div class="absolute inset-0 bg-black/20"></div>
                <div class="relative z-10">
                  <h3 class="text-4xl font-bold mb-3 text-white drop-shadow-lg">
                    My Orders ✨
                  </h3>
                  <p class="text-white/90 text-lg font-medium">
                    Track your amazing purchases and deliveries
                  </p>
                </div>
                <!-- Animated floating elements -->
                <div
                  class="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full animate-bounce"
                ></div>
                <div
                  class="absolute bottom-4 left-4 w-12 h-12 bg-yellow-300/30 rounded-full animate-pulse"
                ></div>
              </div>

              <!-- Orders List -->
              <div v-if="hasOrders" class="space-y-4">
                <v-expansion-panels variant="accordion" multiple>
                  <v-expansion-panel
                    v-for="(order, orderIndex) in sortedOrders"
                    :key="order.id"
                    class="transition-all duration-300 hover:shadow-md hover:scale-[1]"
                    :class="{
                      'border-l-4 border-green-500 bg-green-50':
                        order.order_status === 'completed',
                      'border-l-4 border-blue-500 bg-blue-50':
                        order.order_status === 'pending',
                      'border-l-4 border-orange-500 bg-orange-50':
                        order.order_status === 'processing',
                      'border-l-4 border-purple-500 bg-purple-50':
                        order.order_status === 'shipped',
                    }"
                    rounded="xl"
                    elevation="0"
                  >
                    <!-- Panel Header -->
                    <template v-slot:title>
                      <div class="flex items-center w-full p-2">
                        <!-- Order Image -->
                        <div
                          class="mr-3 transition-transform duration-200 hover:scale-110 cursor-pointer"
                          @click="
                            quickView(order.order_items[0]?.id || order.id)
                          "
                        >
                          <div
                            class="w-12 h-12 rounded-lg overflow-hidden shadow-sm relative group"
                          >
                            <img
                              v-if="
                                order.order_items &&
                                order.order_items.length > 0
                              "
                              :src="order.order_items[0].item_image"
                              :alt="order.order_items[0].item_name"
                              class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div
                              v-else
                              class="w-full h-full bg-gray-200 flex items-center justify-center"
                            >
                              <Icon
                                icon="solar:box-linear"
                                class="text-gray-400 text-lg"
                              />
                            </div>
                            <!-- Hover overlay -->
                            <div
                              class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center"
                            >
                              <Icon
                                icon="solar:eye-linear"
                                class="text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div class="flex-grow min-w-0">
                          <h4
                            class="text-lg font-semibold text-gray-800 truncate"
                          >
                            {{
                              order.order_items && order.order_items.length > 0
                                ? order.order_items[0].item_name
                                : "Order"
                            }}
                            <span
                              v-if="
                                order.order_items &&
                                order.order_items.length > 1
                              "
                              class="text-sm text-gray-500 ml-1"
                            >
                              (+{{ order.order_items.length - 1 }})
                            </span>
                          </h4>
                          <p class="text-gray-500 text-sm">
                            #{{ order.order_number }} •
                            {{ new Date(order.placed_at).toLocaleDateString() }}
                          </p>
                        </div>

                        <div class="text-right">
                          <!-- Status Badge -->
                          <div
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-1 transition-colors duration-200 hover:scale-105"
                            :class="{
                              'bg-green-100 text-green-700 hover:bg-green-200':
                                order.order_status === 'completed',
                              'bg-blue-100 text-blue-700 hover:bg-blue-200':
                                order.order_status === 'pending',
                              'bg-orange-100 text-orange-700 hover:bg-orange-200':
                                order.order_status === 'processing',
                              'bg-purple-100 text-purple-700 hover:bg-purple-200':
                                order.order_status === 'shipped',
                            }"
                          >
                            {{
                              formatStatus(order.order_status as OrderStatus)
                            }}
                          </div>
                          <p class="text-lg font-bold text-gray-800">
                            ${{ order.total_amount }}
                          </p>
                        </div>
                      </div>
                    </template>

                    <!-- Panel Content -->
                    <template v-slot:text>
                      <div class="p-4 bg-white rounded-lg">
                        <!-- Order Items -->
                        <div class="mb-6">
                          <h5 class="text-lg font-semibold mb-3 text-gray-800">
                            Order Items
                          </h5>
                          <div class="space-y-3">
                            <div
                              v-for="(item, itemIndex) in order.order_items"
                              :key="item.id"
                              class="flex gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-sm"
                            >
                              <div class="relative">
                                <div
                                  class="w-12 h-12 rounded-lg overflow-hidden cursor-pointer group"
                                  @click="quickView(item.id)"
                                >
                                  <img
                                    :src="item.item_image"
                                    :alt="item.item_name"
                                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                  <!-- Hover overlay -->
                                  <div
                                    class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center"
                                  >
                                    <Icon
                                      icon="solar:eye-linear"
                                      class="text-white text-sm"
                                    />
                                  </div>
                                </div>
                                <div
                                  class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                >
                                  {{ item.quantity }}
                                </div>
                              </div>
                              <div class="flex-1 min-w-0">
                                <h6 class="font-medium text-gray-800 truncate">
                                  {{ item.item_name }}
                                </h6>
                                <p class="text-sm text-gray-500">
                                  {{ item.size }} • {{ item.color }}
                                </p>
                                <p class="text-sm font-semibold text-green-600">
                                  ${{ item.final_price }}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Order Details -->
                        <div class="mb-6">
                          <h5 class="text-lg font-semibold mb-3 text-gray-800">
                            Order Details
                          </h5>
                          <div class="grid grid-cols-2 gap-3">
                            <div
                              class="bg-blue-50 p-3 rounded-lg transition-all duration-200 hover:bg-blue-100 hover:scale-[1.02]"
                            >
                              <div class="flex items-center gap-2 mb-1">
                                <Icon
                                  icon="solar:calendar-linear"
                                  class="text-blue-500 text-sm"
                                />
                                <p class="text-xs text-blue-600 font-medium">
                                  DATE
                                </p>
                              </div>
                              <p class="text-sm font-semibold text-blue-800">
                                {{
                                  new Date(order.placed_at).toLocaleDateString()
                                }}
                              </p>
                            </div>
                            <div
                              class="bg-green-50 p-3 rounded-lg transition-all duration-200 hover:bg-green-100 hover:scale-[1.02]"
                            >
                              <div class="flex items-center gap-2 mb-1">
                                <Icon
                                  icon="solar:dollar-linear"
                                  class="text-green-500 text-sm"
                                />
                                <p class="text-xs text-green-600 font-medium">
                                  TOTAL
                                </p>
                              </div>
                              <p class="text-sm font-semibold text-green-800">
                                ${{ order.total_amount }}
                              </p>
                            </div>
                            <div
                              class="bg-purple-50 p-3 rounded-lg transition-all duration-200 hover:bg-purple-100 hover:scale-[1.02]"
                            >
                              <div class="flex items-center gap-2 mb-1">
                                <Icon
                                  icon="solar:card-linear"
                                  class="text-purple-500 text-sm"
                                />
                                <p class="text-xs text-purple-600 font-medium">
                                  PAYMENT
                                </p>
                              </div>
                              <p class="text-sm font-semibold text-purple-800">
                                {{ formatPaymentMethod(order.payment_method) }}
                              </p>
                            </div>
                            <div
                              class="bg-orange-50 p-3 rounded-lg transition-all duration-200 hover:bg-orange-100 hover:scale-[1.02]"
                            >
                              <div class="flex items-center gap-2 mb-1">
                                <Icon
                                  icon="solar:phone-linear"
                                  class="text-orange-500 text-sm"
                                />
                                <p class="text-xs text-orange-600 font-medium">
                                  CONTACT
                                </p>
                              </div>
                              <p class="text-sm font-semibold text-orange-800">
                                {{ order.phone }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Order Tracking -->
                        <div class="bg-gray-50 rounded-lg p-4">
                          <h5 class="text-lg font-semibold mb-4 text-gray-800">
                            Order Tracking
                          </h5>

                          <!-- Simple Progress Steps -->
                          <div class="relative">
                            <div
                              class="flex justify-between items-center relative z-10"
                            >
                              <div
                                v-for="(step, index) in trackingSteps"
                                :key="index"
                                class="flex flex-col items-center text-center"
                              >
                                <!-- Step Icon -->
                                <div
                                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm mb-2 transition-all duration-100"
                                  :class="{
                                  'bg-green-500 animate-pulse': isStepCompleted(order.order_status as OrderStatus, step.status),
                                  'bg-blue-500 scale-110': isCurrentStep(order.order_status as OrderStatus, step.status),
                                  'bg-gray-300': isStepPending(order.order_status as OrderStatus, step.status)
                              }"
                                >
                                  <Icon
                                    :icon="
                                      step.status === 'pending'
                                        ? 'solar:clock-circle-linear'
                                        : step.status === 'confirmed'
                                        ? 'solar:check-circle-linear'
                                        : step.status === 'preparing'
                                        ? 'solar:settings-linear'
                                        : step.status === 'shipped'
                                        ? 'solar:delivery-linear'
                                        : step.status === 'delivered'
                                        ? 'solar:home-linear'
                                        : step.status === 'completed'
                                        ? 'solar:verified-check-linear'
                                        : 'solar:question-circle-linear'
                                    "
                                    class="text-sm"
                                  />
                                </div>

                                <!-- Step Label -->
                                <span
                                  class="text-xs font-medium"
                                  :class="{
                                    'text-green-600': isStepCompleted(order.order_status as OrderStatus, step.status),
                                    'text-blue-600': isCurrentStep(order.order_status as OrderStatus, step.status),
                                    'text-gray-400': isStepPending(order.order_status as OrderStatus, step.status)
                                  }"
                                >
                                  {{ step.label }}
                                </span>
                              </div>
                            </div>

                            <!-- Progress Line -->
                            <div
                              class="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded-full"
                            >
                              <div
                                class="h-full bg-blue-500 rounded-full transition-all duration-500"
                                :style="{ width: getProgressWidth(order.order_status as OrderStatus) }"
                              ></div>
                            </div>
                          </div>

                          <!-- Delivery Info -->
                          <div
                            v-if="
                              order.order_status !== 'delivered' &&
                              order.order_status !== 'completed' &&
                              order.order_status !== 'cancelled'
                            "
                            class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 flex items-center gap-3"
                          >
                            <Icon
                              icon="solar:truck-linear"
                              class="text-blue-500 text-lg"
                            />
                            <div>
                              <p class="text-sm font-medium text-blue-800">
                                Estimated Delivery
                              </p>
                              <p class="text-sm text-blue-600">
                                {{ getEstimatedDelivery() }}
                              </p>
                            </div>
                          </div>

                          <!-- Order Note -->
                          <div
                            v-if="order.note"
                            class="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 flex items-start gap-3"
                          >
                            <Icon
                              icon="solar:notes-linear"
                              class="text-amber-500 mt-0.5 text-lg"
                            />
                            <div>
                              <p class="text-sm font-medium text-amber-800">
                                Order Note
                              </p>
                              <p class="text-sm text-amber-700">
                                {{ order.note }}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Empty State -->
              <div
                v-else
                class="text-center p-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm"
              >
                <div
                  class="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-purple-400 mx-auto mb-4"
                >
                  <Icon
                    icon="solar:shopping-cart-large-2-linear"
                    class="text-3xl"
                  />
                </div>
                <h3
                  class="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  No orders yet
                </h3>
                <p class="text-gray-600 mb-6">
                  Start your shopping journey and your orders will appear here
                </p>
                <button
                  class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto"
                >
                  <Icon icon="solar:bag-heart-linear" class="text-lg" />
                  Start Shopping
                </button>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card>
    </transition>

    <!-- Address Dialog -->
    <v-dialog v-model="showAddressDialog" max-width="600px" persistent>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h5 pa-6 pb-4">
          {{ editingAddress ? "Edit Address" : "Add New Address" }}
        </v-card-title>

        <v-card-text class="px-6">
          <v-form @submit.prevent="saveAddress">
            <v-text-field
              v-model="addressForm.name"
              label="Address Name"
              prepend-inner-icon="mdi-tag"
              variant="outlined"
              class="mb-4"
              placeholder="e.g., Home, Office, etc."
              required
            />

            <v-text-field
              v-model="addressForm.home"
              label="House/Building Number"
              prepend-inner-icon="mdi-home"
              variant="outlined"
              class="mb-4"
              placeholder="e.g., House #123, Building A"
              required
            />

            <v-text-field
              v-model="addressForm.street"
              label="Street Address"
              prepend-inner-icon="mdi-road"
              variant="outlined"
              class="mb-4"
              placeholder="e.g., Main Street, Oak Avenue"
              required
            />

            <v-text-field
              v-model="addressForm.city"
              label="City"
              prepend-inner-icon="mdi-city"
              variant="outlined"
              class="mb-4"
              required
            />

            <v-text-field
              v-model="addressForm.country"
              label="Country"
              prepend-inner-icon="mdi-earth"
              variant="outlined"
              class="mb-4"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-2">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeAddressDialog"
            class="mr-3"
            :disabled="addressLoading"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveAddress"
            class="animated-btn"
            :loading="addressLoading"
            :disabled="addressLoading"
          >
            {{ editingAddress ? "Update" : "Save" }} Address
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="450px" persistent>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h5 pa-6 pb-4 d-flex align-center">
          <v-icon color="warning" size="28" class="mr-3"
            >mdi-alert-circle</v-icon
          >
          {{ confirmDialogTitle }}
        </v-card-title>

        <v-card-text class="px-6 pb-4">
          <p class="text-body-1 mb-0">{{ confirmDialogMessage }}</p>
        </v-card-text>

        <v-card-actions class="pa-6 pt-2">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeConfirmDialog"
            class="mr-3"
          >
            Cancel
          </v-btn>
          <v-btn color="error" @click="handleConfirm" class="animated-btn">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbars -->
    <v-snackbar
      timeout="3000"
      color="success"
      location="top right"
      v-model="snackbarChangePasswordSuccess"
    >
      Password changed successfully!
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          color="white"
          variant="text"
          @click="snackbarChangePasswordSuccess = false"
        >
        </v-btn>
      </template>
    </v-snackbar>

    <v-snackbar
      timeout="3000"
      color="error"
      location="top right"
      v-model="snackbarChangePasswordFail"
    >
      {{ addressMessage }}
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          color="white"
          variant="text"
          @click="snackbarChangePasswordFail = false"
        >
        </v-btn>
      </template>
    </v-snackbar>

    <v-snackbar
      timeout="3000"
      color="success"
      location="top right"
      v-model="snackbarAddressSuccess"
    >
      {{ addressMessage }}
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          color="white"
          variant="text"
          @click="snackbarAddressSuccess = false"
        >
        </v-btn>
      </template>
    </v-snackbar>

    <v-snackbar
      timeout="3000"
      color="error"
      location="top right"
      v-model="snackbarAddressFail"
    >
      {{ addressMessage }}
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          color="white"
          variant="text"
          @click="snackbarAddressFail = false"
        >
        </v-btn>
      </template>
    </v-snackbar>

    <v-snackbar
      timeout="3000"
      color="success"
      location="top right"
      v-model="snackbarProfileSuccess"
    >
      {{ profileMessage }}
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          color="white"
          variant="text"
          @click="snackbarProfileSuccess = false"
        >
        </v-btn>
      </template>
    </v-snackbar>

    <v-snackbar
      timeout="3000"
      color="error"
      location="top right"
      v-model="snackbarProfileFail"
    >
      {{ profileMessage }}
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          color="white"
          variant="text"
          @click="snackbarProfileFail = false"
        >
        </v-btn>
      </template>
    </v-snackbar>
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

.tab-wrapper {
  position: relative;
  overflow: visible;
}

.animated-underline {
  position: absolute;
  bottom: 0;
  height: 4px;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(45deg, #9e9c9d, #7873f5, #4ade80);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-item {
  font-weight: 600;
  color: #444;
  transition: color 0.3s ease;
}

.v-tab--active.tab-item {
  color: #5c4def;
}

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

.animated-btn {
  transition: all 0.3s ease;
}

.animated-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.address-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.address-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(194, 192, 208, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(158, 158, 164, 0.6);
  }
}
.slide-fade-enter-active {
  transition: all 0.6s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Card entrance animation */
.v-card {
  animation: slideInUp 0.6s ease-out forwards;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom hover effects */
.group:hover .animate-bounce {
  animation-duration: 2s;
}

/* Progress bar shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.progress-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200px 100%;
  animation: shimmer 2s infinite;
}
</style>
