<script setup lang="ts">
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");
const currentProduct = ref<any>(null);
const currentVariant = ref<any>(null);
const text = ref(""); // message for snackbar
const quantity = ref<number>(1);

// Store integration
const favoriteStore = useFavoriteStore();
const { favorites } = storeToRefs(favoriteStore);
const cartStore = useCartStore();

// Local state for loading and interactions
const isLoading = ref(false);
const removingItems = ref(new Set<string>());

// Computed properties
const hasFavorites = computed(() => favorites.value && favorites.value.length > 0);
const totalItems = computed(() => favorites.value?.length || 0);

// Core add to cart logic
const handleAddToCart = async () => {
  // Check if product/variant is available
  if (!currentProduct.value || !currentVariant.value) {
    snackbarMessage.value = "No item available to add to cart.";
    snackbarColor.value = "error";
    snackbar.value = true;
    return;
  }

  // Check stock
  if (currentVariant.value.quantity === 0) {
    snackbarMessage.value = "Item is out of stock.";
    snackbarColor.value = "error";
    snackbar.value = true;
    return;
  }

  if (quantity.value > currentVariant.value.quantity) {
    snackbarMessage.value = "Requested quantity exceeds available stock.";
    snackbarColor.value = "error";
    snackbar.value = true;
    return;
  }

  try {
    const cartPayload = {
      item_variant_id: currentVariant.value.id,
      quantity: quantity.value,
    };
    await cartStore.addToCart(cartPayload);

    if (cartStore.error) {
      snackbarMessage.value = cartStore.error || "Failed to add to cart.";
      snackbarColor.value = "error";
    } else {
      snackbarMessage.value = "Item successfully added to cart!";
      snackbarColor.value = "success";
      quantity.value = 1;
    }
  } catch (error) {
    snackbarMessage.value = "Something went wrong while adding to cart.";
    snackbarColor.value = "error";
  } finally {
    snackbar.value = true;
  }
};

// Optional: Add to cart function
const addToCart = (variantId: string) => {
  const favorite = favorites.value.find((f) => f.item_variant.id === variantId);

  if (!favorite) {
    console.warn("Favorite not found for variant", variantId);
    return;
  }

  currentProduct.value = favorite; // or favorite.item if needed
  currentVariant.value = favorite.item_variant;
  quantity.value = 1;

  handleAddToCart();
};

// Methods
const handleRemoveFromFavorites = async (variantId: string) => {
  try {
    removingItems.value.add(variantId);

    await favoriteStore.deleteFav(variantId);

    snackbarMessage.value = "Item removed from favorites";
    snackbarColor.value = "success";
    snackbar.value = true;
  } catch (error) {
    console.error("Failed to remove item from favorites:", error);
    snackbarMessage.value = "Failed to remove item from favorites";
    snackbarColor.value = "error";
    snackbar.value = true;
  } finally {
    removingItems.value.delete(variantId);
  }
};

const formatPrice = (price: string | number) => {
  return `$${parseFloat(price.toString()).toFixed(2)}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(async () => {
  await favoriteStore.fetchFavorites();
});
</script>
=
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p class="mt-1 text-sm text-gray-500" v-if="hasFavorites">
                {{ totalItems }} {{ totalItems === 1 ? "item" : "items" }} saved
              </p>
            </div>
            <div class="flex items-center space-x-3">
              <div class="bg-blue-50 px-3 py-1 rounded-full">
                <span class="text-blue-700 text-sm font-medium">
                  <svg
                    class="w-4 h-4 inline mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Favorites
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading your favorites...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasFavorites" class="text-center py-12">
        <div class="mx-auto h-24 w-24 text-gray-300 mb-4">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-full h-full"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
        <p class="text-gray-500 mb-6">
          Start browsing and add items to your favorites to see them here.
        </p>
        <nuxt-link to="/man">
          <v-btn
            color="primary"
            class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Start Shopping
          </v-btn>
        </nuxt-link>
      </div>

      <!-- Favorites Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="favorite in favorites"
          :key="favorite.id"
          class="bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
        >
          <!-- Product Image -->
          <div class="aspect-square relative overflow-hidden bg-gray-100">
            <img
              :src="favorite.item_variant.image"
              :alt="'Product image'"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />

            <!-- Remove Button Overlay -->
            <div
              class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <button
                @click="handleRemoveFromFavorites(favorite.id)"
                :disabled="removingItems.has(favorite.id)"
                class="bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                title="Remove from favorites"
              >
                <svg
                  v-if="!removingItems.has(favorite.id)"
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                    class="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    class="opacity-75"
                  />
                </svg>
              </button>
            </div>

            <!-- Stock Badge -->
            <div class="absolute top-3 left-3">
              <div
                class="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium"
              >
                {{ favorite.item_variant.quantity }} in stock
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <!-- Price Section -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <span class="text-2xl font-bold text-gray-900">
                  {{ formatPrice(favorite.item_variant.final_price) }}
                </span>
                <span
                  v-if="favorite.item_variant.price !== favorite.item_variant.final_price"
                  class="text-sm text-gray-500 line-through"
                >
                  {{ formatPrice(favorite.item_variant.price) }}
                </span>
              </div>
            </div>

            <!-- Added Date -->
            <div class="flex items-center text-sm text-gray-500 mb-4">
              <svg
                class="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Added {{ formatDate(favorite.added_at) }}
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-2">
              <v-btn
                color="primary"
                @click="addToCart(favorite.item_variant.id)"
                class="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Add to Cart
              </v-btn>

              <button
                @click="handleRemoveFromFavorites(favorite.item_variant.id)"
                :disabled="removingItems.has(favorite.item_variant.id)"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                title="Remove from favorites"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <v-snackbar
                v-model="snackbar"
                :color="snackbarColor"
                timeout="3000"
                location="top right"
              >
                {{ snackbarMessage }}
              </v-snackbar>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations and hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Smooth transitions for all interactive elements */
button {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar if needed */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
