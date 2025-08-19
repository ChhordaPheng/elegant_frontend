<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { storeToRefs } from 'pinia';

// Import your stores - make sure these imports are correct for your project structure

// Initialize stores
const topTrendingStore = useTopTrendingStore();
const cartStore = useCartStore();
const favoriteStore = useFavoriteStore();
const itemStore = useItemStore();
const router = useRouter();

// Get reactive references from store
const { topTrendings, isLoading, error } = storeToRefs(topTrendingStore);
const { items } = storeToRefs(itemStore);

// Component reactive data
const favoriteVariants = ref<Set<string>>(new Set());
const currentProduct = ref<any>(null);
const currentVariant = ref<any>(null);
const quantity = ref<number>(1);
const snackbar = ref(false);
const text = ref("");

const addToFavorites = (variantId: string) => {
  if (favoriteVariants.value.has(variantId)) {
    favoriteVariants.value.delete(variantId);
    text.value = "Removed from favorites!";
  } else {
    favoriteVariants.value.add(variantId);
    text.value = "Added to favorites!";
  }
  snackbar.value = true;
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
    const cartPayload = {
      item_variant_id: currentVariant.value.id,
      quantity: quantity.value,
    };
    await cartStore.addToCart(cartPayload);

    if (cartStore.error) {
      text.value = cartStore.error || "Failed to add to cart.";
    } else {
      text.value = "Item successfully added to cart!";
      quantity.value = 1;
    }
  } catch (error) {
    text.value = "Something went wrong while adding to cart.";
    console.error('Add to cart error:', error);
  } finally {
    snackbar.value = true;
  }
};

// Enhanced quick view function with better error handling and logging
const quickView = (productId: string | number) => {
  try {
    const idString = productId.toString();
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

// Enhanced add to cart function with better error handling
const addToCart = (variantId: string) => {
  const product = topTrendings.value.find((item) =>
    item.variants?.some((v) => v.id === variantId)
  );

  if (!product) {
    console.warn("No product found for variant", variantId);
    text.value = "Product not found.";
    snackbar.value = true;
    return;
  }

  const variant = product.variants.find((v) => v.id === variantId);

  if (!variant) {
    console.warn("Variant not found", variantId);
    text.value = "Product variant not found.";
    snackbar.value = true;
    return;
  }

  currentProduct.value = product;
  currentVariant.value = variant;
  quantity.value = 1;

  handleAddToCart();
};

// Enhanced mount function with error handling
onMounted(async () => {
  try {
    await topTrendingStore.fetchTopTrendings();
  } catch (error) {
    console.error("Error fetching top trending items:", error);
    text.value = "Failed to load top trending items.";
    snackbar.value = true;
  }
});
</script>

<template>
  <v-slide-group center-active>
    <v-slide-group-item
      v-for="item in topTrendings.slice(0, 7)"
      :key="item.id"
      v-slot="{ toggle }"
    >
      <v-card class="relative w-[230px] md:w-[360px] mr-5" variant="text">
        <v-hover v-slot="{ isHovering, props }">
          <div v-bind="props" class="relative w-full cursor-pointer">
            <!-- Product Image -->
            <v-img
              :src="item.variants?.[0]?.image || '/images/placeholder.jpg'"
              cover
              position="top"
              class="h-[250px] md:h-[420px]"
              @click="quickView(item.id)"
              :alt="`${item.name} - Product Image`"
            />

            <!-- Animated Buttons on Hover -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6">
              <!-- Favorite (slide from left) -->
              <transition name="slide-left">
                <div v-if="isHovering && item.variants?.[0]">
                  <v-tooltip text="Add to Favorites">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        @click.stop="addToFavorites(item.variants[0].id)"
                        icon
                        :class="
                          favoriteVariants.has(item.variants[0].id)
                            ? 'text-red'
                            : 'bg-white text-black'
                        "
                      >
                        <v-icon
                          :icon="
                            favoriteVariants.has(item.variants[0].id)
                              ? 'mdi-heart'
                              : 'mdi-heart-outline'
                          "
                        />
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </transition>

              <!-- Quick View (slide from bottom) -->
              <transition name="slide-up">
                <div v-if="isHovering">
                  <v-tooltip text="Quick View">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        @click.stop="quickView(item.id)"
                        icon
                        class="bg-white text-black"
                      >
                        <v-icon icon="carbon:image-copy" />
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </transition>

              <!-- Add to Cart (slide from right) -->
              <transition name="slide-right">
                <div v-if="isHovering && item.variants?.[0]">
                  <v-tooltip text="Add to Cart">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        @click.stop="addToCart(item.variants[0].id)"
                        icon
                        class="bg-white text-black"
                        :disabled="
                          !item.variants[0] || item.variants[0].quantity === 0
                        "
                      >
                        <v-icon icon="pepicons-pencil:cart" />
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </transition>
            </div>

            <!-- Out of Stock Overlay -->
            <div
              v-if="item.variants?.[0]?.quantity === 0"
              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <p class="text-white font-bold text-lg">OUT OF STOCK</p>
            </div>
          </div>
        </v-hover>

        <!-- Product Info -->
        <div class="text-center my-5">
          <p
            class="font-bold text-[20px] cursor-pointer hover:text-blue-500 transition-colors"
            @click="quickView(item.id)"
          >
            {{ item.name }}
          </p>
          <p class="text-blue-700 font-bold uppercase my-1">
            {{ item.brand?.name || "Unknown Brand" }}
          </p>
          <div class="d-flex justify-center">
            <Icon icon="noto:star" width="20" height="20" />
            <div v-for="i in 4" :key="i">
              <Icon
                icon="uim:star"
                class="!text-gray-400"
                width="20"
                height="20"
              />
            </div>
          </div>
          <div class="flex justify-center items-center mt-2">
            <p class="text-red mr-2">
              ${{
                item.variants?.[0]?.final_price ||
                item.variants?.[0]?.price ||
                "0.00"
              }}
              USD
            </p>
            <p
              v-if="
                item.variants?.[0]?.final_price &&
                item.variants[0].final_price < item.variants[0].price
              "
              class="line-through text-gray-500"
            >
              ${{ item.variants[0].price }} USD
            </p>
          </div>
        </div>
      </v-card>
    </v-slide-group-item>
  </v-slide-group>

  <!-- Loading state -->
  <div v-if="isLoading" class="text-center py-4">
    <v-progress-circular indeterminate color="primary" />
    <p>Loading top trending items...</p>
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="text-center py-4 text-red-500">
    <p>{{ error }}</p>
    <v-btn @click="topTrendingStore.fetchTopTrendings()" color="primary" class="mt-2">
      Retry
    </v-btn>
  </div>

  <!-- Empty state -->
  <div v-else-if="!topTrendings.length" class="text-center py-4">
    <p>No trending items available at the moment.</p>
  </div>

  <div class="flex justify-end" v-if="topTrendings.length > 0">
    <v-btn variant="outlined" color="primary" to="/top-trending">see more</v-btn>
  </div>

  <!-- Global snackbar -->
  <v-snackbar
    v-model="snackbar"
    :timeout="3000"
    location="top right"
    color="success"
    class="text-white"
  >
    {{ text }}

    <template v-slot:actions>
      <v-btn variant="text" class="text-white" @click="snackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
/* Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>