<script setup lang="ts">
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");
const currentProduct = ref<any>(null);
const currentVariant = ref<any>(null);
const text = ref(""); // message for snackbar
const quantity = ref<number>(1);
const router = useRouter(); // Make sure this is properly imported

// Local state for loading and interactions
const isLoading = ref(false);
const removingItems = ref(new Set<string>());
const wishlist = ref<any[]>([]);

// Computed properties
const hasWishlist = computed(() => wishlist.value && wishlist.value.length > 0);
const totalItems = computed(() => wishlist.value?.length || 0);

// Wishlist management functions
const loadWishlistFromStorage = () => {
  try {
    const stored = localStorage.getItem("wishlist");
    if (stored) {
      wishlist.value = JSON.parse(stored);
    } else {
      wishlist.value = [];
    }
  } catch (error) {
    console.error("Error loading wishlist from localStorage:", error);
    wishlist.value = [];
  }
};

const saveWishlistToStorage = () => {
  try {
    localStorage.setItem("wishlist", JSON.stringify(wishlist.value));
  } catch (error) {
    console.error("Error saving wishlist to localStorage:", error);
  }
};

const removeFromWishlist = (variantId: string) => {
  wishlist.value = wishlist.value.filter(
    (item) => item.item_variant?.id !== variantId && item.id !== variantId
  );
  saveWishlistToStorage();
};

// Simple navigation function - only sends ID to product detail page
const navigateToProductDetail = (wishlistItem: any) => {
  try {
    // Get the actual item ID from the nested structure
    const itemId = wishlistItem.item?.id || wishlistItem.item_id;

    if (!itemId) {
      console.error("No item ID found in wishlist item:", wishlistItem);
      text.value = "Unable to navigate: Missing product ID.";
      snackbar.value = true;
      return;
    }

    // Navigate to product detail page with only the item ID
    // The detail page will fetch data from localStorage using this ID
    router.push({
      path: "/product-detail",
      query: { id: itemId },
    });
  } catch (error) {
    console.error("Error during navigation:", error);
    text.value = "Failed to navigate to product detail.";
    snackbar.value = true;
  }
};

// Core add to cart logic
const handleAddToCart = async () => {
  if (!currentProduct.value || !currentVariant.value) {
    text.value = "No item available to add to cart.";
    snackbar.value = true;
    return;
  }

  if (currentVariant.value.quantity === 0) {
    text.value = "Item is out of stock.";
    snackbar.value = true;
    return;
  }

  if (quantity.value > currentVariant.value.quantity) {
    text.value = "Requested quantity exceeds available stock.";
    snackbar.value = true;
    return;
  }

  try {
    // Create cart item with full data (similar to wishlist structure)
    const cartItem = {
      id: currentVariant.value.id, // variant ID as main ID
      variant_id: currentVariant.value.id,
      item_id: currentProduct.value.id,
      quantity: quantity.value,
      added_at: new Date().toISOString(),

      // Full variant data
      variant: {
        id: currentVariant.value.id,
        item_id: currentProduct.value.id,
        color_id: currentVariant.value.color_id,
        size_id: currentVariant.value.size_id,
        image: currentVariant.value.image,
        price: currentVariant.value.price,
        final_price:
          currentVariant.value.final_price || currentVariant.value.price,
        quantity: currentVariant.value.quantity,
        is_favorite: currentVariant.value.is_favorite,
        created_at: currentVariant.value.created_at,
        updated_at: currentVariant.value.updated_at,

        // Include color, size, and item data if available
        color: currentVariant.value.color,
        size: currentVariant.value.size,
        item: {
          id: currentProduct.value.id,
          name: currentProduct.value.name,
          description: currentProduct.value.description,
          total_sold: currentProduct.value.total_sold,
          last_sale_at: currentProduct.value.last_sale_at,
          is_featured_new_arrival: currentProduct.value.is_featured_new_arrival,
          is_featured_trending: currentProduct.value.is_featured_trending,
          category_id: currentProduct.value.category_id,
          season_id: currentProduct.value.season_id,
          brand_id: currentProduct.value.brand_id,
          discount_id: currentProduct.value.discount_id,
          created_at: currentProduct.value.created_at,
          updated_at: currentProduct.value.updated_at,

          // Include related data if available
          brand: currentProduct.value.brand,
          category: currentProduct.value.category,
          season: currentProduct.value.season,
          discount: currentProduct.value.discount,
        },
      },
    };

    // Get current cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if the item already exists in the cart
    const index = existingCart.findIndex(
      (item: any) => item.variant_id === cartItem.variant_id
    );

    if (index !== -1) {
      // Update quantity if item exists
      existingCart[index].quantity += cartItem.quantity;
      existingCart[index].added_at = cartItem.added_at; // Update timestamp
    } else {
      // Add new item with full data
      existingCart.push(cartItem);
    }

    // Save back to localStorage
    localStorage.setItem("cart", JSON.stringify(existingCart));

    text.value = "Item successfully added to cart!";
    quantity.value = 1;
  } catch (error) {
    text.value = "Something went wrong while adding to cart.";
    console.error(error);
  } finally {
    snackbar.value = true;
  }
};

// Add to cart function
const addToCart = (variantId: string) => {
  const wishlistItem = wishlist.value.find(
    (w) => w.item_variant?.id === variantId || w.id === variantId
  );

  if (!wishlistItem) {
    console.warn("Wishlist item not found for variant", variantId);
    return;
  }

  // Handle different data structures
  if (wishlistItem.item_variant) {
    currentProduct.value = wishlistItem;
    currentVariant.value = wishlistItem.item_variant;
  } else {
    // If the wishlist item itself is the variant
    currentProduct.value = wishlistItem;
    currentVariant.value = wishlistItem;
  }

  quantity.value = 1;
  handleAddToCart();
};

// Remove from wishlist
const handleRemoveFromWishlist = async (itemId: string) => {
  try {
    removingItems.value.add(itemId);

    // Remove from local wishlist array and localStorage
    removeFromWishlist(itemId);

    snackbarMessage.value = "Item removed from wishlist";
    snackbarColor.value = "success";
    snackbar.value = true;
  } catch (error) {
    console.error("Failed to remove item from wishlist:", error);
    snackbarMessage.value = "Failed to remove item from wishlist";
    snackbarColor.value = "error";
    snackbar.value = true;
  } finally {
    removingItems.value.delete(itemId);
  }
};

const formatPrice = (price: string | number) => {
  return `$${parseFloat(price.toString()).toFixed(2)}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Recently added";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Initialize wishlist on component mount
onMounted(() => {
  isLoading.value = true;
  loadWishlistFromStorage();
  isLoading.value = false;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p class="mt-1 text-sm text-gray-500" v-if="hasWishlist">
                {{ totalItems }} {{ totalItems === 1 ? "item" : "items" }}
                {{ $t("buttons.save") }}
              </p>
            </div>
            <div class="flex items-center space-x-3">
              <div class="bg-purple-50 px-3 py-1 rounded-full">
                <span class="text-purple-700 text-sm font-medium">
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
                  Wishlist
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
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"
        ></div>
        <span class="ml-3 text-gray-600">Loading your wishlist...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasWishlist" class="text-center py-12">
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
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No wishlist items yet
        </h3>
        <p class="text-gray-500 mb-6">
          Start browsing and add items to your wishlist to see them here.
        </p>
        <nuxt-link to="/man">
          <v-btn
            color="primary"
            class="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {{ $t("content.start_shopping") }}
          </v-btn>
        </nuxt-link>
      </div>

      <!-- Wishlist Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="wishlistItem in wishlist"
          :key="wishlistItem.id || wishlistItem.item_variant?.id"
          class="bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
        >
          <!-- Product Image -->
          <div
            @click="navigateToProductDetail(wishlistItem)"
            class="aspect-square relative overflow-hidden bg-gray-100 cursor-pointer"
          >
            <img
              :src="wishlistItem.item_variant?.image || wishlistItem.image"
              :alt="'Product image'"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />

            <!-- Remove Button Overlay -->
            <div
              class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <button
                @click.stop="
                  handleRemoveFromWishlist(
                    wishlistItem.id || wishlistItem.item_variant?.id
                  )
                "
                :disabled="
                  removingItems.has(
                    wishlistItem.id || wishlistItem.item_variant?.id
                  )
                "
                class="bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                title="Remove from wishlist"
              >
                <svg
                  v-if="
                    !removingItems.has(
                      wishlistItem.id || wishlistItem.item_variant?.id
                    )
                  "
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
                {{
                  wishlistItem.item_variant?.quantity ||
                  wishlistItem.quantity ||
                  0
                }}
                in stock
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <!-- Product Name -->
            <h3 class="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
              {{
                wishlistItem.item?.name ||
                wishlistItem.name ||
                wishlistItem.item_variant?.name ||
                "Product Name"
              }}
            </h3>

            <!-- Price Section -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <span class="text-2xl font-bold text-gray-900">
                  {{
                    formatPrice(
                      wishlistItem.item_variant?.final_price ||
                        wishlistItem.final_price ||
                        wishlistItem.price ||
                        0
                    )
                  }}
                </span>
                <span
                  v-if="
                    (wishlistItem.item_variant?.price || wishlistItem.price) !==
                    (wishlistItem.item_variant?.final_price ||
                      wishlistItem.final_price)
                  "
                  class="text-sm text-gray-500 line-through"
                >
                  {{
                    formatPrice(
                      wishlistItem.item_variant?.price ||
                        wishlistItem.price ||
                        0
                    )
                  }}
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
              Added
              {{ formatDate(wishlistItem.added_at || wishlistItem.dateAdded) }}
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-2">
              <v-btn
                color="primary"
                @click="
                  addToCart(wishlistItem.item_variant?.id || wishlistItem.id)
                "
                class="flex-1 bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Add to Cart
              </v-btn>

              <button
                @click="
                  handleRemoveFromWishlist(
                    wishlistItem.id || wishlistItem.item_variant?.id
                  )
                "
                :disabled="
                  removingItems.has(
                    wishlistItem.id || wishlistItem.item_variant?.id
                  )
                "
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                title="Remove from wishlist"
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top right"
    >
      {{ snackbarMessage || text }}
    </v-snackbar>
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

/* Line clamp utility for product names */
.line-clamp-2 {
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
  overflow: hidden;
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
