<script setup lang="ts">
import type { Item } from "~/types/item/item";
import { useItemStore } from "../../stores/item/itemStore";

// UI States
const quantity = ref<number>(1);
const isLiked = ref<boolean>(true);
const tab = ref<string>("review");
const rating = ref<number>(1);
const selectedSizeId = ref<string | number | null>(null);
const selectedVariantIndex = ref<number>(0);
const selectedColorId = ref<string | null>(null);
const currentProduct = ref<Item | null>(null);
const isLoadingProduct = ref(false);
const productError = ref<string | null>(null);
const selectedVariantId = ref<string | null>(null);
const comment = ref<string>("");
const submittingReview = ref(false);
const reviewError = ref<string | null>(null);
const errors = ref<string | null>(null);
const isSubmitting = ref(false);
const favoriteVariants = ref<Set<string>>(new Set());
const text = ref(""); // message for snackbar
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

// Router and Stores - Fixed naming consistency
const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const reviewStore = useReviewStore();
const { reviews } = storeToRefs(reviewStore);
const newArrivalStore = useNewArrivalStore();
const { newArrival } = storeToRefs(newArrivalStore);
const favoriteStore = useFavoriteStore();

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

    // Check if variant already exists in wishlist
    const existingIndex = existingWishlist.findIndex(
      (item) => item.id === variant.id
    );

    if (existingIndex !== -1) {
      // Remove from wishlist
      existingWishlist.splice(existingIndex, 1);
      localStorage.setItem("wishlist", JSON.stringify(existingWishlist));
      favoriteVariants.value.delete(variant.id);
      text.value = "Removed from wishlist!";
    } else {
      // Add full variant data to wishlist
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

// Fixed: Use consistent naming for item store
const itemStoreYou = useItemStore();
// const { items } = storeToRefs(itemStoreYou);

const colors = ["green", "purple", "orange", "indigo", "red"];
const icons = ref([
  "mdi-facebook",
  "mdi-twitter",
  "mdi-linkedin",
  "mdi-instagram",
]);
const notes = ref([
  "MACHINE WASH AT MAX.TEMP. 30° C - NORMAL PROCESS",
  "DO NOT BLEACH",
  "DO NOT TUMBLE DRY",
  "IRON AT MAX. TEMP. OF 110° C WITHOUT STEAM",
  "DO NOT DRY CLEAN",
]);

// Helper to get param string from route param or query
const getRouteParam = (param: string | string[] | undefined): string => {
  if (!param) return "";
  return Array.isArray(param) ? param[0]?.toString() ?? "" : param.toString();
};
// Show snackbar function
const showSnackbar = (message: string, color: string = "success") => {
  snackbarMessage.value = message; // ← Use snackbarMessage, not text
  snackbarColor.value = color;
  snackbar.value = true;
};

const increase = () => {
  if (!currentVariant.value) {
    showSnackbar("No variant selected. Please select a variant.", "error");
    return;
  }

  const maxStock = currentVariant.value.quantity ?? 0;

  if (maxStock === 0) {
    showSnackbar("This item is out of stock.", "error");
    return;
  }

  if (quantity.value < maxStock) {
    quantity.value++;
  } else {
    showSnackbar(`Only ${maxStock} items available in stock.`, "warning");
  }
};

function decrease() {
  if (quantity.value > 1) quantity.value--;
}

const productId = computed(() => {
  let id = getRouteParam(route.params.id as string | string[]);

  if (!id) {
    id = getRouteParam(route.query.id as string | string[]);
  }

  return id || undefined;
});

// Fixed: Try to find product from items store by ID with null safety
const getProductFromItemsStore = (): Item | null => {
  // Add null safety checks
  if (
    !itemStoreYou.items ||
    !Array.isArray(itemStoreYou.items) ||
    !productId.value
  ) {
    console.log("Items or productId not available:", {
      hasItems: !!itemStoreYou.items,
      isArray: Array.isArray(itemStoreYou.items),
      itemsLength: itemStoreYou.items?.length || 0,
      productId: productId.value,
    });
    return null;
  }

  const found = itemStoreYou.items.find((item) => item.id === productId.value);
  return found || null;
};

// Get unique sizes from variants
const uniqueSizes = computed(() => {
  if (!currentProduct.value?.variants) return [];

  const sizes = currentProduct.value.variants.map((v) => v.size);
  const uniqueMap = new Map<string, (typeof sizes)[0]>();

  sizes.forEach((size) => {
    if (size && !uniqueMap.has(size.id)) {
      uniqueMap.set(size.id, size);
    }
  });

  return Array.from(uniqueMap.values());
});

// Get unique colors from variants
const uniqueColors = computed(() => {
  if (!currentProduct.value?.variants) return [];

  const colors = currentProduct.value.variants.map((v) => v.color);
  const uniqueMap = new Map<string, (typeof colors)[0]>();

  colors.forEach((color) => {
    if (color && !uniqueMap.has(color.id)) {
      uniqueMap.set(color.id, color);
    }
  });

  return Array.from(uniqueMap.values());
});

const currentVariant = computed(() => {
  if (!currentProduct.value?.variants || !selectedVariantId.value) {
    return currentProduct.value?.variants?.[0] || null;
  }

  return (
    currentProduct.value.variants.find(
      (v) => v.id === selectedVariantId.value
    ) || currentProduct.value.variants[0]
  );
});

const selectVariantByColor = (colorId: string) => {
  selectedColorId.value = colorId;

  if (selectedSizeId.value) {
    const variantExists = currentProduct.value?.variants.some(
      (v) => v.color.id === colorId && v.size.id === selectedSizeId.value
    );

    if (!variantExists) {
      selectedSizeId.value = null;
    }
  }
};

const selectVariant = (variantId: string) => {
  selectedVariantId.value = variantId;

  const variant = currentProduct.value?.variants.find(
    (v) => v.id === variantId
  );
  if (variant) {
    selectedColorId.value = variant.color.id;
    selectedSizeId.value = variant.size.id;

    const index = currentProduct.value?.variants.findIndex(
      (v) => v.id === variantId
    );
    if (index !== -1) {
      selectedVariantIndex.value = index || 0;
    }
  }
};

const selectVariantBySize = (sizeId: string) => {
  selectedSizeId.value = sizeId;

  if (selectedColorId.value) {
    const variantExists = currentProduct.value?.variants.some(
      (v) => v.size.id === sizeId && v.color.id === selectedColorId.value
    );

    if (!variantExists) {
      selectedColorId.value = null;
    }
  }
};

const fetchProductData = async () => {
  const id = productId.value;
  if (!id) {
    console.error("❌ No product ID provided");
    productError.value = "No product ID provided";
    return;
  }

  isLoadingProduct.value = true;
  productError.value = null;

  try {
    // First, check if product is in items store
    const storeProduct = getProductFromItemsStore();
    if (storeProduct) {
      currentProduct.value = storeProduct;
      isLoadingProduct.value = false;
      return;
    }

    // Convert ID to string if needed
    const stringId = String(id);

    await itemStoreYou.fetchItemById(stringId);

    // Check if the store now has the item
    if (itemStoreYou.item) {
      currentProduct.value = itemStoreYou.item;
      return;
    }

    // If store has an error, use that
    if (itemStoreYou.error) {
      productError.value = `Failed to load product: ${itemStoreYou.error}`;
      return;
    }

    // If no item and no error, something went wrong
    productError.value = "Product not found";
  } catch (err: unknown) {
    console.error("💥 Error in fetchProductData:", err);

    if (err instanceof Error) {
      productError.value = `Failed to load product: ${err.message}`;
    } else {
      productError.value = "Unknown error occurred while fetching product";
    }

    // Final fallback attempt to store cache
    const fallback = getProductFromItemsStore();
    if (fallback) {
      currentProduct.value = fallback;
      productError.value = null;
    }
  } finally {
    isLoadingProduct.value = false;
  }
};

const availableSizes = computed(() => {
  if (!currentProduct.value?.variants) return [];

  let filteredVariants = currentProduct.value.variants;

  if (selectedColorId.value) {
    filteredVariants = filteredVariants.filter(
      (v) => v.color.id === selectedColorId.value
    );
  }

  const sizes = filteredVariants.map((v) => v.size);
  const uniqueMap = new Map<string, (typeof sizes)[0]>();

  sizes.forEach((size) => {
    if (size && !uniqueMap.has(size.id)) {
      uniqueMap.set(size.id, size);
    }
  });

  return Array.from(uniqueMap.values());
});

const availableColors = computed(() => {
  if (!currentProduct.value?.variants) return [];

  let filteredVariants = currentProduct.value.variants;

  if (selectedSizeId.value) {
    filteredVariants = filteredVariants.filter(
      (v) => v.size.id === selectedSizeId.value
    );
  }

  const colors = filteredVariants.map((v) => v.color);
  const uniqueMap = new Map<string, (typeof colors)[0]>();

  colors.forEach((color) => {
    if (color && !uniqueMap.has(color.id)) {
      uniqueMap.set(color.id, color);
    }
  });

  return Array.from(uniqueMap.values());
});

const displayPrice = computed(() => {
  if (!currentVariant.value) {
    return { final: "0.00", original: "0.00", hasDiscount: false };
  }

  const variant = currentVariant.value;
  const finalPrice = parseFloat(
    String(variant.final_price || variant.price || "0")
  ).toFixed(2);
  const originalPrice = parseFloat(String(variant.price || "0")).toFixed(2);

  const finalPriceNum = parseFloat(String(variant.final_price || "0"));
  const originalPriceNum = parseFloat(String(variant.price || "0"));

  return {
    final: finalPrice,
    original: originalPrice,
    hasDiscount: !!variant.final_price && finalPriceNum < originalPriceNum,
  };
});

const brandName = computed(
  () => currentProduct.value?.brand?.name || "Unknown Brand"
);

const isDevelopment = computed(() => process.env.NODE_ENV === "development");

function goToCart() {
  router.push("/cart");
  handleAddToCart();
}
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
        // is_favorite: currentVariant.value.is_favorite,
        created_at: currentVariant.value.created_at,
        updated_at: currentVariant.value.updated_at,

        // Include color, size, and item data if available
        color: currentVariant.value.color,
        size: currentVariant.value.size,
        item: {
          id: currentProduct.value.id,
          name: currentProduct.value.name,
          description: currentProduct.value.description,
          // total_sold: currentProduct.value.total_sold,
          // last_sale_at: currentProduct.value.last_sale_at,
          // is_featured_new_arrival: currentProduct.value.is_featured_new_arrival,
          // is_featured_trending: currentProduct.value.is_featured_trending,
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
          // discount: currentProduct.value.discount // Removed to fix type error
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

const buyNow = async () => {
  if (!cartStore.error) {
    router.push("/cart");
  }
};

const submitReview = async () => {
  if (rating.value <= 0) {
    errors.value = "Please provide a rating.";
    return;
  }
  if (!comment.value.trim()) {
    errors.value = "Please write a comment.";
    return;
  }
  isSubmitting.value = true;
  errors.value = null;

  try {
    await reviewStore.submitReview({
      item_id: currentProduct.value?.id ?? "",
      rating: rating.value.toString(),
      comment: comment.value,
    });
    rating.value = 0;
    comment.value = "";
  } catch (e) {
    errors.value = "Failed to submit review. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};

const isAddToCartDisabled = computed(() => {
  return (
    !currentVariant.value ||
    currentVariant.value.quantity === 0 ||
    quantity.value > currentVariant.value.quantity ||
    cartStore.loading
  );
});

const addToCartButtonText = computed(() => {
  if (cartStore.loading) return "ADDING...";
  if (!currentVariant.value) return "SELECT VARIANT";
  if (currentVariant.value.quantity === 0) return "OUT OF STOCK";
  return "ADD TO CART";
});

// Watch productId changes to refetch product
watch(
  productId,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      currentProduct.value = null;
      productError.value = null;
      await fetchProductData();
    }
  },
  { immediate: true }
);

// Watch for product changes to reset selected variant
watch(
  currentProduct,
  (newProduct) => {
    if (newProduct?.variants?.length) {
      selectedVariantId.value = newProduct.variants[0].id;
      selectedColorId.value = newProduct.variants[0].color.id;
      selectedSizeId.value = newProduct.variants[0].size.id;
      selectedVariantIndex.value = 0;
    }
  },
  { immediate: true }
);

// Fixed: Component initialization with proper error handling and store consistency
// Fixed: Component initialization with proper error handling
onMounted(async () => {
  try {
    // Fetch new arrivals first
    await newArrivalStore.fetchNewArrivals();

    // Get the current product ID from the computed property
    const currentProductId = productId.value;

    if (currentProductId && currentProductId.trim() !== "") {
      // Fetch the specific product using the store method
      await itemStoreYou.fetchItemById(currentProductId);

      // After fetching, set the current product if successful
      if (itemStoreYou.item && !itemStoreYou.error) {
        currentProduct.value = itemStoreYou.item;
      } else if (itemStoreYou.error) {
        productError.value = itemStoreYou.error;
      }

      // Fetch product-specific reviews
      await reviewStore.fetchReviews({ itemId: currentProductId });
    } else {
      console.error("❌ No valid product ID found in route");
      productError.value = "No product ID found in route";
    }
  } catch (error) {
    console.error("💥 Error during component initialization:", error);
    productError.value = "Failed to initialize component";
  }
});
</script>

<template>
  <div class="">
    <!-- Loading state -->
    <div v-if="isLoadingProduct" class="text-center py-10">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="mt-4">Loading product details...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="productError && !currentProduct" class="text-center py-10">
      <v-alert type="error" class="mb-4">
        {{ productError }}
      </v-alert>
      <p class="text-gray-600 mb-4">Product ID: {{ productId }}</p>
      <v-btn color="primary" @click="router.push('/')">
        {{ $t("buttons.back") }}
      </v-btn>
    </div>

    <!-- Product content -->
    <div
      v-else-if="
        currentProduct &&
        currentProduct.variants &&
        currentProduct.variants.length > 0
      "
    >
      <v-container fluid>
        <v-container max-width="1400px">
          <v-row>
            <!-- left thumbnail images -->
            <v-col cols="12" sm="3" md="2" class="hidden md:block mb-5 md:mb-4">
              <div class="flex md:flex-col justify-start items-center h-full">
                <v-card
                  class="w-[110px] h-[130px] md:h-52 md:w-[175px] md:mb-5 cursor-pointer hover:shadow-lg transition-shadow"
                  v-for="(variant, index) in currentProduct.variants"
                  :key="variant.id"
                  @click="selectVariant(variant.id)"
                  :class="{
                    'border-2 border-primary': selectedVariantId === variant.id,
                  }"
                >
                  <img
                    :src="
                      variant.image ||
                      'https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg'
                    "
                    class="rounded w-full h-full object-cover"
                    :alt="`${currentProduct.name} variant ${index + 1}`"
                  />
                </v-card>
              </div>
            </v-col>

            <!-- middle main image -->
            <v-col cols="12" sm="9" md="5" class="mb-4">
              <div class="h-100">
                <v-card class="h-100">
                  <v-img
                    :src="
                      currentVariant?.image ||
                      'https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg'
                    "
                    :height="$vuetify.display.mdAndUp ? '788px' : '450px'"
                    class="rounded"
                    cover
                  />
                </v-card>
              </div>
            </v-col>

            <!-- right product info -->
            <v-col cols="12" sm="12" md="5">
              <div class="border-b-[2px]">
                <p class="text-[35px] font-bold">
                  {{ currentProduct.name }}
                </p>

                <!-- rating -->
                <div v-if="reviews.length > 0 && reviews[0]">
                  <v-rating v-model="reviews[0].rating" readonly>
                    <template v-slot:item="props">
                      <v-icon
                        size="25"
                        :color="
                          props.isFilled
                            ? colors[props.index]
                            : 'grey-lighten-1'
                        "
                      >
                        {{ props.isFilled ? "mdi-star" : "mdi-star-outline" }}
                      </v-icon>
                    </template>
                  </v-rating>
                </div>

                <!-- Price Display -->
                <div class="d-flex items-center my-3">
                  <p class="text-red mr-2 text-[30px]">
                    ${{ displayPrice.final }} USD
                  </p>
                  <p
                    v-if="displayPrice.hasDiscount"
                    class="line-through text-gray-500 text-[15px]"
                  >
                    ${{ displayPrice.original }} USD
                  </p>
                </div>
              </div>

              <!-- brand -->
              <div class="flex justify-between">
                <div class="flex justify-between items-center">
                  <p class="font-bold mr-3 text-[20px]">
                    {{ $t("content.brand") }}:
                  </p>
                  <div class="w-32 border-2 rounded border-blue-400 p-2">
                    <p class="text-center font-semibold">
                      {{ brandName }}
                    </p>
                  </div>
                </div>

                <div class="">
                  <v-dialog>
                    <template v-slot:activator="{ props: activatorProps }">
                      <div
                        v-bind="activatorProps"
                        class="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <v-btn
                          class="text-blue"
                          variant="text"
                          size="x-large"
                          icon
                        >
                          <v-icon size="40">mingcute:t-shirt-fill</v-icon>
                        </v-btn>
                        <p>Size Guide</p>
                      </div>
                    </template>

                    <template v-slot:default="{ isActive }">
                      <v-card>
                        <v-card-title>
                          <div class="flex justify-end">
                            <v-btn
                              icon="iconoir:cancel"
                              variant="text"
                              @click="isActive.value = false"
                            />
                          </div>
                        </v-card-title>
                        <v-card-text>
                          <SideGuide />
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </div>
              </div>

              <!-- Variants Section -->
              <div class="my-4">
                <p class="font-bold mb-3">
                  {{ currentProduct.variants.length }} Variants Available:
                </p>
                <div class="flex gap-5 overflow-x-auto no-scrollbar">
                  <v-card
                    v-for="variant in currentProduct.variants"
                    :key="variant.id"
                    class="relative mb-2 w-[180px] flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
                    @click="selectVariant(variant.id)"
                    :class="{
                      'border-2 border-primary':
                        selectedVariantId === variant.id,
                    }"
                  >
                    <!-- Variant Info Badge -->
                    <div
                      class="absolute rounded-full z-10 px-2 py-1 text-[12px] left-1 top-2 bg-opacity-70 font-bold"
                      :style="{
                        backgroundColor: variant.color.hex_code,
                        color:
                          variant.color.name.toLowerCase() === 'black'
                            ? '#ffffff'
                            : '#000000',
                      }"
                    >
                      {{ variant.color.name }}
                    </div>

                    <div
                      class="absolute z-10 px-2 py-1 rounded-full text-[12px] left-1 top-10 bg-opacity-70 font-bold"
                      :style="{
                        backgroundColor: variant.color.hex_code,
                        color:
                          variant.color.name.toLowerCase() === 'black'
                            ? '#ffffff'
                            : '#000000',
                      }"
                    >
                      {{ variant.size.name }}
                    </div>

                    <!-- Stock Badge -->
                    <div
                      class="absolute z-10 px-2 py-1 rounded-full text-[12px] right-1 top-2 border-2 bg-blue-400 border-blue-500 text-white"
                    >
                      {{ variant.quantity }} in stock
                    </div>

                    <!-- Out of Stock Overlay -->
                    <div
                      v-if="variant.quantity === 0"
                      class="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-20 rounded"
                    >
                      <p class="text-white font-bold">OUT OF STOCK</p>
                    </div>

                    <v-img
                      :src="
                        variant.image ||
                        'https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg'
                      "
                      cover
                      position="top"
                      class="w-full h-[250px] md:h-[250px] lg:h-[300px] rounded"
                      :alt="`${currentProduct.name} - ${variant.color.name} ${variant.size.name}`"
                    />
                  </v-card>
                </div>
              </div>

              <!-- share -->
              <div class="flex items-center my-4">
                <p class="mr-2 font-semibold">{{ $t('content.share') }}:</p>
                <div class="d-flex text-[#1576F5]">
                  <v-btn
                    v-for="icon in icons"
                    :key="icon"
                    :icon="icon"
                    size="large"
                    density="comfortable"
                    variant="text"
                    class="mx-1"
                  ></v-btn>
                </div>
              </div>

              <!-- buttons -->
              <div class="my-3">
                <div class="d-flex justify-between align-center ga-2 mb-3">
                  <!-- Quantity Selector -->
                  <div
                    class="w-[25%] flex items-center justify-between rounded-lg border border-gray-300 px-2 py-1"
                  >
                    <v-btn
                      size="small"
                      variant="text"
                      @click="decrease"
                      :disabled="quantity <= 1"
                      icon
                    >
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>

                    <p class="text-center w-8">{{ quantity }}</p>

                    <v-btn
                      variant="text"
                      size="small"
                      @click="increase"
                      :disabled="quantity >= (currentVariant?.quantity || 0)"
                      icon
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </div>

                  <!-- Add to Cart Button -->
                  <v-btn
                    color="blue"
                    class="text-white px-10 w-[55%] md:w-[65%]"
                    rounded="lg"
                    size="large"
                    @click="handleAddToCart()"
                    :disabled="isAddToCartDisabled"
                    :loading="cartStore.loading"
                  >
                    {{ addToCartButtonText }}
                  </v-btn>

                  <!-- Favorite Button -->
                  <v-btn
                    @click.stop="
                      handleAddToWishlist(currentProduct.variants[0])
                    "
                    icon
                    :class="
                      favoriteVariants.has(currentProduct.variants[0].id)
                        ? 'text-red'
                        : 'bg-white text-black'
                    "
                  >
                    <v-icon
                      :icon="
                        favoriteVariants.has(currentProduct.variants[0].id)
                          ? 'mdi-heart'
                          : 'mdi-heart-outline'
                      "
                    />
                  </v-btn>
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
                    <v-btn
                      variant="text"
                      class="text-white"
                      @click="snackbar = false"
                    >
                      {{ $t("buttons.close") }}
                    </v-btn>
                  </template>
                </v-snackbar>

                <v-btn
                  block
                  size="large"
                  color="primary"
                  rounded="lg"
                  @click="goToCart()"
                  :disabled="isAddToCartDisabled"
                  :loading="cartStore.loading"
                >
                  {{ $t("buttons.buy_now") }}
                </v-btn>
              </div>

              <!-- Cart Error Display -->
              <v-alert
                v-if="cartStore.error"
                type="error"
                dismissible
                class="mt-3"
                @click:close="cartStore.error = null"
              >
                {{ cartStore.error }}
              </v-alert>
            </v-col>
          </v-row>
        </v-container>

        <!-- description tabs -->
        <v-card variant="text">
          <v-tabs align-tabs="center" v-model="tab">
            <v-tab value="description">Description</v-tab>
            <v-tab value="review">Review</v-tab>
          </v-tabs>

          <v-card-text>
            <v-tabs-window v-model="tab">
              <!-- description -->
              <v-tabs-window-item value="description">
                <v-row class="justify-center mt-3">
                  <v-col cols="12" md="4" class="flex justify-center">
                    <div class="w-[200px] md:w-[400px] md:mb-2">
                      <v-img
                        :src="
                          currentVariant?.image ||
                          'https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg'
                        "
                        class="rounded"
                        alt="Product description image"
                      />
                    </div>
                  </v-col>
                  <v-col cols="12" md="5" class="">
                    <div class="">
                      <div class="border-b-2 pb-2 border-gray-300">
                        <p class="text-[20px] font-bold">
                          Perfect Quality Wear
                        </p>
                      </div>
                      <p class="py-4 text-gray-500">
                        <span class="pl-5"></span>
                        {{ currentProduct.description }}
                      </p>
                    </div>
                    <div class="">
                      <div class="border-b-2 pb-2 border-gray-300">
                        <p class="text-[20px] font-bold">Size & Fit</p>
                      </div>
                      <v-row class="my-2">
                        <v-col cols="4" class="text-[18px]">
                          <p>Season</p>
                          <p>category</p>
                          <p>Color</p>
                          <p>Size</p>
                        </v-col>
                        <v-col class="text-[18px] text-gray-500">
                          <p>: {{ currentProduct.season.name }}</p>
                          <p>: {{ currentProduct.category.name }}</p>
                          <p>: {{ currentVariant?.color.name }}</p>
                          <p>: {{ currentVariant?.size.name }}</p>
                        </v-col>
                      </v-row>
                    </div>
                    <div class="">
                      <div class="border-b-2 pb-2 border-gray-300">
                        <p class="text-[20px] font-bold">
                          Washing Instructions
                        </p>
                      </div>
                      <div>
                        <v-list class="pa-0">
                          <v-list-item
                            v-for="(item, index) in notes"
                            :key="index"
                            class="d-flex align-center pa-0"
                            density="compact"
                          >
                            <v-icon size="large" class="mr-2"
                              >mdi-circle-small</v-icon
                            >
                            <span class="text-gray-600">{{ item }}</span>
                          </v-list-item>
                        </v-list>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <!-- review -->
              <v-tabs-window-item value="review">
                <v-row class="justify-center my-3">
                  <v-col cols="12" md="5">
                    <div class="h-[350px] overflow-y-auto pr-2">
                      <div
                        class="flex justify-center items-center"
                        v-if="reviews.length === 0"
                      >
                        <div class="">
                          <img class="w-60" src="images/no_data.gif" alt="" />
                          <p class="text-center">Be the first to comment</p>
                        </div>
                      </div>
                      <v-card
                        v-else
                        class="mx-auto border mb-4"
                        v-for="review in reviews"
                        :key="review.id"
                      >
                        <v-card-title>
                          <div class="flex justify-between">
                            <div class="flex">
                              <v-avatar size="x-large">
                                <img
                                  src="/images/profile.webp"
                                  class="object-cover"
                                  alt="User avatar"
                                />
                              </v-avatar>
                              <div class="ml-3">
                                <p class="font-bold text-[20px]">
                                  {{ review.customer.full_name }}
                                </p>
                                <p class="text-[12px] text-gray-500">
                                  {{ timeAgo(review.created_at) }}
                                </p>
                              </div>
                            </div>
                            <div class="text-center">
                              <v-rating v-model="review.rating" readonly>
                                <template v-slot:item="props">
                                  <v-icon
                                    size="20"
                                    :color="
                                      props.isFilled
                                        ? colors[props.index]
                                        : 'grey-lighten-1'
                                    "
                                  >
                                    {{
                                      props.isFilled ? "noto:star" : "uim:star"
                                    }}
                                  </v-icon>
                                </template>
                              </v-rating>
                            </div>
                          </div>
                        </v-card-title>
                        <v-card-text class="!text-[18px] my-3">
                          {{ review.comment }}
                        </v-card-text>
                      </v-card>
                    </div>
                  </v-col>
                  <v-col cols="12" md="5">
                    <p class="font-bold text-[25px]">Be the first to review</p>
                    <p class="text-gray-400 my-2">
                      Your email address will not be published. Required fields
                      are marked *
                    </p>
                    <!-- rating -->
                    <div class="flex items-center">
                      <p class="font-bold mr-2">
                        Your rating <span class="text-red">*</span>:
                      </p>
                      <div class="text-center">
                        <v-rating v-model="rating">
                          <template v-slot:item="props">
                            <v-icon
                              size="20"
                              :color="
                                props.isFilled
                                  ? colors[props.index]
                                  : 'grey-lighten-1'
                              "
                            >
                              {{ props.isFilled ? "noto:star" : "uim:star" }}
                            </v-icon>
                          </template>
                        </v-rating>
                      </div>
                    </div>
                    <!-- review textarea -->
                    <div class="">
                      <v-textarea
                        label="Your review *"
                        variant="outlined"
                        v-model="comment"
                      ></v-textarea>

                      <p class="text-gray-500 text-[12px]">
                        <span class="text-red">*</span> You have to be logged in
                        to be able to review the products.
                      </p>
                    </div>
                    <div class="mt-4">
                      <v-btn
                        rounded
                        class="px-5"
                        color="primary"
                        :loading="submittingReview"
                        :disabled="submittingReview"
                        @click="submitReview"
                      >
                        Submit
                      </v-btn>

                      <!-- Show error message -->
                      <p v-if="reviewError" class="text-red-600 mt-2">
                        {{ reviewError }}
                      </p>
                    </div>
                  </v-col>
                </v-row>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>

        <!-- brand component -->
        <div class="w-full">
          <Brand />
        </div>

        <!-- related products -->
        <div class="mt-10 mb-3">
          <p class="text-center font-bold text-[25px]">
            {{ $t("content.product_you_may_like") }}
          </p>
        </div>

        <!-- recommendation -->
        <div class="">
          <Related :product-id="currentProduct?.id" />
        </div>
      </v-container>
    </div>

    <!-- Fallback for no product found -->
    <div v-else class="text-center py-10">
      <v-alert type="info" class="mb-4">
        Product not found or no variants available
        <br />
        Product ID: {{ productId }}
        <br />
        <span v-if="isDevelopment">
          All Items Store Count: {{ itemStoreYou.items?.length || 0 }}
        </span>
      </v-alert>
      <v-btn color="primary" @click="router.push('/')">
        {{ $t("buttons.back_to_products") }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>
