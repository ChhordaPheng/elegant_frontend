<script setup lang="ts">
import { useFetchDataApi } from "~/composables/userFetchApi";
import QRCode from "qrcode";
import Login from "~/components/Login.vue";

// Nuxt-specific imports
const router = useRouter();
const config = useRuntimeConfig();
const qrCodeDataUrl = ref<string>("");

// Use stores (only for deliveries and addresses)
const deliveryStore = useDeliveryStore();

// Authentication stores and state
const loginStore = useLoginStore();
const { authenticated } = storeToRefs(loginStore);
const token = useCookie("accessToken");
const profileStore = useProfileStore();
const { userProfile } = storeToRefs(profileStore);

// Types
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
  items: Array<{
    item_variant_id: string;
    quantity: number;
    item_name: string;
    item_sku?: string | null;
    size: string;
    color: string;
    item_image: string;
    original_price: number;
    final_price: number;
    total_price: number;
    discount_amount: number;
    discount_type?: string | null;
    discount_value?: number | null;
  }>;
  delivery_id: string;
  payment_method: "bank_transfer" | "cash_on_delivery" | "cash";
  address_id?: string;
  phone: string;
  note: string;
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
const paymentDialog = ref<boolean>(false);
const paymentDialogTest = ref<boolean>(true);
const deliveryDialog = ref<boolean>(false);
const addressDialog = ref<boolean>(false);
const loginDialog = ref<boolean>(false);
const hahaDialog = ref<boolean>(false);
const loginTab = ref<string>("login");

const isValid = ref<boolean>(false);
const selectedDelivery = ref<Delivery | null>(null);
const selectedAddress = ref<Address | null>(null);
const selectedPaymentMethod = ref<
  "bank_transfer" | "cash_on_delivery" | "cash"
>("bank_transfer");
const deliveries = ref<Delivery[]>([]);
const addresses = ref<Address[]>([]);
const currentOrder = ref<Order | null>(null);
const paymentStatus = ref<"pending" | "checking" | "completed" | "failed">(
  "pending"
);
const paymentCheckInterval = ref<NodeJS.Timeout | null>(null);

// Cart state (localStorage only)
const cartItems = ref<any[]>([]);
const cartLoaded = ref<boolean>(false);

// Loading and error states
const isLoading = ref<boolean>(false);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

// Success/Error snackbar
const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>("");
const snackbarColor = ref<string>("success");

// Login form states
const showLoginPassword = ref<boolean>(false);
const showRegisterPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);
const loginErrors = ref<Record<string, string>>({});
const loginMessage = ref<string>("");
const loginSnackbar = ref<boolean>(false);

// Payment method options
const paymentMethods = [
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    description: "Pay via QR code using your banking app",
    icon: "mdi-qrcode",
  },
  {
    value: "cash_on_delivery",
    label: "Cash on Delivery",
    description: "Pay cash when your order arrives",
    icon: "mdi-truck-delivery",
  },
  {
    value: "cash",
    label: "Cash Payment",
    description: "Pay cash at pickup location",
    icon: "mdi-cash",
  },
];

// Cart functions (localStorage only)
const loadCartFromStorage = () => {
  if (process.client) {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        cartItems.value = JSON.parse(savedCart);
      } else {
        cartItems.value = [];
      }
      cartLoaded.value = true;
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      cartItems.value = [];
      cartLoaded.value = true;
    }
  }
};

const saveCartToStorage = () => {
  if (process.client) {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems.value));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }
};

const clearCart = () => {
  if (process.client) {
    cartItems.value = [];
    localStorage.removeItem("cart");
    console.log("Cart cleared from localStorage");
  }
};

const updateItemTotal = (index: number) => {
  const item = cartItems.value[index];
  const finalPrice =
    item.variant?.final_price ||
    item.final_price ||
    item.variant?.price ||
    item.price;
  cartItems.value[index].total_price = finalPrice * item.quantity;
};

// Computed properties
const hasItems = computed(() => cartItems.value.length > 0);
const totalItems = computed(() => cartItems.value.length);

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const finalPrice =
      item.variant?.final_price ||
      item.final_price ||
      item.variant?.price ||
      item.price;
    return sum + finalPrice * item.quantity;
  }, 0);
});

const originalSubtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const originalPrice =
      item.variant?.price ||
      item.price ||
      item.variant?.final_price ||
      item.final_price;
    return sum + originalPrice * item.quantity;
  }, 0);
});

const totalSavings = computed(() => originalSubtotal.value - subtotal.value);

const deliveryFee = computed(() => {
  return selectedDelivery.value
    ? parseFloat(selectedDelivery.value.delivery_fee)
    : 2;
});

const total = computed(() => subtotal.value + deliveryFee.value);

// Form data - simplified to single form
const form = ref({
  name: "",
  phoneNumber: "",
  address: "",
  note: "",
  useExistingAddress: false,
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

// Get effective phone number (from profile or form)
const getEffectivePhoneNumber = () => {
  if (form.value.useExistingAddress) {
    // Use profile phone number when using existing address
    return userProfile.value?.phone_number || "";
  } else {
    // Use form phone number for new address
    return form.value.phoneNumber;
  }
};

// Check authentication before checkout
const proceedToCheckout = () => {
  if (!process.client) return;

  // Check if cart has items first
  if (!hasItems.value) {
    showSnackbar("Your cart is empty", "error");
    return;
  }

  const accessToken = token.value;
  const isAuthenticated = authenticated.value;

  // Only check authentication when proceeding to checkout
  if (!accessToken || !isAuthenticated) {
    hahaDialog.value = true; // Show login dialog
    return;
  }

  // If authenticated, proceed to checkout
  dialog.value = true;
};

// Show snackbar function
const showSnackbar = (message: string, color: string = "success") => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Login functions
const handleLoginInDialog = async () => {
  try {
    loginErrors.value = {};
    loginMessage.value = "";
    loginSnackbar.value = false;

    if (!loginStore.user.phone_number) {
      loginErrors.value.username = "Phone number is required";
      loginSnackbar.value = true;
      return;
    }

    if (!loginStore.user.password) {
      loginErrors.value.password = "Password is required";
      loginSnackbar.value = true;
      return;
    }

    const response = await loginStore.fetchLogin();

    if (response && response.customer) {
      if (process.client) {
        localStorage.setItem("user", JSON.stringify(response.customer));
      }

      loginMessage.value = "Login successful! Proceeding to checkout...";
      loginSnackbar.value = true;

      setTimeout(() => {
        hahaDialog.value = false;
        dialog.value = true;
      }, 1000);
    } else {
      loginMessage.value = "Login failed. Please check your credentials";
      loginSnackbar.value = true;
    }
  } catch (error: any) {
    if (error?.response?.data?.errors) {
      loginErrors.value = error.response.data.errors;
      loginMessage.value = "Please check the errors and try again";
    } else if (error?.response?.data?.error) {
      loginMessage.value = error.response.data.error;
    } else {
      loginMessage.value = "Login failed. Please try again";
    }
    loginSnackbar.value = true;
  }
};

// API Functions
const fetchDeliveries = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await deliveryStore.fetchDeliveries();

    if (response && response.data) {
      deliveries.value = response.data;
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

const fetchAddresses = async () => {
  // Only fetch if authenticated
  if (!token.value || !authenticated.value) {
    return;
  }

  try {
    const addressData = await profileStore.getAddress();
    if (addressData && Array.isArray(addressData)) {
      addresses.value = addressData;
      const defaultAddress = addressData.find((addr) => addr.is_default === 1);
      if (defaultAddress) {
        selectedAddress.value = defaultAddress;
        form.value.useExistingAddress = true;
        form.value.name = defaultAddress.name;
        form.value.address = formattedAddress.value;
        form.value.phoneNumber = userProfile.value?.phone_number || "";
      }
    }
  } catch (err) {
    console.error("Failed to fetch addresses:", err);
    error.value = "Failed to load saved addresses";
  }
};

// Transform cart items for order
const transformCartItemsForOrder = (items: any[]) => {
  return items.map((item) => {
    const variantId = item.variant_id || item.variant?.id;

    return {
      item_variant_id: variantId,
      quantity: item.quantity,
      item_name: item.variant?.item?.name || "Unknown Item",
      item_sku: item.variant?.item?.sku || null,
      size: item.variant?.size?.name || "Unknown Size",
      color: item.variant?.color?.name || "Unknown Color",
      item_image: item.variant?.image || "",
      original_price: parseFloat(item.variant?.price || "0"),
      final_price: parseFloat(item.variant?.final_price || "0"),
      total_price: parseFloat(item.variant?.final_price || "0") * item.quantity,
      discount_amount: Math.max(
        0,
        parseFloat(item.variant?.price || "0") -
          parseFloat(item.variant?.final_price || "0")
      ),
      discount_type: null,
      discount_value: null,
    };
  });
};

// Place order
const placeOrder = async () => {
  const effectivePhone = getEffectivePhoneNumber();

  // Validation
  if (!selectedDelivery.value || !selectedPaymentMethod.value) {
    showSnackbar("Please select delivery method and payment method.", "error");
    return;
  }

  if (!effectivePhone) {
    showSnackbar("Phone number is required.", "error");
    return;
  }

  if (form.value.useExistingAddress) {
    if (!selectedAddress.value) {
      showSnackbar("Please select an address.", "error");
      return;
    }
  } else {
    if (!form.value.name || !form.value.address) {
      showSnackbar("Please fill in all required fields.", "error");
      return;
    }
  }

  try {
    loading.value = true;
    error.value = null;

    const orderData: OrderRequest = {
      items: transformCartItemsForOrder(cartItems.value),
      delivery_id: selectedDelivery.value.id,
      payment_method: selectedPaymentMethod.value,
      phone: effectivePhone,
      note: form.value.note || "",
    };

    if (form.value.useExistingAddress && selectedAddress.value) {
      orderData.address_id = selectedAddress.value.id;
    }

    const response = await useFetchDataApi<{ status: string; data: Order }>(
      "/orders",
      {
        method: "POST",
        body: orderData,
      }
    );

    if (response.data.value?.status === "success" && response.data.value.data) {
      currentOrder.value = response.data.value.data;
      dialog.value = false;
      console.log("📦 Order created:", currentOrder.value);

      if (selectedPaymentMethod.value === "bank_transfer") {
        if (currentOrder.value.qr_string) {
          console.log("🏦 Bank transfer selected, generating QR code...");
          try {
            await generateQRCode(currentOrder.value.qr_string);
            console.log("✅ QR Code generated, opening dialog...");
            paymentDialog.value = true;
            startPaymentCheck();
          } catch (qrError) {
            console.error("❌ Failed to generate QR code:", qrError);
            showSnackbar(
              "Failed to generate QR code. Please try again.",
              "error"
            );
            paymentStatus.value = "failed";
            return;
          }
        } else {
          console.error("❌ No QR string in order response");
          showSnackbar("No QR code provided by the server.", "error");
          paymentStatus.value = "failed";
          return;
        }
      } else {
        clearCart();
        const paymentTypeText =
          selectedPaymentMethod.value === "cash_on_delivery"
            ? "You will pay when your order is delivered."
            : "You will pay at the pickup location.";
        showSnackbar(
          `Order placed successfully! ${paymentTypeText}`,
          "success"
        );
        setTimeout(() => {
          router.push("/cart");
        }, 2000);
      }
    } else {
      throw new Error("Order creation failed");
    }
  } catch (err: any) {
    console.error("Order creation failed:", err);
    error.value = err.message || "Failed to place order. Please try again.";
    showSnackbar("Failed to place order. Please try again.", "error");
  } finally {
    loading.value = false;
  }
};

// Payment checking (only for bank_transfer)
const startPaymentCheck = () => {
  if (
    !currentOrder.value ||
    selectedPaymentMethod.value !== "bank_transfer" ||
    !paymentDialog.value
  ) {
    console.log("Payment check not started: invalid conditions");
    return;
  }
  paymentStatus.value = "checking";
  paymentCheckInterval.value = setInterval(async () => {
    if (!paymentDialog.value) {
      stopPaymentCheck();
      showSnackbar("Payment check stopped due to dialog closure.", "info");
      return;
    }
    try {
      const res = await useFetchDataApi<{ status: string }>(
        `/orders/${currentOrder.value!.order_id}/status`
      );
      if (res.data.value?.status === "completed") {
        paymentStatus.value = "completed";
        stopPaymentCheck();
        showSnackbar("Payment successful! Order confirmed.", "success");
        clearCart();
        setTimeout(() => {
          paymentDialog.value = false;
          router.push("/cart");
        }, 3000);
      } else if (res.data.value?.status === "failed") {
        paymentStatus.value = "failed";
        stopPaymentCheck();
        showSnackbar("Payment failed. Please try again.", "error");
      }
    } catch (err) {
      console.error("Payment check failed:", err);
      showSnackbar(
        "Unable to verify payment status. Please check manually.",
        "warning"
      );
    }
  }, 3000);
};

// Cart item actions
const increaseCartItem = (index: number) => {
  const item = cartItems.value[index];
  const maxStock = item.variant?.quantity ?? Infinity;

  if (item.quantity < maxStock) {
    item.quantity++;
    updateItemTotal(index);
    saveCartToStorage();
  } else {
    showSnackbar(`Only ${maxStock} items available in stock.`, "warning");
  }
};

const decreaseCartItem = (index: number) => {
  if (cartItems.value[index].quantity > 1) {
    cartItems.value[index].quantity--;
    updateItemTotal(index);
    saveCartToStorage();
  }
};

const removeCartItem = (index: number) => {
  cartItems.value.splice(index, 1);
  saveCartToStorage();
};

// Dialog management functions
const submitForm = async () => {
  await placeOrder();
};

const openDeliverySelection = () => {
  deliveryDialog.value = true;
};

const selectDelivery = (delivery: Delivery) => {
  selectedDelivery.value = delivery;
  deliveryDialog.value = false;
};

const openAddressSelection = () => {
  addressDialog.value = true;
};

const selectAddress = (address: Address) => {
  selectedAddress.value = address;
  form.value.useExistingAddress = true;

  // Set form values when address is selected
  form.value.name = address.name;
  form.value.address = formattedAddress.value;
  // Always use profile phone number, not address phone
  form.value.phoneNumber = userProfile.value?.phone_number || "";

  addressDialog.value = false;

  // Show warning if profile phone is missing
  if (!userProfile.value?.phone_number) {
    showSnackbar(
      "Warning: No phone number in profile. Please update your profile.",
      "warning"
    );
  }
};

const useNewAddress = () => {
  form.value.useExistingAddress = false;
  selectedAddress.value = null;
  form.value.name = "";
  form.value.phoneNumber = "";
  form.value.address = "";
  addressDialog.value = false;
};

// QR Code generation
const generateQRCode = async (qrString: string) => {
  if (!qrString) {
    console.error("Error generating QR code: qrString is empty or invalid");
    qrCodeDataUrl.value = "";
    throw new Error("Invalid QR code string");
  }
  try {
    console.log("Generating QR code for:", qrString);
    const url = await QRCode.toDataURL(qrString, {
      width: 256,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    });
    qrCodeDataUrl.value = url;
    console.log("QR code generated successfully");
  } catch (error) {
    console.error("Error generating QR code:", error);
    qrCodeDataUrl.value = "";
    throw error;
  }
};

// Helper function to get cookie value
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  } catch (error) {
    console.error("Error getting cookie:", error);
    return null;
  }
};

// Check authentication status
const checkAuthStatus = () => {
  if (typeof window === "undefined") return;

  try {
    const accessToken = getCookie("accessToken") || token.value;

    if (accessToken && accessToken !== "null" && accessToken !== "undefined") {
      if (!authenticated.value) {
        loginStore.authenticated = true;
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            loginStore.user = JSON.parse(userData);
          } catch (error) {
            loginStore.user = {
              phone_number: "",
              password: "",
            };
          }
        } else {
          loginStore.user = {
            phone_number: "",
            password: "",
          };
        }
      }
    } else {
      if (authenticated.value) {
        loginStore.authenticated = false;
        loginStore.user = {
          phone_number: "",
          password: "",
        };
      }
    }
  } catch (error) {
    loginStore.authenticated = false;
    loginStore.user = {
      phone_number: "",
      password: "",
    };
  }
};

// Payment Dialog Helper Functions
const cancelPayment = () => {
  stopPaymentCheck();
  paymentDialog.value = false;
  paymentStatus.value = "pending";
  qrCodeDataUrl.value = "";
  currentOrder.value = null;
  showSnackbar("Order cancelled.", "info");
};

const retryPayment = () => {
  paymentStatus.value = "pending";
  if (currentOrder.value && currentOrder.value.qr_string) {
    generateQRCode(currentOrder.value.qr_string)
      .then(() => {
        startPaymentCheck();
      })
      .catch(() => {
        showSnackbar(
          "Failed to regenerate QR code. Please try again.",
          "error"
        );
      });
  }
};

const goToOrders = () => {
  paymentDialog.value = false;
  router.push("/cart");
};

const stopPaymentCheck = () => {
  if (paymentCheckInterval.value) {
    clearInterval(paymentCheckInterval.value);
    paymentCheckInterval.value = null;
    console.log("Payment check interval stopped");
  }
};

watch(paymentDialog, (newValue) => {
  console.log("paymentDialog changed:", newValue);
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  merchantName: {
    type: String,
    default: "Dogenote",
  },
  amount: {
    type: Number,
    default: 2.01,
  },
  qrImageSrc: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    default: "pending",
    // validator: value => ['pending', 'checking', 'paid'].includes(value)
  },
});

const emit = defineEmits([
  "update:modelValue",
  "payment-confirmed",
  "qr-saved",
  "dialog-closed",
]);

const handlePaymentConfirmation = () => {
  paymentStatus.value = "completed";
  stopPaymentCheck();
  showSnackbar("Payment confirmed! Order processing...", "success");
  clearCart();

  // Use nextTick instead of setTimeout for better Vue compatibility
  nextTick(() => {
    setTimeout(() => {
      paymentDialog.value = false;
      router.push("/items");
    }, 2000);
  });
};

const downloadQRCode = () => {
  if (!qrCodeDataUrl.value || !process.client) return;

  try {
    const link = document.createElement("a");
    link.href = qrCodeDataUrl.value;
    link.download = `payment-qr-${
      currentOrder.value?.order_number || "order"
    }.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar("QR code saved!", "success");
  } catch (error) {
    console.error("Failed to download QR code:", error);
    showSnackbar("Failed to save QR code", "error");
  }
};
// Lifecycle hooks
onMounted(async () => {
  try {
    isLoading.value = true;
    // Remove checkAuthStatus() from here - let users view cart without auth
    loadCartFromStorage(); // This should work without authentication
    await fetchDeliveries();

    // Only fetch profile data if user is authenticated
    const accessToken = token.value;
    const isAuthenticated = authenticated.value;

    if (accessToken && isAuthenticated) {
      checkAuthStatus();
      await profileStore.fetchUserProfile();
      await fetchAddresses();
    }
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
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
        <p class="mt-2">Loading cart...</p>
      </div>

      <!-- Empty cart state -->
      <div
        v-if="!isLoading && cartLoaded && !hasItems"
        class="text-center flex items-center justify-center"
      >
        <div>
          <div class="text-center flex items-center justify-center">
            <img class="w-40" src="images/no_data.gif" alt="" />
          </div>
          <p class="text-xl text-gray-600">Your cart is empty</p>
          <v-btn color="primary" class="mt-4" :to="'/woman'">
            Continue Shopping
          </v-btn>
        </div>
      </div>

      <!-- Cart content -->
      <v-row v-if="cartLoaded && hasItems">
        <v-col cols="12" sm="7" md="8">
          <!-- Cart Items Header -->
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
            <v-col cols="2" md="1" class="flex items-center justify-between">
            </v-col>
          </v-row>

          <!-- Cart Items -->
          <v-row
            v-for="(item, index) in cartItems"
            :key="item.id || index"
            class="uppercase border-b text-center"
          >
            <v-col cols="3" md="3" class="pa-0">
              <div
                class="py-3 flex-col items-center justify-center sm:flex-row sm:items-center sm:space-x-4"
              >
                <v-card class="w-[100px] mx-auto sm:mx-0">
                  <img
                    :src="item.variant?.image || item.image"
                    :alt="item.variant?.item?.name || item.name"
                  />
                </v-card>
                <p
                  class="pt-2 text-center sm:pt-0 sm:text-left text-[10px] md:text-[15px]"
                >
                  {{ item.variant?.item?.name || item.name }}
                </p>
              </div>
            </v-col>

            <v-col cols="2" class="flex items-center justify-center">
              <p class="text-grey">
                ${{
                  item.variant?.final_price ||
                  item.final_price ||
                  item.variant?.price ||
                  item.price
                }}
              </p>
            </v-col>

            <v-col cols="3" md="3" class="flex items-center justify-center">
              <div
                class="flex items-center justify-between px-2 py-1 md:w-[100%] lg:w-[80%]"
              >
                <v-btn
                  size="small"
                  variant="flat"
                  @click="decreaseCartItem(index)"
                  :disabled="item.quantity <= 1 || loading"
                  icon
                  class="bg-gray-100 hover:bg-gray-200"
                >
                  <v-icon>mdi-minus</v-icon>
                </v-btn>

                <div class="relative">
                  <p class="text-center w-8 min-w-8">{{ item.quantity }}</p>
                </div>

                <v-btn
                  variant="tonal"
                  size="small"
                  @click="increaseCartItem(index)"
                  :disabled="loading"
                  icon
                  class="bg-blue-50 hover:bg-blue-100"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
            </v-col>

            <v-col cols="2" class="flex items-center justify-center">
              <p class="font-bold">
                ${{
                  (
                    (item.variant?.final_price ||
                      item.final_price ||
                      item.variant?.price ||
                      item.price) * item.quantity
                  ).toFixed(2)
                }}
              </p>
            </v-col>

            <v-col cols="2" md="2" class="flex items-center justify-between">
              <div class="flex flex-col items-center justify-between">
                <v-btn
                  variant="text"
                  icon
                  :disabled="loading"
                  @click="removeCartItem(index)"
                  class="text-red-500 hover:text-red-700"
                >
                  <v-icon size="22">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-col>

        <!-- Order Summary -->
        <v-col cols="12" sm="5" md="4">
          <v-card class="!bg-gray-100 pa-5">
            <p class="uppercase border-b pb-3 font-bold">
              {{ $t("content.order_summary") }}
            </p>

            <!-- Delivery Selection -->
            <v-card class="mt-3 mb-4" elevation="1">
              <div
                class="address-preview-header bg-gradient-to-r from-blue-500 to-blue-600 pa-3 rounded-t"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <v-icon size="20" color="white">mdi-truck-delivery</v-icon>
                    <h3 class="font-bold text-white text-sm">
                      Delivery Method
                    </h3>
                  </div>
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="white"
                    @click="openDeliverySelection"
                  >
                    <v-icon size="16" class="mr-1">mdi-pencil</v-icon>
                    Change
                  </v-btn>
                </div>
              </div>
              <div
                v-if="selectedDelivery"
                class="flex items-center space-x-3 pa-3"
              >
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

            <!-- Cart Items Summary -->
            <v-row v-for="item in cartItems" :key="item.id" class="mt-3">
              <v-col cols="8">
                <div class="flex">
                  <v-card width="100" class="me-3 flex-shrink-0">
                    <img
                      class="object-cover h-[120px] w-full"
                      :src="item.variant?.image || item.image"
                      :alt="item.variant?.item?.name || item.name"
                    />
                  </v-card>
                  <div>
                    <p>{{ item.variant?.item?.name || item.name }}</p>
                    <p class="text-grey">
                      {{ $t("content.quantity") }} : {{ item.quantity }}
                    </p>
                    <p class="text-grey">
                      {{ $t("content.size") }} :
                      {{ item.variant?.size?.name || item.size }}
                    </p>
                    <p class="text-grey">
                      {{ $t("content.color") }} :
                      {{ item.variant?.color?.name || item.color }}
                    </p>
                  </div>
                </div>
              </v-col>
              <v-col>
                <p class="text-grey text-center">
                  ${{
                    (
                      (item.variant?.final_price ||
                        item.final_price ||
                        item.variant?.price ||
                        item.price) * item.quantity
                    ).toFixed(2)
                  }}
                </p>
              </v-col>
            </v-row>

            <!-- Price Summary -->
            <div class="border-b my-8"></div>
            <div>
              <v-row class="items-center">
                <v-col>
                  <p class="uppercase font-bold">
                    {{ $t("content.subtotal") }}
                  </p>
                </v-col>
                <p class="pr-3 text-grey">${{ subtotal.toFixed(2) }}</p>
              </v-row>
              <v-row class="items-center">
                <v-col>
                  <p class="uppercase font-bold">
                    {{ $t("content.delivery") }}
                  </p>
                </v-col>
                <p class="pr-3 text-grey">${{ deliveryFee.toFixed(2) }}</p>
              </v-row>
              <v-row class="items-center" v-if="totalSavings > 0">
                <v-col>
                  <p class="uppercase font-bold">
                    {{ $t("content.total_savings") }}
                  </p>
                </v-col>
                <p class="pr-3 text-red-500">
                  - ${{ totalSavings.toFixed(2) }}
                </p>
              </v-row>

              <div class="border-b my-8"></div>
              <v-row class="items-center text-[20px] font-bold">
                <v-col>
                  <p class="uppercase">{{ $t("content.total") }}</p>
                </v-col>
                <p class="pr-3">${{ total.toFixed(2) }}</p>
              </v-row>

              <v-btn
                class="w-full mt-4 text-white"
                color="black"
                variant="elevated"
                size="large"
                @click="proceedToCheckout"
                :disabled="loading || !selectedDelivery || !hasItems"
              >
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  size="20"
                  width="2"
                  class="mr-2"
                ></v-progress-circular>
                {{
                  !token || !authenticated
                    ? "Login to Checkout"
                    : "Proceed to Checkout"
                }}
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Login Dialog -->
      <v-dialog
        v-model="hahaDialog"
        max-width="400px"
        persistent
        scrim="transparent"
      >
        <v-card
          style="
            background-color: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
          "
        >
          <v-card-title class="text-end">
            <v-btn
              icon="line-md:close-small"
              variant="text"
              class="text-red"
              @click="hahaDialog = false"
            />
          </v-card-title>
          <v-card-text>
            <Login />
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Checkout Dialog -->
      <v-dialog v-model="dialog" max-width="600px">
        <v-card class="pa-5">
          <v-card-title class="text-h6 font-bold">
            <v-row class="mb-2 items-center">
              <p>SHIPPING ADDRESS & PAYMENT</p>
              <v-spacer></v-spacer>
              <v-btn
                icon="mdi-close"
                @click="dialog = false"
                class="text-red-500 hover:text-red-700"
                variant="text"
              />
            </v-row>
          </v-card-title>

          <v-card-text class="pa-0">
            <!-- Delivery Summary -->
            <v-card v-if="selectedDelivery" class="mb-4 pa-3 bg-green-50">
              <p class="font-bold mb-2">{{ $t("content.delivery_method") }}:</p>
              <div class="flex items-center space-x-3">
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

            <!-- Payment Method Selection -->
            <v-card class="mb-4 pa-3 bg-blue-50">
              <p class="font-bold mb-3">{{ $t("content.payment_method") }}:</p>
              <v-select
                v-model="selectedPaymentMethod"
                :items="paymentMethods"
                item-title="label"
                item-value="value"
                :label="$t('form.select_payment_method')"
                variant="outlined"
                class="mb-3"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" class="pa-3">
                    <template v-slot:prepend>
                      <v-icon
                        :icon="item.raw.icon"
                        size="20"
                        color="primary"
                        class="mr-3"
                      ></v-icon>
                    </template>
                    <v-list-item-title class="font-semibold">{{
                      item.raw.label
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="text-sm text-gray-600">{{
                      item.raw.description
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
                <template v-slot:selection="{ item }">
                  <div class="flex items-center space-x-3">
                    <v-icon
                      :icon="item.raw.icon"
                      size="20"
                      color="primary"
                    ></v-icon>
                    <div>
                      <p class="font-semibold">{{ item.raw.label }}</p>
                      <p class="text-sm text-gray-600">
                        {{ item.raw.description }}
                      </p>
                    </div>
                  </div>
                </template>
              </v-select>
            </v-card>

            <!-- Address Type Selection -->
            <div class="address-type-card bg-blue-50 pa-3 rounded mb-4">
              <div class="address-type-header mb-3">
                <h3 class="font-bold flex items-center">
                  <v-icon size="20" class="mr-2" color="primary"
                    >mdi-map-marker-check</v-icon
                  >
                  {{ $t("content.address_options") }}
                </h3>
              </div>

              <div class="address-options space-y-3">
                <!-- Saved Address Option -->
                <div
                  :class="[
                    'address-option pa-3 rounded border cursor-pointer transition-all',
                    form.useExistingAddress
                      ? 'border-primary bg-blue-100'
                      : 'border-gray-300 bg-white hover:bg-gray-50',
                  ]"
                  @click="form.useExistingAddress = true"
                >
                  <div class="flex items-center space-x-3">
                    <v-radio-btn
                      :model-value="form.useExistingAddress"
                      :value="true"
                      color="primary"
                    ></v-radio-btn>
                    <div class="flex items-center justify-between w-full">
                      <div>
                        <h4 class="font-semibold">
                          {{ $t("content.use_saved_address") }}
                        </h4>
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
                        :variant="
                          form.useExistingAddress ? 'elevated' : 'outlined'
                        "
                        :color="form.useExistingAddress ? 'primary' : 'gray'"
                        @click.stop="openAddressSelection"
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
                    'address-option pa-3 rounded border cursor-pointer transition-all',
                    !form.useExistingAddress
                      ? 'border-primary bg-blue-100'
                      : 'border-gray-300 bg-white hover:bg-gray-50',
                  ]"
                  @click="form.useExistingAddress = false"
                >
                  <div class="flex items-center space-x-3">
                    <v-radio-btn
                      :model-value="!form.useExistingAddress"
                      :value="true"
                      color="primary"
                    ></v-radio-btn>
                    <div>
                      <h4 class="font-semibold">
                        {{ $t("content.enter_new_address") }}
                      </h4>
                      <p class="text-sm text-gray-500">
                        {{
                          $t(
                            "content.add_a_new_shipping_address_for_this_order"
                          )
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Address Preview -->
              <div
                v-if="form.useExistingAddress && selectedAddress"
                class="selected-address-preview mt-3 pa-3 bg-white rounded border border-primary"
              >
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
                    <p class="text-sm mt-1 flex items-center text-gray-600">
                      <v-icon size="12" class="mr-1">mdi-phone</v-icon>
                      {{ userProfile?.phone_number || "No phone in profile" }}
                    </p>
                  </div>
                  <div
                    class="selected-address-badge"
                    v-if="selectedAddress.is_default"
                  >
                    <v-chip size="small" color="primary" variant="flat">
                      <v-icon size="10" start>mdi-star</v-icon>
                      Default
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>

            <!-- Single Form Section -->
            <v-form v-model="isValid" @submit.prevent="submitForm">
              <!-- Name Field -->
              <v-text-field
                v-model="form.name"
                :label="$t('form.username')"
                :rules="[rules.required]"
                :readonly="form.useExistingAddress"
                :variant="form.useExistingAddress ? 'filled' : 'outlined'"
                required
                class="mb-3"
                prepend-inner-icon="mdi-account"
              />

              <!-- Phone Number Field -->
              <v-text-field
                v-model="form.phoneNumber"
                :label="$t('form.phone_number')"
                :rules="[rules.required, rules.phoneNumber]"
                :readonly="form.useExistingAddress"
                :variant="form.useExistingAddress ? 'filled' : 'outlined'"
                :hint="
                  form.useExistingAddress ? 'Using phone from your profile' : ''
                "
                persistent-hint
                required
                class="mb-3"
                prepend-inner-icon="mdi-phone"
              />

              <!-- Address Field -->
              <v-text-field
                v-model="form.address"
                :label="$t('form.address')"
                :rules="[rules.required, rules.address]"
                :readonly="form.useExistingAddress"
                :variant="form.useExistingAddress ? 'filled' : 'outlined'"
                :hint="
                  form.useExistingAddress ? 'Using selected saved address' : ''
                "
                persistent-hint
                required
                class="mb-3"
                prepend-inner-icon="mdi-map-marker"
              />

              <!-- Note Field -->
              <v-textarea
                v-model="form.note"
                :label="$t('form.order_note')"
                class="mb-3"
                prepend-inner-icon="mdi-note-text"
                rows="3"
              />

              <!-- Submit Button -->
              <v-btn
                type="submit"
                :disabled="
                  !isValid ||
                  loading ||
                  !selectedDelivery ||
                  !selectedPaymentMethod ||
                  (form.useExistingAddress && !selectedAddress) ||
                  !getEffectivePhoneNumber()
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
                Place Order - ${{ total.toFixed(2) }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Address Selection Dialog -->
      <v-dialog v-model="addressDialog" max-width="700px">
        <v-card class="address-dialog-card">
          <!-- Modern Header -->
          <div
            class="address-dialog-header bg-gradient-to-r from-blue-500 to-blue-600 pa-4 rounded-t"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="address-icon-wrapper bg-white/20 rounded-full p-2">
                  <v-icon size="24" color="white">mdi-map-marker</v-icon>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-white">
                    {{ $t("content.select_shipping_address") }}
                  </h2>
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
              />
            </div>
          </div>

          <div class="address-dialog-content pa-4">
            <!-- Option to use new address -->
            <div
              class="new-address-card pa-4 border rounded mb-4 cursor-pointer hover:bg-blue-50 transition-colors"
              @click="useNewAddress"
            >
              <div class="flex items-center space-x-4">
                <div class="new-address-icon">
                  <v-icon size="32" color="primary">mdi-plus-circle</v-icon>
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-lg text-primary">
                    {{ $t("content.add_new_address") }}
                  </h3>
                  <p class="text-gray-600">
                    {{
                      $t("content.enter_a_new_shipping_address_for_this_order")
                    }}
                  </p>
                </div>
                <div class="new-address-arrow">
                  <v-icon color="primary">mdi-chevron-right</v-icon>
                </div>
              </div>
            </div>

            <!-- Existing addresses -->
            <div v-if="addresses.length > 0" class="saved-addresses-section">
              <div
                class="section-header flex items-center justify-between mb-4"
              >
                <h3 class="font-bold text-gray-800 flex items-center">
                  <v-icon size="20" class="mr-2" color="gray"
                    >mdi-bookmark-multiple</v-icon
                  >
                  {{ $t("content.save_addresses") }}
                </h3>
                <span class="text-sm text-gray-500"
                  >{{ addresses.length }} {{ $t("buttons.save") }}</span
                >
              </div>

              <div class="addresses-grid space-y-3">
                <div
                  v-for="address in addresses"
                  :key="address.id"
                  :class="[
                    'address-card pa-4 border rounded cursor-pointer transition-all',
                    selectedAddress?.id === address.id
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-primary hover:bg-gray-50',
                  ]"
                  @click="selectAddress(address)"
                >
                  <!-- Address content -->
                  <div class="address-card-content">
                    <div
                      class="address-header flex items-start justify-between mb-2"
                    >
                      <div class="flex items-center space-x-2">
                        <v-icon
                          size="18"
                          :color="
                            selectedAddress?.id === address.id
                              ? 'primary'
                              : 'gray'
                          "
                        >
                          mdi-account-circle
                        </v-icon>
                        <h4 class="font-bold text-lg">{{ address.name }}</h4>
                      </div>
                      <div class="address-badges flex space-x-2">
                        <v-chip
                          v-if="address.is_default"
                          size="small"
                          color="amber"
                          variant="flat"
                        >
                          <v-icon size="12" start>mdi-star</v-icon>
                          Default
                        </v-chip>
                        <v-chip
                          v-if="selectedAddress?.id === address.id"
                          size="small"
                          color="primary"
                          variant="flat"
                        >
                          <v-icon size="12" start>mdi-check</v-icon>
                          Selected
                        </v-chip>
                      </div>
                    </div>

                    <div class="address-details space-y-2">
                      <div class="address-line flex items-center space-x-2">
                        <v-icon size="14" color="gray">mdi-home</v-icon>
                        <span>{{ address.home }}, {{ address.street }}</span>
                      </div>
                      <div class="address-line flex items-center space-x-2">
                        <v-icon size="14" color="gray">mdi-map-marker</v-icon>
                        <span>{{ address.city }}, {{ address.country }}</span>
                      </div>
                      <div class="address-line flex items-center space-x-2">
                        <v-icon size="14" color="gray">mdi-phone</v-icon>
                        <span>{{
                          userProfile?.phone_number || "No phone in profile"
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No addresses message -->
            <div v-else class="no-addresses text-center py-8">
              <div class="no-addresses-icon mb-4">
                <v-icon size="48" color="gray">mdi-map-marker-off</v-icon>
              </div>
              <h3 class="font-bold text-gray-700 mb-2">No saved addresses</h3>
              <p class="text-gray-500 text-center max-w-sm mx-auto">
                You don't have any saved addresses yet. Add a new address to get
                started.
              </p>
            </div>
          </div>
        </v-card>
      </v-dialog>

      <!-- Delivery Selection Dialog -->
      <v-dialog v-model="deliveryDialog" max-width="400px" persistent>
        <v-card class="pa-4">
          <v-card-title class="text-h6 font-bold mb-4">
            <div class="flex justify-between items-center">
              <span>Select Delivery Method</span>
              <v-btn
                icon="mdi-close"
                variant="text"
                @click="deliveryDialog = false"
              />
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

      <!-- Payment Dialog with QR Code (only for bank_transfer) -->
      <v-dialog v-model="paymentDialog" max-width="400px" persistent>
        <v-card class="text-center pa-0">
          <!-- Header with close button -->
          <v-card-title class="d-flex justify-end pa-2">
            <v-btn
              v-if="paymentStatus === 'pending' || paymentStatus === 'checking'"
              variant="text"
              color="red"
              @click="
                paymentDialog = false;
                stopPaymentCheck();
              "
              icon="mdi-close"
              size="small"
            />
          </v-card-title>

          <!-- Payment Card Content -->
          <div class="px-4 pb-6">
            <!-- KHQR Payment Card -->
            <v-card
              class="mx-auto max-w-xs shadow-lg overflow-hidden rounded-xl"
              elevation="3"
            >
              <!-- Red KHQR Header -->
              <div
                class="bg-gradient-to-br from-red-600 to-red-600 px-4 py-3 relative"
              >
                <div class="flex justify-center">
                  <img class="w-16" src="images/khqr.jpg" alt="khqr" />
                </div>
                <!-- Speech bubble tail -->
                <div class="absolute bottom-0 -right-10 transform">
                  <div class="w-[100px] h-[30px] bg-red-600 rotate-45"></div>
                </div>
              </div>

              <!-- White Content Area -->
              <v-card-text class="p-4">
                <!-- Merchant Info -->
                <div class="text-left mb-4 pb-4 border-b border-gray-200">
                  <div class="text-md font-normal text-gray-800 mb-1">
                    {{ currentOrder?.delivery_method || "Store Name" }}
                  </div>
                  <div class="text-2xl font-bold text-gray-900">
                    {{ total.toFixed(2) }}
                    <span class="text-lg font-normal">$</span>
                  </div>
                </div>

                <!-- QR Code Display -->
                <div class="flex justify-center mb-4">
                  <div
                    class="w-48 h-48 bg-white border border-gray-200 rounded flex items-center justify-center"
                  >
                    <!-- QR Code when available -->
                    <img
                      v-if="qrCodeDataUrl && paymentStatus !== 'failed'"
                      :src="qrCodeDataUrl"
                      alt="Payment QR Code"
                      class="max-w-full max-h-full object-contain"
                    />

                    <!-- Loading QR Code -->
                    <div
                      v-else-if="!qrCodeDataUrl && paymentStatus === 'pending'"
                      class="text-center"
                    >
                      <v-progress-circular
                        indeterminate
                        size="40"
                        width="4"
                        color="primary"
                        class="mb-2"
                      ></v-progress-circular>
                      <p class="text-sm text-gray-600">Generating QR Code...</p>
                    </div>

                    <!-- Error state -->
                    <div v-else class="text-center">
                      <v-icon size="40" color="error" class="mb-2"
                        >mdi-alert-circle</v-icon
                      >
                      <p class="text-sm text-red-600 mb-2">
                        Failed to generate QR Code
                      </p>
                      <v-btn
                        size="small"
                        color="primary"
                        variant="outlined"
                        @click="retryPayment"
                      >
                        {{ $t("buttons.retry") }}
                      </v-btn>
                    </div>
                  </div>
                </div>

                <!-- Scan to Pay -->
                <div class="text-center mb-4">
                  <div class="text-xl font-medium text-gray-800">
                    {{ $t("content.scan_to_pay") }}
                  </div>
                </div>

                <!-- Payment Status Alert -->
                <!-- <div class="mb-4" v-if="paymentStatus !== 'pending'">
                  <v-alert
                    v-if="paymentStatus === 'checking'"
                    type="warning"
                    density="compact"
                    class="mb-2"
                  >
                    <div class="flex items-center">
                      <v-progress-circular
                        indeterminate
                        size="16"
                        width="2"
                        class="mr-2"
                      ></v-progress-circular>
                      Verifying payment...
                    </div>
                  </v-alert>

                  <v-alert
                    v-if="paymentStatus === 'completed'"
                    type="success"
                    density="compact"
                    class="mb-2"
                  >
                    <div class="flex items-center">
                      <v-icon class="mr-2" size="16">mdi-check-circle</v-icon>
                      Payment successful!
                    </div>
                  </v-alert>

                  <v-alert
                    v-if="paymentStatus === 'failed'"
                    type="error"
                    density="compact"
                    class="mb-2"
                  >
                    <div class="flex items-center">
                      <v-icon class="mr-2" size="16">mdi-alert-circle</v-icon>
                      Payment failed. Please try again.
                    </div>
                  </v-alert>
                </div> -->

                <!-- Action Buttons -->
                <div
                  class="flex justify-center gap-3 mb-4"
                  v-if="paymentStatus !== 'completed'"
                >
                  <v-btn
                    color="orange"
                    variant="flat"
                    rounded
                    size="small"
                    @click="handlePaymentConfirmation"
                    class="text-white px-4"
                  >
                    {{ $t("content.i_have_paid") }}.
                  </v-btn>

                  <v-btn
                    color="orange"
                    variant="flat"
                    rounded
                    size="small"
                    @click="downloadQRCode"
                    :disabled="!qrCodeDataUrl"
                    class="text-white px-4"
                  >
                    <span>{{ $t("buttons.save") }}</span>
                    <v-icon class="ml-1" size="small">mdi-download</v-icon>
                  </v-btn>
                </div>

                <!-- Completed State Button -->
                <div
                  class="flex justify-center mb-4"
                  v-if="paymentStatus === 'completed'"
                >
                  <v-btn
                    color="primary"
                    variant="flat"
                    rounded
                    size="small"
                    @click="goToOrders"
                    class="text-white px-6"
                  >
                    {{ $t("content.view_orders") }}
                  </v-btn>
                </div>

                <!-- Payment Summary -->
                <div class="text-left">
                  <div class="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{{ $t("content.subtotal") }}:</span>
                    <span>{{ subtotal.toFixed(2) }} USD</span>
                  </div>
                  <div class="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{{ $t("content.delivery") }}:</span>
                    <span>{{ deliveryFee.toFixed(2) }} USD</span>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <div class="flex justify-between font-bold text-gray-900">
                    <span class="uppercase">{{ $t("content.total") }}:</span>
                    <span>{{ total.toFixed(2) }} USD</span>
                  </div>
                </div>

                <!-- Payment Instructions (collapsed by default) -->
                <v-expansion-panels
                  class="mt-4"
                  variant="accordion"
                  v-if="paymentStatus === 'pending'"
                >
                  <v-expansion-panel>
                    <v-expansion-panel-title class="text-sm font-medium">
                      <v-icon class="mr-2" size="16">mdi-help-circle</v-icon>
                      Payment Instructions
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div class="text-sm space-y-1 text-left">
                        <p class="font-semibold mb-2">How to pay:</p>
                        <ol class="list-decimal list-inside space-y-1">
                          <li>Open your banking app (ABA, Wing, etc.)</li>
                          <li>Select QR code payment/KHQR</li>
                          <li>Scan the QR code above</li>
                          <li>Confirm the payment amount</li>
                          <li>Complete the transaction</li>
                        </ol>
                        <div class="mt-3 p-2 bg-yellow-100 rounded text-xs">
                          <strong>Note:</strong> Payment verification may take
                          up to 30 seconds
                        </div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </div>
        </v-card>
      </v-dialog>

      <!-- Success/Error Snackbar -->
      <v-snackbar
        v-model="snackbar"
        timeout="4000"
        :color="snackbarColor"
        location="top center"
      >
        {{ snackbarMessage }}
        <template v-slot:actions>
          <v-btn
            icon="mdi-close"
            color="white"
            variant="text"
            @click="snackbar = false"
          />
        </template>
      </v-snackbar>

      <!-- Login Snackbar -->
      <v-snackbar
        v-model="loginSnackbar"
        timeout="3000"
        :color="loginMessage.includes('successful') ? 'success' : 'error'"
        location="top center"
      >
        {{ loginMessage }}
        <template v-slot:actions>
          <v-btn
            icon="mdi-close"
            color="white"
            variant="text"
            @click="loginSnackbar = false"
          />
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<style scoped>
.login-input :deep(.v-field__input) {
  color: white !important;
}

.login-input :deep(.v-field__input)::placeholder {
  color: rgba(255, 255, 255, 0.7) !important;
}

.login-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.9) !important;
}

.login-input :deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.login-input:hover :deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.6) !important;
}

.address-type-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.address-option {
  transition: all 0.2s ease;
}

.address-option-active {
  background-color: rgb(239 246 255);
  border-color: rgb(59 130 246);
}

.address-option-inactive {
  background-color: white;
  border-color: rgb(209 213 219);
}

.address-option:hover {
  border-color: rgb(59 130 246);
}

.radio-dot {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.radio-dot.active {
  border-color: rgb(59 130 246);
  background-color: rgb(59 130 246);
}

.radio-dot.active::after {
  content: "";
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
}

.address-card {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.address-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.address-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.address-line-icon {
  margin-top: 2px;
  flex-shrink: 0;
}
</style>
