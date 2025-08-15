<script setup lang="ts">
import { useFetchDataApi } from "~/composables/userFetchApi";
import QRCode from "qrcode";

// Nuxt-specific imports
const router = useRouter();
const config = useRuntimeConfig();
const qrCodeDataUrl = ref<string>("");

// Use the cart store and profile store
const cartStore = useCartStore();
const profileStore = useProfileStore();

// Types (these would be in your types directory)
interface Delivery {
  id: string;
  name: string;
  delivery_fee: string;
  description: string;
  logo: string;
}

interface Order {
  order_id: string;
  order_number: string;
  total_amount: number;
  delivery_method: string;
  qr_string: string;
}

interface OrderRequest {
  cart_id: string;
  delivery_id: string;
  payment_method: string;
  shipping_address: string;
  address_name: string;
  phone: string;
  note: string;
  address_id?: string;
}

interface Address {
  id: string;
  customer_id: string;
  name: string;
  home: string;
  street: string;
  city: string;
  country: string;
  phone: string | null;
  is_default: number;
  created_at: string;
  updated_at: string;
}

// Reactive state
const dialog = ref(false);
const paymentDialog = ref(false);
const deliveryDialog = ref(false);
const addressDialog = ref(false); // New address selection dialog
const isValid = ref(false);
const selectedDelivery = ref<Delivery | null>(null);
const selectedAddress = ref<Address | null>(null); // New selected address
const deliveries = ref<Delivery[]>([]);
const addresses = ref<Address[]>([]); // New addresses array
const currentOrder = ref<Order | null>(null);
const paymentStatus = ref<"pending" | "checking" | "completed" | "failed">("pending");
const paymentCheckInterval = ref<NodeJS.Timeout | null>(null);

// Add missing reactive state properties
const isLoading = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

// Use store's computed values instead of local cart data
const cartItems = computed(() => cartStore.cartData?.items || []);
const totalSavings = computed(() => cartStore.cartData?.total_savings || 0);
const subtotal = computed(() => cartStore.cartData?.total_amount || 0);
const originalSubtotal = computed(() => cartStore.cartData?.original_total_amount || 0);
const deliveryFee = computed(() => {
  return selectedDelivery.value ? parseFloat(selectedDelivery.value.delivery_fee) : 2;
});
const total = computed(() => subtotal.value + deliveryFee.value);

const copyQrString = () => {
  if (currentOrder.value?.qr_string) {
    navigator.clipboard.writeText(currentOrder.value.qr_string);
  }
};

// Form data
const form = ref({
  name: "",
  phoneNumber: "",
  address: "",
  selectedItem: null as any | null,
  note: "",
  useExistingAddress: false, // New flag for address type
});

// Form validation rules
const rules = {
  required: (value: string) => !!value || "Required.",
  phoneNumber: (value: string) => !!value || "Required.",
  address: (value: string) => !!value || "Required.",
};

// Computed property for formatted address
const formattedAddress = computed(() => {
  if (!selectedAddress.value) return "";
  const addr = selectedAddress.value;
  return `${addr.home}, ${addr.street}, ${addr.city}, ${addr.country}`;
});

// API Functions
const fetchDeliveries = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await useFetchDataApi<{
      status: string;
      data: Delivery[];
    }>("/delivery");

    if (response.data.value?.status === "success") {
      deliveries.value = response.data.value.data;
      if (!selectedDelivery.value && deliveries.value.length > 0) {
        selectedDelivery.value = deliveries.value[0];
      }
    }
  } catch (err) {
    console.error("Failed to fetch deliveries:", err);
    error.value = "Failed to load delivery options";
  } finally {
    isLoading.value = false;
  }
};

// New function to fetch addresses
const fetchAddresses = async () => {
  try {
    const addressData = await profileStore.getAddress();
    if (addressData && Array.isArray(addressData)) {
      addresses.value = addressData;
      // Set default address if available
      const defaultAddress = addressData.find((addr) => addr.is_default === 1);
      if (defaultAddress) {
        selectedAddress.value = defaultAddress;
        form.value.useExistingAddress = true;
        form.value.name = defaultAddress.name;
        form.value.phoneNumber = defaultAddress.phone || "";
        form.value.address = formattedAddress.value;
      }
    }
  } catch (err) {
    console.error("Failed to fetch addresses:", err);
    error.value = "Failed to load saved addresses";
  }
};

const placeOrder = async () => {
  if (
    !selectedDelivery.value ||
    (!form.value.useExistingAddress &&
      (!form.value.name || !form.value.phoneNumber || !form.value.address)) ||
    (form.value.useExistingAddress && !selectedAddress.value)
  ) {
    return;
  }

  try {
    loading.value = true;
    cartStore.loading = true;
    error.value = null;

    const orderData: OrderRequest = {
      cart_id: cartStore.cartData?.cart_id || "",
      delivery_id: selectedDelivery.value.id,
      payment_method: "bank",
      shipping_address: form.value.useExistingAddress
        ? formattedAddress.value
        : form.value.address,
      address_name: form.value.useExistingAddress
        ? selectedAddress.value?.name || ""
        : form.value.name,
      phone: form.value.useExistingAddress
        ? selectedAddress.value?.phone || ""
        : form.value.phoneNumber,
      note: form.value.note || "",
    };

    if (form.value.useExistingAddress && selectedAddress.value) {
      orderData.address_id = selectedAddress.value.id;
    }

    const response = await useFetchDataApi<{ status: string; data: Order }>("/orders", {
      method: "POST",
      body: orderData,
    });

    if (response.data.value?.status === "success" && response.data) {
      currentOrder.value = response.data.value.data;
      // Generate QR code when order is created
      if (currentOrder.value.qr_string) {
        await generateQRCode(currentOrder.value.qr_string);
      }
      dialog.value = false;
      paymentDialog.value = true;
      startPaymentCheck();
    } else {
      throw response.data.value?.data || new Error("Order failed");
    }
  } catch (err: any) {
    console.error("Order creation failed:", err);
    error.value = err.message || "Failed to place order. Please try again.";
  } finally {
    loading.value = false;
    cartStore.loading = false;
  }
};

const placeSingleItemOrder = async () => {
  if (!selectedDelivery.value || !form.value.selectedItem) {
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const orderData = {
      cart_id: cartStore.cartData?.cart_id || "",
      item_variant_id: form.value.selectedItem.item_variant.id,
      quantity: form.value.selectedItem.quantity,
      delivery_id: selectedDelivery.value.id,
      payment_method: "bank",
      shipping_address: form.value.useExistingAddress
        ? formattedAddress.value
        : form.value.address,
      address_name: form.value.useExistingAddress
        ? selectedAddress.value?.name || ""
        : form.value.name,
      phone: form.value.useExistingAddress
        ? selectedAddress.value?.phone || ""
        : form.value.phoneNumber,
      note: form.value.note || "",
      ...(form.value.useExistingAddress &&
        selectedAddress.value && {
          address_id: selectedAddress.value.id,
        }),
    };

    const response = await useFetchDataApi<{ status: string; data: Order }>("/orders", {
      method: "POST",
      body: orderData,
    });

    if (response.data.value?.status === "success" && response.data) {
      currentOrder.value = response.data.value.data;
      // Calculate the correct total for single item
      currentOrder.value.total_amount =
        form.value.selectedItem.total_price +
        parseFloat(selectedDelivery.value.delivery_fee);

      if (currentOrder.value.qr_string) {
        await generateQRCode(currentOrder.value.qr_string);
      }
      dialog.value = false;
      paymentDialog.value = true;
      startPaymentCheck();
    } else {
      throw response.data.value?.data || new Error("Order failed");
    }
  } catch (err: any) {
    console.error("Single item order creation failed:", err);
    error.value = err.message || "Failed to place order. Please try again.";
  } finally {
    loading.value = false;
  }
};

const startPaymentCheck = () => {
  if (!currentOrder.value) return;

  paymentStatus.value = "checking";

  paymentCheckInterval.value = setInterval(async () => {
    try {
      const res = await useFetchDataApi<{ status: string }>(
        `/orders/${currentOrder.value!.order_id}/status`
      );

      if (res.data.value?.status === "completed") {
        paymentStatus.value = "completed";
        stopPaymentCheck();
      } else if (res.data.value?.status === "failed") {
        paymentStatus.value = "failed";
      }
    } catch (err) {
      console.error("Payment check failed:", err);
    }
  }, 3000);
};

const stopPaymentCheck = () => {
  if (paymentCheckInterval.value) {
    clearInterval(paymentCheckInterval.value);
    paymentCheckInterval.value = null;
  }
};

// Cart item actions using store methods
const increase = async (item: any) => {
  try {
    loading.value = true;
    await cartStore.updateCartItem(item.item_variant.id, item.quantity + 1);
  } catch (err) {
    console.error("Failed to increase quantity:", err);
    error.value = "Failed to update quantity";
  } finally {
    loading.value = false;
  }
};

const decrease = async (item: any) => {
  if (item.quantity > 1) {
    try {
      loading.value = true;
      await cartStore.updateCartItem(item.item_variant.id, item.quantity - 1);
    } catch (err) {
      console.error("Failed to decrease quantity:", err);
      error.value = "Failed to update quantity";
    } finally {
      loading.value = false;
    }
  }
};

const removeItem = async (itemVariantId: string) => {
  try {
    loading.value = true;
    await cartStore.deleteCartItem(itemVariantId);
  } catch (err) {
    console.error("Failed to remove item:", err);
    error.value = "Failed to remove item";
  } finally {
    loading.value = false;
  }
};

const buyNow = (item: any) => {
  // Create a copy of the item to avoid reactivity issues
  form.value.selectedItem = {
    ...item,
    item_variant: { ...item.item_variant },
    total_price: item.total_price
  };
  dialog.value = true;
};

const submitForm = async () => {
  if (form.value.selectedItem) {
    await placeSingleItemOrder();
  } else {
    await placeOrder();
  }
};

const openDeliverySelection = () => {
  deliveryDialog.value = true;
};

const selectDelivery = (delivery: Delivery) => {
  selectedDelivery.value = delivery;
  deliveryDialog.value = false;
};

// New address selection functions
const openAddressSelection = () => {
  addressDialog.value = true;
};

const selectAddress = (address: Address) => {
  selectedAddress.value = address;
  form.value.useExistingAddress = true;
  form.value.name = address.name;
  form.value.phoneNumber = address.phone || "";
  form.value.address = formattedAddress.value;
  addressDialog.value = false;
};

const useNewAddress = () => {
  form.value.useExistingAddress = false;
  selectedAddress.value = null;
  form.value.name = "";
  form.value.phoneNumber = "";
  form.value.address = "";
  addressDialog.value = false;
};

const generateQRCode = async (qrString: string) => {
  try {
    const url = await QRCode.toDataURL(qrString, {
      width: 240,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    qrCodeDataUrl.value = url;
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
};

// Lifecycle hooks
onMounted(async () => {
  try {
    isLoading.value = true;

    // Only fetch cart if not already loaded or if it's empty
    if (!cartStore.cartData || cartStore.cartData.items?.length === 0) {
      await cartStore.fetchCart();
    }
    await Promise.all([fetchDeliveries(), fetchAddresses()]);
  } catch (err) {
    console.error("Failed to initialize cart page:", err);
    error.value = "Failed to load page data";
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  stopPaymentCheck();
});
</script>

<template>
  <div>
    <div
      class="bg-gray-200 h-[400px] flex items-center justify-center text-center"
      style="
        background-image: url('https://t3.ftcdn.net/jpg/02/84/32/52/360_F_284325273_ei2pxwlAyg4ghLOBINFPiF1LVubbfLpA.jpg');
        object-fit: cover;
        background-size: cover;
        background-position: left center;
      "
    >
      <h1 class="uppercase text-[30px] font-bold text-white">shopping cart</h1>
    </div>

    <v-container class="mt-4">
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-2">Loading cart...</p>
      </div>

      <!-- Empty cart state -->
      <div
        v-if="!isLoading && cartItems.length === 0"
        class="text-center flex items-center justify-center"
      >
        <div class="">
          <div class="text-center flex items-center justify-center">
            <img class="w-40" src="images/no_data.gif" alt="" />
          </div>
          <p class="text-xl text-gray-600">Your cart is empty</p>
          <v-btn color="primary" class="mt-4" :to="'/woman'"> Continue Shopping </v-btn>
        </div>
      </div>

      <!-- Cart content -->
      <v-row v-if="!isLoading && cartItems.length > 0">
        <v-col cols="12" sm="7" md="8">
          <!-- title  -->
          <v-row class="uppercase border-b text-center">
            <v-col cols="3" md="3" class="text-left">
              <p class="text-center">Product</p>
            </v-col>
            <v-col cols="2" class="flex items-center justify-center">
              <p class="">Price</p>
            </v-col>
            <v-col cols="3" md="3" class="flex items-center justify-center">
              <p class="">Quantity</p>
            </v-col>
            <v-col cols="2" class="flex items-center justify-center">
              <p class="">Total</p>
            </v-col>
            <v-col cols="2" md="1" class="flex items-center justify-between"> </v-col>
          </v-row>

          <v-row
            v-for="item in cartItems"
            :key="item.cart_item_id"
            class="uppercase border-b text-center"
          >
            <v-col cols="3" md="3" class="pa-0">
              <div
                class="py-3 flex-col items-center justify-center sm:flex-row sm:items-center sm:space-x-4"
              >
                <v-card class="w-[100px] mx-auto sm:mx-0">
                  <img
                    :src="item.item_variant.image"
                    :alt="item.item_variant.item.name"
                  />
                </v-card>
                <p
                  class="pt-2 text-center sm:pt-0 sm:text-left text-[10px] md:text-[15px]"
                >
                  {{ item.item_variant.item.name }}
                </p>
              </div>
            </v-col>

            <v-col cols="2" class="flex items-center justify-center">
              <p class="text-grey">${{ item.final_price }}</p>
            </v-col>

            <v-col cols="3" md="3" class="flex items-center justify-center">
              <div
                class="flex items-center justify-between px-2 py-1 md:w-[100%] lg:w-[80%]"
              >
                <v-btn
                  size="small"
                  variant="flat"
                  @click="decrease(item)"
                  :disabled="item.quantity <= 1 || loading"
                  icon
                  class="bg-gray-100 hover:bg-gray-200"
                >
                  <v-icon>mdi-minus</v-icon>
                </v-btn>

                <div class="relative">
                  <v-progress-circular
                    v-if="loading"
                    indeterminate
                    size="16"
                    width="2"
                    color="primary"
                    class="absolute -top-1 -right-1"
                  ></v-progress-circular>
                  <p v-else class="text-center w-8 min-w-8">
                    {{ item.quantity }}
                  </p>
                </div>

                <v-btn
                  variant="tonal"
                  size="small"
                  @click="increase(item)"
                  :disabled="loading"
                  icon
                  class="bg-blue-50 hover:bg-blue-100"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
            </v-col>

            <v-col cols="2" class="flex items-center justify-center">
              <p class="font-bold">${{ item.total_price }}</p>
            </v-col>

            <v-col cols="2" md="2" class="flex items-center justify-between">
              <div class="flex flex-col items-center justify-between">
                <!-- <v-btn
                  variant="text"
                  icon
                  :disabled="loading"
                  @click="buyNow(item)"
                  class="text-blue-600 hover:text-blue-800"
                  size="small"
                >
                  <v-icon size="22">mdi-cart-arrow-down</v-icon>
                </v-btn> -->
                <v-btn
                  variant="text"
                  icon
                  :disabled="loading"
                  @click="removeItem(item.item_variant.id)"
                  class="text-red-500 hover:text-red-700"
                >
                  <v-icon size="22">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" sm="5" md="4">
          <v-card class="!bg-gray-100 pa-5">
            <p class="uppercase border-b pb-3 font-bold">order summary</p>

            <!-- Delivery Selection -->
            <v-card class="mt-3 mb-4" elevation="1">
              <div class="address-preview-header">
                <div class="flex items-center space-x-2">
                  <div class="address-preview-icon">
                    <v-icon size="16" color="white">mdi-truck-delivery</v-icon>
                  </div>
                  <h3 class="font-bold text-white text-sm">Delivery Method</h3>
                </div>
                <v-btn
                  size="small"
                  variant="outlined"
                  color="white"
                  @click="openDeliverySelection"
                  class="address-change-btn"
                >
                  <v-icon size="16" class="mr-1">mdi-pencil</v-icon>
                  Change
                </v-btn>
              </div>
              <div v-if="selectedDelivery" class="flex items-center space-x-3 pa-3">
                <img
                  :src="selectedDelivery.logo"
                  :alt="selectedDelivery.name"
                  class="w-10 h-10 object-cover rounded"
                />
                <div>
                  <p class="font-semibold">{{ selectedDelivery.name }}</p>
                  <p class="text-sm text-grey">
                    {{ selectedDelivery.description }}
                  </p>
                  <p class="text-sm font-bold text-primary">
                    ${{ selectedDelivery.delivery_fee }}
                  </p>
                </div>
              </div>
            </v-card>

            <!-- Address Selection Preview -->
            <!-- <v-card class="address-preview-card rounded shadow-sm" v-if="selectedAddress">
              <div class="address-preview-header">
                <div class="flex items-center space-x-2">
                  <div class="address-preview-icon">
                    <v-icon size="16" color="white">mdi-truck-delivery</v-icon>
                  </div>
                  <h3 class="font-bold text-white text-sm">Shipping Address</h3>
                </div>
                <v-btn
                  size="small"
                  variant="outlined"
                  color="white"
                  @click="openAddressSelection"
                  class="address-change-btn"
                >
                  <v-icon size="16" class="mr-1">mdi-pencil</v-icon>
                  Change
                </v-btn>
              </div>

              <div class="address-preview-content">
                <div class="address-preview-main">
                  <div class="flex items-start space-x-3">
                    <div class="address-avatar">
                      <v-icon size="20" color="primary">mdi-account-circle</v-icon>
                    </div>
                    <div class="flex-1">
                      <h4 class="font-bold text-gray-800">
                        {{ selectedAddress.name }}
                      </h4>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ formattedAddress }}
                      </p>
                      <p class="text-sm text-gray-600" v-if="selectedAddress.phone">
                        <v-icon size="12" class="mr-1">mdi-phone</v-icon>
                        {{ selectedAddress.phone }}
                      </p>
                    </div>
                    <div class="address-preview-badge" v-if="selectedAddress.is_default">
                      <v-icon size="10">mdi-star</v-icon>
                      <span>Default</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card> -->

            <v-row class="mt-3" v-for="item in cartItems" :key="item.cart_item_id">
              <v-col cols="8">
                <div class="flex">
                  <v-card width="100" class="me-3 flex-shrink-0">
                    <img
                      class="object-cover h-[120px] w-full"
                      :src="item.item_variant.image"
                      :alt="item.item_variant.item.name"
                    />
                  </v-card>
                  <div>
                    <p>{{ item.item_variant.item.name }}</p>
                    <p class="text-grey">Quantity : {{ item.quantity }}</p>
                    <p class="text-grey">Size : {{ item.item_variant.size.name }}</p>
                    <p class="text-grey">Color : {{ item.item_variant.color.name }}</p>
                  </div>
                </div>
              </v-col>

              <v-col>
                <p class="text-grey text-center">${{ item.total_price }}</p>
                <!-- <v-btn
                  size="small"
                  color="primary"
                  variant="outlined"
                  class="mt-2"
                  @click="buyNow(item)"
                  :disabled="loading"
                >
                  Buy Now
                </v-btn> -->
              </v-col>
            </v-row>

            <!-- border -->
            <div class="border-b my-8"></div>
            <div>
              <v-row class="items-center">
                <v-col>
                  <p class="uppercase font-bold">subtotal</p>
                </v-col>
                <p class="pr-3 text-grey">${{ subtotal }}</p>
              </v-row>
              <v-row class="items-center">
                <v-col>
                  <p class="uppercase font-bold">DELIVERY</p>
                </v-col>
                <p class="pr-3 text-grey">${{ deliveryFee }}</p>
              </v-row>
              <v-row class="items-center" v-if="totalSavings > 0">
                <v-col>
                  <p class="uppercase font-bold">TOTAL SAVINGS</p>
                </v-col>
                <p class="pr-3 text-red-500">- ${{ totalSavings }}</p>
              </v-row>

              <div class="border-b my-8"></div>
              <v-row class="items-center text-[20px] font-bold">
                <v-col>
                  <p class="uppercase">TOTAL</p>
                </v-col>
                <p class="pr-3">${{ total }}</p>
              </v-row>
              <v-btn
                class="w-full mt-4 text-white"
                color="black"
                variant="elevated"
                size="large"
                @click="dialog = true"
                :disabled="loading || !selectedDelivery"
              >
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  size="20"
                  width="2"
                  class="mr-2"
                ></v-progress-circular>
                proceed to checkout
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Address Selection Dialog -->
      <v-dialog v-model="addressDialog" max-width="700px">
        <v-card class="address-dialog-card">
          <!-- Modern Header -->
          <div class="address-dialog-header">
            <div class="flex items-center space-x-3">
              <div class="address-icon-wrapper">
                <v-icon size="24" color="white">mdi-map-marker</v-icon>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">Select Shipping Address</h2>
                <p class="text-blue-100 text-sm">
                  Choose from saved addresses or add new one
                </p>
              </div>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              @click="addressDialog = false"
              class="address-close-btn"
            />
          </div>

          <div class="address-dialog-content">
            <!-- Option to use new address -->
            <div class="new-address-card" @click="useNewAddress">
              <div class="new-address-content">
                <div class="new-address-icon">
                  <v-icon size="32" color="primary">mdi-plus-circle</v-icon>
                </div>
                <div class="new-address-text">
                  <h3 class="font-bold text-lg text-primary">Add New Address</h3>
                  <p class="text-gray-600">Enter a new shipping address for this order</p>
                </div>
                <div class="new-address-arrow">
                  <v-icon color="primary">mdi-chevron-right</v-icon>
                </div>
              </div>
            </div>

            <!-- Existing addresses -->
            <div v-if="addresses.length > 0" class="saved-addresses-section">
              <div class="section-header">
                <h3 class="font-bold text-gray-800 flex items-center">
                  <v-icon size="20" class="mr-2" color="gray"
                    >mdi-bookmark-multiple</v-icon
                  >
                  Saved Addresses
                </h3>
                <span class="text-sm text-gray-500">{{ addresses.length }} saved</span>
              </div>

              <div class="addresses-grid">
                <div
                  v-for="address in addresses"
                  :key="address.id"
                  :class="[
                    'address-card',
                    selectedAddress?.id === address.id
                      ? 'address-card-selected'
                      : 'address-card-default',
                  ]"
                  @click="selectAddress(address)"
                >
                  <!-- Selection indicator -->
                  <div class="address-card-indicator">
                    <div
                      :class="[
                        'selection-dot',
                        selectedAddress?.id === address.id ? 'selected' : '',
                      ]"
                    ></div>
                  </div>

                  <!-- Address content -->
                  <div class="address-card-content">
                    <div class="address-header">
                      <div class="flex items-center space-x-2">
                        <v-icon
                          size="18"
                          :color="selectedAddress?.id === address.id ? 'primary' : 'gray'"
                        >
                          mdi-account-circle
                        </v-icon>
                        <h4 class="font-bold text-lg">{{ address.name }}</h4>
                      </div>
                      <div class="address-badges">
                        <div v-if="address.is_default" class="default-badge">
                          <v-icon size="12">mdi-star</v-icon>
                          <span>Default</span>
                        </div>
                        <div
                          v-if="selectedAddress?.id === address.id"
                          class="selected-badge"
                        >
                          <v-icon size="12">mdi-check</v-icon>
                          <span>Selected</span>
                        </div>
                      </div>
                    </div>

                    <div class="address-details">
                      <div class="address-line">
                        <v-icon size="14" color="gray" class="address-line-icon"
                          >mdi-home</v-icon
                        >
                        <span>{{ address.home }}, {{ address.street }}</span>
                      </div>
                      <div class="address-line">
                        <v-icon size="14" color="gray" class="address-line-icon"
                          >mdi-map-marker</v-icon
                        >
                        <span>{{ address.city }}, {{ address.country }}</span>
                      </div>
                      <div class="address-line" v-if="address.phone">
                        <v-icon size="14" color="gray" class="address-line-icon"
                          >mdi-phone</v-icon
                        >
                        <span>{{ address.phone }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Hover effect overlay -->
                  <div class="address-card-overlay"></div>
                </div>
              </div>
            </div>

            <!-- No addresses message -->
            <div v-else class="no-addresses">
              <div class="no-addresses-icon">
                <v-icon size="48" color="gray">mdi-map-marker-off</v-icon>
              </div>
              <h3 class="font-bold text-gray-700 mb-2">No saved addresses</h3>
              <p class="text-gray-500 text-center max-w-sm">
                You don't have any saved addresses yet. Add a new address to get started.
              </p>
            </div>
          </div>
        </v-card>
      </v-dialog>

      <!-- Delivery Selection Dialog -->
      <v-dialog v-model="deliveryDialog" max-width="500px">
        <v-card class="pa-4">
          <v-card-title class="text-h6 font-bold mb-4">
            <div class="flex justify-between items-center">
              <span>Select Delivery Method</span>
              <v-btn icon="mdi-close" variant="text" @click="deliveryDialog = false" />
            </div>
          </v-card-title>

          <div class="space-y-3">
            <v-card
              v-for="delivery in deliveries"
              :key="delivery.id"
              :class="[
                'pa-3 cursor-pointer transition-colors',
                selectedDelivery?.id === delivery.id
                  ? 'bg-blue-50 border-blue-500 border-2'
                  : 'hover:bg-gray-50 border border-gray-200',
              ]"
              @click="selectDelivery(delivery)"
            >
              <div class="flex items-center space-x-4">
                <img
                  :src="delivery.logo"
                  :alt="delivery.name"
                  class="w-12 h-12 object-cover rounded"
                />
                <div class="flex-1">
                  <p class="font-semibold">{{ delivery.name }}</p>
                  <p class="text-sm text-grey">{{ delivery.description }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-lg">${{ delivery.delivery_fee }}</p>
                </div>
              </div>
            </v-card>
          </div>
        </v-card>
      </v-dialog>

      <!-- Checkout Dialog -->
      <v-dialog v-model="dialog" max-width="600px">
        <v-card class="pa-5">
          <v-card-title class="text-h6 font-bold">
            <v-row class="mb-2 items-center">
              <p>
                {{ form.selectedItem ? "SINGLE ITEM CHECKOUT" : "SHIPPING ADDRESS" }}
              </p>
              <v-spacer></v-spacer>
              <v-btn
                icon="mdi-close"
                @click="
                  dialog = false;
                  form.selectedItem = null;
                "
                class="text-red-500 hover:text-red-700"
                variant="text"
              />
            </v-row>
          </v-card-title>

          <v-card-text class="pa-0">
            <!-- Single Item Summary -->
            <v-card v-if="form.selectedItem" class="mb-4 pa-3 bg-blue-50">
              <p class="font-bold mb-2">Item to Purchase:</p>
              <div class="flex items-center space-x-3">
                <img
                  :src="form.selectedItem.item_variant.image"
                  :alt="form.selectedItem.item_variant.item.name"
                  class="w-20 h-25 object-cover rounded"
                />
                <div>
                  <p class="font-semibold">
                    {{ form.selectedItem.item_variant.item.name }}
                  </p>
                  <p class="text-sm text-grey">
                    Quantity: {{ form.selectedItem.quantity }}
                  </p>
                  <p class="text-sm text-grey">
                    Size: {{ form.selectedItem.item_variant.size.name }}
                  </p>
                  <p class="text-sm text-grey">
                    Color: {{ form.selectedItem.item_variant.color.name }}
                  </p>
                  <p class="font-bold text-primary">
                    Total: ${{ form.selectedItem.total_price + deliveryFee }}
                  </p>
                </div>
              </div>
            </v-card>

            <!-- Delivery Summary -->
            <v-card v-if="selectedDelivery" class="mb-4 pa-3 bg-green-50">
              <p class="font-bold mb-2">Delivery Method:</p>
              <div class="flex items-center space-x-3">
                <img
                  :src="selectedDelivery.logo"
                  :alt="selectedDelivery.name"
                  class="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p class="font-semibold">{{ selectedDelivery.name }}</p>
                  <p class="text-sm text-grey">
                    {{ selectedDelivery.description }}
                  </p>
                  <p class="font-bold text-primary">
                    ${{ selectedDelivery.delivery_fee }}
                  </p>
                </div>
              </div>
            </v-card>

            <!-- Address Type Selection -->
            <div class="address-type-card bg-blue-50">
              <div class="address-type-header">
                <h3 class="font-bold flex items-center">
                  <v-icon size="20" class="mr-2" color="primary"
                    >mdi-map-marker-check</v-icon
                  >
                  Address Options
                </h3>
              </div>

              <div class="address-options">
                <!-- Saved Address Option -->
                <div
                  :class="[
                    'address-option',
                    form.useExistingAddress
                      ? 'address-option-active'
                      : 'address-option-inactive',
                  ]"
                  @click="form.useExistingAddress = true"
                >
                  <div class="address-option-radio">
                    <div
                      :class="['radio-dot', form.useExistingAddress ? 'active' : '']"
                    ></div>
                  </div>
                  <div class="address-option-content">
                    <div class="flex items-center justify-between w-full">
                      <div>
                        <h4 class="font-semibold">Use saved address</h4>
                        <p class="text-sm text-gray-500">
                          {{
                            addresses.length > 0
                              ? `${addresses.length} address${
                                  addresses.length > 1 ? "es" : ""
                                } available`
                              : "No saved addresses"
                          }}
                        </p>
                      </div>
                      <v-btn
                        v-if="addresses.length > 0"
                        size="small"
                        :variant="form.useExistingAddress ? 'elevated' : 'outlined'"
                        :color="form.useExistingAddress ? 'primary' : 'gray'"
                        @click.stop="openAddressSelection"
                        class="address-select-btn"
                      >
                        <v-icon size="16" class="mr-1">
                          {{ selectedAddress ? "mdi-pencil" : "mdi-plus" }}
                        </v-icon>
                        {{ selectedAddress ? "Change" : "Select" }}
                      </v-btn>
                    </div>
                  </div>
                </div>

                <!-- New Address Option -->
                <div
                  :class="[
                    'address-option',
                    !form.useExistingAddress
                      ? 'address-option-active'
                      : 'address-option-inactive',
                  ]"
                  @click="form.useExistingAddress = false"
                >
                  <div class="address-option-radio">
                    <div
                      :class="['radio-dot', !form.useExistingAddress ? 'active' : '']"
                    ></div>
                  </div>
                  <div class="address-option-content">
                    <div>
                      <h4 class="font-semibold">Enter new address</h4>
                      <p class="text-sm text-gray-500">
                        Add a new shipping address for this order
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Address Preview -->
              <div
                v-if="form.useExistingAddress && selectedAddress"
                class="selected-address-preview"
              >
                <div class="selected-address-content">
                  <div class="flex items-start space-x-3">
                    <div class="selected-address-icon">
                      <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                    </div>
                    <div class="flex-1">
                      <h4 class="font-bold text-gray-800">
                        {{ selectedAddress.name }}
                      </h4>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ formattedAddress }}
                      </p>
                      <p
                        class="text-sm text-gray-600 flex items-center mt-1"
                        v-if="selectedAddress.phone"
                      >
                        <v-icon size="12" class="mr-1">mdi-phone</v-icon>
                        {{ selectedAddress.phone }}
                      </p>
                    </div>
                    <div class="selected-address-badge" v-if="selectedAddress.is_default">
                      <v-icon size="10">mdi-star</v-icon>
                      <span>Default</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <v-form v-model="isValid" @submit.prevent="submitForm">
              <!-- Form fields - only show when not using existing address -->
              <template v-if="!form.useExistingAddress">
                <v-text-field
                  v-model="form.name"
                  label="Full Name"
                  :rules="[rules.required]"
                  required
                  class="mb-3"
                  prepend-inner-icon="mdi-account"
                />

                <v-text-field
                  v-model="form.phoneNumber"
                  label="Phone Number"
                  :rules="[rules.required, rules.phoneNumber]"
                  required
                  class="mb-3"
                  prepend-inner-icon="mdi-phone"
                />

                <v-text-field
                  v-model="form.address"
                  label="Shipping Address"
                  :rules="[rules.required, rules.address]"
                  required
                  class="mb-3"
                  prepend-inner-icon="mdi-map-marker"
                />
              </template>

              <!-- Show readonly fields when using existing address -->
              <template v-else-if="selectedAddress">
                <v-text-field
                  :model-value="selectedAddress.name"
                  label="Full Name"
                  readonly
                  class="mb-3"
                  prepend-inner-icon="mdi-account"
                  variant="filled"
                />

                <v-text-field
                  :model-value="selectedAddress.phone || 'No phone number'"
                  label="Phone Number"
                  readonly
                  class="mb-3"
                  prepend-inner-icon="mdi-phone"
                  variant="filled"
                />

                <v-text-field
                  :model-value="formattedAddress"
                  label="Shipping Address"
                  readonly
                  class="mb-3"
                  prepend-inner-icon="mdi-map-marker"
                  variant="filled"
                />
              </template>

              <v-textarea
                v-model="form.note"
                label="Order Note (Optional)"
                class="mb-3"
                prepend-inner-icon="mdi-note-text"
                rows="3"
              />

              <v-btn
                type="submit"
                :disabled="
                  !isValid ||
                  loading ||
                  !selectedDelivery ||
                  (form.useExistingAddress && !selectedAddress)
                "
                color="primary"
                class="mt-2 w-full"
                size="large"
              >
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  size="20"
                  width="2"
                  class="mr-2"
                ></v-progress-circular>
                {{ form.selectedItem ? "Place Single Item Order" : "Place Order" }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Payment Dialog with QR Code -->
      <v-dialog v-model="paymentDialog" max-width="500px" persistent>
        <v-card class="pa-6 text-center">
          <v-card-title class="text-h5 font-bold mb-4"> Payment Required </v-card-title>

          <div v-if="currentOrder">
            <!-- Order Summary -->
            <!-- In your payment dialog template -->
            <v-card v-if="currentOrder" class="mb-4 pa-4 bg-gray-50">
              <!-- <p class="font-bold">Order #{{ currentOrder.order_number }}</p> -->
              <p class="text-lg font-bold text-primary">
                Total: ${{ currentOrder.total_amount.toFixed(2) }}
              </p>
              <p v-if="form.selectedItem" class="text-sm text-grey">
                (Single item purchase)
              </p>
              <p v-else class="text-sm text-grey">(Full cart purchase)</p>
              <p class="text-sm text-grey">
                Delivery: {{ currentOrder.delivery_method }}
              </p>
            </v-card>

            <!-- QR Code Display -->
            <div class="mb-4">
              <p class="font-bold mb-3">Scan QR Code to Pay</p>

              <!-- Real QR Code Display -->
              <div class="flex justify-center mb-4">
                <div class="border-2 border-gray-300 p-4 rounded-lg bg-white shadow-lg">
                  <div
                    v-if="qrCodeDataUrl"
                    class="w-64 h-64 flex items-center justify-center"
                  >
                    <img
                      :src="qrCodeDataUrl"
                      alt="Payment QR Code"
                      class="max-w-full max-h-full"
                    />
                  </div>
                  <div
                    v-else
                    class="w-64 h-64 flex items-center justify-center bg-gray-100"
                  >
                    <v-progress-circular
                      indeterminate
                      size="40"
                      width="4"
                    ></v-progress-circular>
                  </div>
                </div>
              </div>

              <!-- QR String for manual input -->
              <!-- <v-card class="pa-3 bg-blue-50 mb-4 text-left">
                <p class="text-xs font-bold mb-2">
                  QR String (for manual input):
                </p>
                <div class="flex items-center justify-between">
                  <p class="text-xs font-mono break-all flex-1 mr-2">
                    {{ currentOrder.qr_string }}
                  </p>
                  <v-btn
                    size="x-small"
                    variant="outlined"
                    @click="copyQrString"
                    class="flex-shrink-0"
                  >
                    Copy
                  </v-btn>
                </div>
              </v-card> -->
            </div>

            <!-- Keep all your existing payment status and instructions sections -->
            <div class="mb-4">
              <v-alert v-if="paymentStatus === 'pending'" type="info" class="mb-2">
                <div class="flex items-center">
                  <v-progress-circular
                    indeterminate
                    size="20"
                    width="2"
                    class="mr-2"
                  ></v-progress-circular>
                  Waiting for payment...
                </div>
              </v-alert>

              <v-alert v-if="paymentStatus === 'checking'" type="warning" class="mb-2">
                <div class="flex items-center">
                  <v-progress-circular
                    indeterminate
                    size="20"
                    width="2"
                    class="mr-2"
                  ></v-progress-circular>
                  Verifying payment...
                </div>
              </v-alert>

              <v-alert v-if="paymentStatus === 'completed'" type="success" class="mb-2">
                <div class="flex items-center">
                  <v-icon class="mr-2">mdi-check-circle</v-icon>
                  Payment successful! Redirecting...
                </div>
              </v-alert>

              <v-alert v-if="paymentStatus === 'failed'" type="error" class="mb-2">
                <div class="flex items-center">
                  <v-icon class="mr-2">mdi-alert-circle</v-icon>
                  Payment failed. Please try again.
                </div>
              </v-alert>
            </div>

            <!-- Instructions -->
            <v-card class="pa-3 bg-yellow-50 text-left">
              <p class="font-bold mb-2">Payment Instructions:</p>
              <ol class="text-sm space-y-1">
                <li>1. Open your banking app (ABA, Wing, etc.)</li>
                <li>2. Select QR code payment/KHQR</li>
                <li>3. Scan the QR code above</li>
                <li>4. Confirm the payment amount</li>
                <li>5. Complete the transaction</li>
              </ol>
              <div class="mt-3 p-2 bg-yellow-100 rounded">
                <p class="text-xs text-yellow-800">
                  <strong>Note:</strong> Payment verification may take up to 30 seconds
                </p>
              </div>
            </v-card>

            <!-- Cancel Order Button -->
            <v-btn
              v-if="paymentStatus === 'pending' || paymentStatus === 'checking'"
              variant="text"
              color="red"
              class="mt-4"
              @click="
                paymentDialog = false;
                stopPaymentCheck();
              "
            >
              Cancel Order
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<style scoped>
/* Existing styles */
.text-red {
  color: #ef4444;
}

.text-red-500 {
  color: #ef4444;
}

.text-red-700 {
  color: #b91c1c;
}

.hover\:text-red-500:hover {
  color: #ef4444;
}

.hover\:text-red-700:hover {
  color: #b91c1c;
}

.hover\:bg-gray-200:hover {
  background-color: #e5e7eb;
}

.hover\:bg-blue-100:hover {
  background-color: #dbeafe;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-yellow-50 {
  background-color: #fefce8;
}

.bg-yellow-100 {
  background-color: #fef3c7;
}

.transition-colors {
  transition-property: color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.border-blue-500 {
  border-color: #3b82f6;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.text-yellow-800 {
  color: #92400e;
}

.break-all {
  word-break: break-all;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

/* Modern Address Dialog Styles */
.address-dialog-card {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.address-dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.address-close-btn {
  opacity: 0.8;
}

.address-close-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1) !important;
}

.address-dialog-content {
  padding: 24px;
}

/* New Address Card */
.new-address-card {
  background: linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%);
  border: 2px dashed #3b82f6;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.new-address-card:hover {
  border-color: #2563eb;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
}

.new-address-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.new-address-icon {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.new-address-text {
  flex: 1;
  margin-left: 16px;
}

.new-address-arrow {
  opacity: 0.6;
  transition: all 0.3s ease;
}

.new-address-card:hover .new-address-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Saved Addresses Section */
.saved-addresses-section {
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.addresses-grid {
  display: grid;
  gap: 16px;
}

/* Address Cards */
.address-card {
  position: relative;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.address-card-default {
  background: #fafafa;
  border: 2px solid #e5e7eb;
}

.address-card-selected {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.address-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.address-card-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
}

.selection-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: white;
  transition: all 0.3s ease;
  position: relative;
}

.selection-dot.selected {
  background: #3b82f6;
  border-color: #3b82f6;
}

.selection-dot.selected::after {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.address-card-content {
  padding-right: 40px;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.address-badges {
  display: flex;
  gap: 8px;
}

.default-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fbbf24;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.selected-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.address-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-line {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 14px;
}

.address-line-icon {
  margin-right: 8px;
  opacity: 0.7;
}

.address-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.05) 0%,
    rgba(59, 130, 246, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.address-card:hover .address-card-overlay {
  opacity: 1;
}

/* No Addresses */
.no-addresses {
  text-align: center;
  padding: 48px 24px;
}

.no-addresses-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Address Preview Card */
.address-preview-card {
  border-radius: 16px;
  margin: 12px 0 16px 0;
}

.address-preview-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #246ec8 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.address-preview-icon {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-change-btn {
  border-color: rgba(255, 255, 255, 0.5) !important;
  font-size: 12px !important;
  height: 32px !important;
}

.address-change-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: white !important;
}

.address-preview-content {
  padding: 20px;
  background: white;
  backdrop-filter: blur(10px);
}

.address-avatar {
  width: 40px;
  height: 40px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.address-preview-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fbbf24;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

/* Address Type Selection */
.address-type-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.address-type-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.address-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-option {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.address-option-inactive {
  background: white;
  border-color: #e5e7eb;
}

.address-option-active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.address-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.address-option-radio {
  margin-right: 12px;
  margin-top: 2px;
}

.radio-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: white;
  transition: all 0.3s ease;
  position: relative;
}

.radio-dot.active {
  background: #3b82f6;
  border-color: #3b82f6;
}

.radio-dot.active::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.address-option-content {
  flex: 1;
}

.address-select-btn {
  font-size: 12px !important;
  height: 32px !important;
  min-width: 80px !important;
}

/* Selected Address Preview */
.selected-address-preview {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.selected-address-content {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.selected-address-icon {
  width: 32px;
  height: 32px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.selected-address-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fbbf24;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .address-dialog-header {
    padding: 20px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .address-dialog-content {
    padding: 16px;
  }

  .new-address-card {
    padding: 16px;
  }

  .new-address-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .new-address-arrow {
    display: none;
  }

  .address-card {
    padding: 16px;
  }

  .address-card-content {
    padding-right: 32px;
  }

  .address-preview-header {
    padding: 12px 16px;
  }

  .address-preview-content {
    padding: 16px;
  }

  .address-type-card {
    padding: 16px;
  }

  .address-option {
    padding: 12px;
  }

  .selected-address-content {
    padding: 12px;
  }
}

/* Animation keyframes */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.address-dialog-card {
  animation: slideInUp 0.3s ease-out;
}

.address-card {
  animation: fadeIn 0.5s ease-out;
}

.address-card:nth-child(2) {
  animation-delay: 0.1s;
}

.address-card:nth-child(3) {
  animation-delay: 0.2s;
}

.address-card:nth-child(4) {
  animation-delay: 0.3s;
}

/* Loading states */
.address-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

/* Error states */
.address-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  color: #dc2626;
}

/* Success states */
.address-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  color: #166534;
}

/* Accessibility improvements */
.address-option:focus-visible,
.address-card:focus-visible,
.new-address-card:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Custom scrollbar for dialog */
.address-dialog-content::-webkit-scrollbar {
  width: 6px;
}

.address-dialog-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.address-dialog-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.address-dialog-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
