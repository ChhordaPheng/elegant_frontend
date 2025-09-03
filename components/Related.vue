<script setup lang="ts">
// Add props to receive the product ID from parent
interface Props {
  productId?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  productId: ''
});

// Add missing router import
import { useRouter } from "vue-router";

const relatedStore = useRelatedStore();
const { relateds, isLoading } = storeToRefs(relatedStore);
const quantity = ref<number>(1);
const snackbar = ref(false);
const text = ref(""); // message for snackbar
const router = useRouter();

// Add the missing favoriteVariants reactive set
const favoriteVariants = ref(new Set<string>());

const handleAddToWishlist = (variant: any) => {
  if (!variant || !variant.id) {
    text.value = "No item available to add to wishlist.";
    snackbar.value = true;
    return;
  }

  try {
    const existingWishlist: any[] = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    const existingIndex = existingWishlist.findIndex(
      (item) => item.id === variant.id
    );

    if (existingIndex !== -1) {
      existingWishlist.splice(existingIndex, 1);
      localStorage.setItem("wishlist", JSON.stringify(existingWishlist));
      favoriteVariants.value.delete(variant.id);
      text.value = "Removed from wishlist!";
    } else {
      existingWishlist.push(variant);
      localStorage.setItem("wishlist", JSON.stringify(existingWishlist));
      favoriteVariants.value.add(variant.id);
      text.value = "Added to wishlist!";
    }
  } catch (error) {
    text.value = "Something went wrong while updating wishlist.";
    console.error("Wishlist error:", error);
  } finally {
    snackbar.value = true;
  }
};

// Helper function to initialize favoriteVariants from localStorage
const initializeFavoriteVariants = () => {
  try {
    const existingWishlist: any[] = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    favoriteVariants.value.clear();
    existingWishlist.forEach((item) => {
      if (item.id) {
        favoriteVariants.value.add(item.id);
      }
    });
  } catch (error) {
    console.error("Error initializing favorite variants:", error);
    favoriteVariants.value.clear();
  }
};

// Core add to cart logic
const handleAddToCart = async (variant: any, product: any) => {
  if (!product || !variant) {
    text.value = "No item available to add to cart.";
    snackbar.value = true;
    return;
  }

  if (variant.quantity === 0) {
    text.value = "Item is out of stock.";
    snackbar.value = true;
    return;
  }

  if (quantity.value > variant.quantity) {
    text.value = "Requested quantity exceeds available stock.";
    snackbar.value = true;
    return;
  }

  try {
    const cartItem = {
      id: variant.id,
      variant_id: variant.id,
      item_id: product.id,
      quantity: quantity.value,
      added_at: new Date().toISOString(),

      variant: {
        id: variant.id,
        item_id: product.id,
        color_id: variant.color_id,
        size_id: variant.size_id,
        image: variant.image,
        price: variant.price,
        final_price: variant.final_price || variant.price,
        quantity: variant.quantity,
        is_favorite: variant.is_favorite,
        created_at: variant.created_at,
        updated_at: variant.updated_at,

        color: variant.color,
        size: variant.size,
        item: {
          id: product.id,
          name: product.name,
          description: product.description,
          total_sold: product.total_sold,
          last_sale_at: product.last_sale_at,
          is_featured_new_arrival: product.is_featured_new_arrival,
          is_featured_trending: product.is_featured_trending,
          category_id: product.category_id,
          season_id: product.season_id,
          brand_id: product.brand_id,
          discount_id: product.discount_id,
          created_at: product.created_at,
          updated_at: product.updated_at,

          brand: product.brand,
          category: product.category,
          season: product.season,
          discount: product.discount,
        },
      },
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const index = existingCart.findIndex(
      (item: any) => item.variant_id === cartItem.variant_id
    );

    if (index !== -1) {
      existingCart[index].quantity += cartItem.quantity;
      existingCart[index].added_at = cartItem.added_at;
    } else {
      existingCart.push(cartItem);
    }

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

const addToCart = (variantId: string) => {
  const product = relateds.value.find((item) =>
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

  handleAddToCart(variant, product);
};

// Watch for productId changes and fetch related items
watch(() => props.productId, async (newProductId) => {
  if (newProductId) {
    try {
      await relatedStore.fetchRelateds(newProductId.toString());
    } catch (error) {
      console.error("Error fetching related items:", error);
      text.value = "Failed to load related items.";
      snackbar.value = true;
    }
  }
}, { immediate: true });

onMounted(async () => {
  try {
    // Initialize favorites from localStorage
    initializeFavoriteVariants();
    
    // Fetch related items if productId is provided
    if (props.productId) {
      await relatedStore.fetchRelateds(props.productId.toString());
    }
  } catch (error) {
    console.error("Error during component initialization:", error);
    text.value = "Failed to initialize component.";
    snackbar.value = true;
  }
});
</script>

<template>
  <v-slide-group center-active>
    <v-slide-group-item
      v-for="item in relateds.slice(0, 4)"
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
                  <v-tooltip text="Add to Wishlist ">
                    <template #activator="{ props }">
                      <v-btn
                        v-if="item.variants && item.variants[0]"
                        v-bind="props"
                        @click.stop="handleAddToWishlist(item.variants[0])"
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

  <!-- Loading indicator -->
  <div v-if="isLoading" class="flex justify-center my-4">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <!-- No items message -->
  <div v-else-if="relateds.length === 0" class="text-center my-4">
    <p class="text-gray-500">No related items found</p>
  </div>

  <div class="flex justify-end">
    <v-btn variant="outlined" color="primary" to="/new-arrival">see more</v-btn>
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