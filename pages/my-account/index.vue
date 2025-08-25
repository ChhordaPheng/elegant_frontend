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
            <transition name="slide-fade" mode="out-in">
              <div key="orders-content" class="px-2 py-4">
                <div class="text-center mb-6">
                  <h3 class="text-h4 font-weight-bold mb-2 primary--text">
                    My Orders
                  </h3>
                  <p class="text-body-2 text--secondary">
                    Track your order history and status
                  </p>
                </div>

                <!-- Orders List -->
                <div v-if="hasOrders">
                  <v-card
                    v-for="(order, orderIndex) in sortedOrders"
                    :key="order.id"
                    class="mb-6 order-card"
                    elevation="3"
                    rounded="xl"
                  >
                    <!-- Order Header -->
                    <v-card-title class="pb-3">
                      <div class="d-flex align-center w-100">
                        <v-avatar size="48" class="mr-4" color="primary">
                          <v-icon color="white" size="24">mdi-receipt</v-icon>
                        </v-avatar>
                        <div class="flex-grow-1">
                          <h4 class="text-h6 font-weight-bold mb-1">
                            Order #{{ order.order_number }}
                          </h4>
                          <p class="text-body-2 text--secondary mb-0">
                            {{ new Date(order.placed_at).toLocaleDateString() }}
                          </p>
                        </div>
                        <v-chip
                          :color="getStatusColor(order.order_status as OrderStatus)"
                          variant="flat"
                          size="large"
                          class="font-weight-bold"
                        >
                          <v-icon start size="16">{{
                            getStatusIcon(order.order_status as OrderStatus)
                          }}</v-icon>
                          {{ formatStatus(order.order_status as OrderStatus) }}
                        </v-chip>
                      </div>
                    </v-card-title>

                    <v-divider></v-divider>

                    <v-card-text class="pt-4">
                      <!-- Order Details Grid -->
                      <v-row class="mb-6">
                        <v-col cols="6" md="3">
                          <v-card
                            variant="outlined"
                            class="pa-3 h-100 detail-card detail-card--blue"
                            rounded="lg"
                          >
                            <div class="d-flex align-center">
                              <v-icon color="blue" size="20" class="mr-2"
                                >mdi-calendar</v-icon
                              >
                              <div>
                                <p
                                  class="text-caption font-weight-bold text-uppercase blue--text mb-1"
                                >
                                  Date
                                </p>
                                <p class="text-body-2 font-weight-medium mb-0">
                                  {{
                                    new Date(
                                      order.placed_at
                                    ).toLocaleDateString()
                                  }}
                                </p>
                              </div>
                            </div>
                          </v-card>
                        </v-col>

                        <v-col cols="6" md="3">
                          <v-card
                            variant="outlined"
                            class="pa-3 h-100 detail-card detail-card--green"
                            rounded="lg"
                          >
                            <div class="d-flex align-center">
                              <v-icon color="green" size="20" class="mr-2"
                                >mdi-currency-usd</v-icon
                              >
                              <div>
                                <p
                                  class="text-caption font-weight-bold text-uppercase green--text mb-1"
                                >
                                  Total
                                </p>
                                <p class="text-body-2 font-weight-medium mb-0">
                                  ${{ order.total_amount }}
                                </p>
                              </div>
                            </div>
                          </v-card>
                        </v-col>

                        <v-col cols="6" md="3">
                          <v-card
                            variant="outlined"
                            class="pa-3 h-100 detail-card detail-card--purple"
                            rounded="lg"
                          >
                            <div class="d-flex align-center">
                              <v-icon color="purple" size="20" class="mr-2"
                                >mdi-credit-card</v-icon
                              >
                              <div>
                                <p
                                  class="text-caption font-weight-bold text-uppercase purple--text mb-1"
                                >
                                  Payment
                                </p>
                                <p class="text-body-2 font-weight-medium mb-0">
                                  {{
                                    formatPaymentMethod(order.payment_method)
                                  }}
                                </p>
                              </div>
                            </div>
                          </v-card>
                        </v-col>

                        <v-col cols="6" md="3">
                          <v-card
                            variant="outlined"
                            class="pa-3 h-100 detail-card detail-card--orange"
                            rounded="lg"
                          >
                            <div class="d-flex align-center">
                              <v-icon color="orange" size="20" class="mr-2"
                                >mdi-phone</v-icon
                              >
                              <div>
                                <p
                                  class="text-caption font-weight-bold text-uppercase orange--text mb-1"
                                >
                                  Contact
                                </p>
                                <p class="text-body-2 font-weight-medium mb-0">
                                  {{ order.phone }}
                                </p>
                              </div>
                            </div>
                          </v-card>
                        </v-col>
                      </v-row>

                      <!-- Order Tracking Section -->
                      <v-card
                        variant="outlined"
                        class="pa-4 tracking-card"
                        rounded="xl"
                      >
                        <h5 class="text-h6 font-weight-bold mb-4 text-center">
                          Order Tracking
                        </h5>

                        <!-- Progress Steps -->
                        <div class="position-relative mb-4">
                          <v-row
                            align="center"
                            justify="space-between"
                            class="mx-0 position-relative"
                            style="z-index: 2"
                          >
                            <v-col
                              v-for="(step, index) in trackingSteps"
                              :key="index"
                              cols="auto"
                              class="d-flex flex-column align-center text-center pa-1"
                            >
                              <!-- Step Icon -->
                              <v-avatar
                                :size="
                                  isCurrentStep(order.order_status as OrderStatus, step.status)
                                    ? 56
                                    : 48
                                "
                                :color="
                                  getStepColor(order.order_status as OrderStatus, step.status)
                                "
                                class="mb-2 step-avatar"
                                :class="{
                                  'step-avatar--active': isCurrentStep(
                                    order.order_status as OrderStatus,
                                    step.status
                                  ),
                                  'step-avatar--completed': isStepCompleted(
                                    order.order_status as OrderStatus,
                                    step.status
                                  ),
                                  'step-avatar--pending': isStepPending(
                                    order.order_status as OrderStatus,
                                    step.status
                                  ),
                                }"
                              >
                                <v-icon
                                  :color="
                                    getStepIconColor(
                                      order.order_status as OrderStatus,
                                      step.status
                                    )
                                  "
                                  :size="
                                    isCurrentStep(
                                      order.order_status as OrderStatus,
                                      step.status
                                    )
                                      ? 24
                                      : 20
                                  "
                                >
                                  {{ step.icon }}
                                </v-icon>
                              </v-avatar>

                              <!-- Step Label -->
                              <span
                                class="text-caption font-weight-medium"
                                :class="
                                  getStepTextClass(
                                    order.order_status as OrderStatus,
                                    step.status
                                  )
                                "
                              >
                                {{ step.label }}
                              </span>
                            </v-col>
                          </v-row>

                          <!-- Progress Line -->
                          <div class="progress-line">
                            <div
                              class="progress-fill"
                              :style="{
                                width: getProgressWidth(order.order_status as OrderStatus),
                              }"
                            ></div>
                          </div>
                        </div>

                        <!-- Estimated Delivery -->
                        <v-alert
                          v-if="
                            order.order_status !== 'delivered' &&
                            order.order_status !== 'completed' &&
                            order.order_status !== 'cancelled'
                          "
                          color="info"
                          variant="tonal"
                          icon="mdi-truck-fast"
                          class="mb-0"
                          rounded="lg"
                        >
                          <template v-slot:text>
                            <span class="font-weight-medium">
                              Estimated delivery: {{ getEstimatedDelivery() }}
                            </span>
                          </template>
                        </v-alert>

                        <!-- Order Note (if exists) -->
                        <v-alert
                          v-if="order.note"
                          color="grey-lighten-6"
                          variant="tonal"
                          icon="mdi-note-text"
                          class="mb-0 mt-3"
                          rounded="lg"
                        >
                          <template v-slot:text>
                            <strong>Note:</strong> {{ order.note }}
                          </template>
                        </v-alert>
                      </v-card>
                    </v-card-text>
                  </v-card>
                </div>

                <!-- Empty State -->
                <v-card
                  v-else
                  class="text-center pa-12"
                  variant="outlined"
                  rounded="xl"
                >
                  <v-icon size="80" color="grey-lighten-2" class="mb-4"
                    >mdi-cart-off</v-icon
                  >
                  <h3 class="text-h5 mb-2 text--secondary">No orders yet</h3>
                  <p class="text-body-1 text--secondary mb-4">
                    Your order history will appear here when you make your first
                    purchase
                  </p>
                  <v-btn color="primary" variant="elevated" rounded="pill">
                    Start Shopping
                  </v-btn>
                </v-card>
              </div>
            </transition>
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
