<script setup lang="ts">
import type { Item } from "~/types/item/item";
definePageMeta({ layout: "main-layout" });

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

// Router
const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const reviewStore = useReviewStore();
const { reviews } = storeToRefs(reviewStore);

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

function increase() {
  quantity.value++;
}

function decrease() {
  if (quantity.value > 1) quantity.value--;
}

const productId = computed(() => {
  // Try route param first
  let id = getRouteParam(route.params.id as string | string[]);
  // If not found, fallback to query param
  if (!id) id = getRouteParam(route.query.id as string | string[]);
  return id || undefined;
});

// Use your woman store (make sure this store is properly imported)
const womanStore = useWomanIteStore();
const { items: womanItems } = storeToRefs(womanStore);

// Try to find product from woman store by ID
const getProductFromWomanStore = (): Item | null => {
  const found = womanItems.value.find((item) => item.id === productId.value);
  return (found as unknown as Item) ?? null;
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

  // Check if current size is still available with this color
  if (selectedSizeId.value) {
    const variantExists = currentProduct.value?.variants.some(
      (v) => v.color.id === colorId && v.size.id === selectedSizeId.value
    );

    if (!variantExists) {
      selectedSizeId.value = null; // Reset size if combination doesn't exist
    }
  }
};

// Updated selectVariant function to properly handle variant selection
const selectVariant = (variantId: string) => {
  selectedVariantId.value = variantId;

  // Find the selected variant and update color/size references
  const variant = currentProduct.value?.variants.find(
    (v) => v.id === variantId
  );
  if (variant) {
    selectedColorId.value = variant.color.id;
    selectedSizeId.value = variant.size.id;

    // Update the variant index for thumbnail display
    const index = currentProduct.value?.variants.findIndex(
      (v) => v.id === variantId
    );
    if (index !== -1) {
      selectedVariantIndex.value = index || 0;
    }
  }
};

// Update size selection function
const selectVariantBySize = (sizeId: string) => {
  selectedSizeId.value = sizeId;

  // Check if current color is still available with this size
  if (selectedColorId.value) {
    const variantExists = currentProduct.value?.variants.some(
      (v) => v.size.id === sizeId && v.color.id === selectedColorId.value
    );

    if (!variantExists) {
      selectedColorId.value = null; // Reset color if combination doesn't exist
    }
  }
};

const fetchProductData = async () => {
  const id = productId.value;
  if (!id) {
    productError.value = "No product ID provided";
    return;
  }

  isLoadingProduct.value = true;
  productError.value = null;

  try {
    // Check if product is in woman store first
    const womanProduct = getProductFromWomanStore();
    if (womanProduct) {
      currentProduct.value = womanProduct;
      isLoadingProduct.value = false;
      return;
    }

    // Try multiple endpoints until success
    const possibleEndpoints = [
      `http://localhost:8000/api/customer/items/${id}`,
      `http://localhost:8000/api/items/${id}`,
      `http://localhost:8000/api/customer/api/items/${id}`,
    ];

    let fetchSuccess = false;

    for (const endpoint of possibleEndpoints) {
      try {
        const response = await $fetch<{ data: Item }>(endpoint);
        if (response?.data) {
          currentProduct.value = response.data;
          fetchSuccess = true;
          break;
        }
      } catch (err) {
        console.warn(`Failed to fetch from ${endpoint}`, err);
      }
    }

    if (!fetchSuccess) {
      // Fallback to woman store again
      const fallback = getProductFromWomanStore();
      if (fallback) {
        currentProduct.value = fallback;
      } else {
        throw new Error("Product not found in any source");
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      productError.value = `Failed to load product: ${err.message}`;
    } else {
      productError.value = "Unknown error occurred";
    }

    // Try fallback
    const fallback = getProductFromWomanStore();
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

  // If a color is selected, filter variants by that color
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

  // If a size is selected, filter variants by that size
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

// Computed price display based on current variant
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

// Get brand name
const brandName = computed(
  () => currentProduct.value?.brand?.name || "Unknown Brand"
);

const isDevelopment = computed(() => process.env.NODE_ENV === "development");

// Updated addToCart function with cart store integration
const addToCart = async () => {
  if (!currentProduct.value || !currentVariant.value) {
    console.warn("No item available to add to cart");
    return;
  }

  if (currentVariant.value.quantity === 0) {
    console.warn("Item is out of stock");
    return;
  }

  if (quantity.value > currentVariant.value.quantity) {
    console.warn("Requested quantity exceeds available stock");
    return;
  }

  const cartPayload = {
    item_variant_id: currentVariant.value.id,
    quantity: quantity.value,
  };

  try {
    await cartStore.addToCart(cartPayload);

    if (cartStore.error) {
      console.error("Failed to add to cart:", cartStore.error);
      // You can show a toast notification here
    } else {
      console.log("Successfully added to cart");
      // You can show a success toast notification here
      // Optional: Reset quantity after successful add
      quantity.value = 1;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};

const buyNow = async () => {
  // if (!currentProduct.value || !currentVariant.value) {
  //   console.warn("No item available for purchase");
  //   return;
  // }

  // // Add to cart first
  // await addToCart();

  // Only proceed to checkout if add to cart was successful
  if (!cartStore.error) {
    router.push("/cart"); // or wherever your checkout page is
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
    // Reset form
    rating.value = 0;
    comment.value = "";
  } catch (e) {
    errors.value = "Failed to submit review. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};
// Computed to check if add to cart button should be disabled
const isAddToCartDisabled = computed(() => {
  return (
    !currentVariant.value ||
    currentVariant.value.quantity === 0 ||
    quantity.value > currentVariant.value.quantity ||
    cartStore.loading
  );
});

// Computed to get the button text based on loading state
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
      selectedVariantId.value = newProduct.variants[0].id; // Select first variant by default
      selectedColorId.value = newProduct.variants[0].color.id;
      selectedSizeId.value = newProduct.variants[0].size.id;
      selectedVariantIndex.value = 0;
    }
  },
  { immediate: true }
);

// On component mount: fetch woman items if empty, then fetch product data
onMounted(async () => {
  if (!womanItems.value?.length) {
    try {
      await womanStore.fetchWomanItems();
    } catch (err) {
      console.error("Failed to load woman store items", err);
    }
  }

  if (productId.value) {
    await fetchProductData();
    // Fetch product-specific reviews
    await reviewStore.fetchReviews({ itemId: productId.value });
  } else {
    productError.value = "No product ID found in route";
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
      <v-btn color="primary" @click="router.push('/woman')">
        Back to Products
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
                  <p class="font-bold mr-3 text-[20px]">Brand:</p>
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
                <p class="mr-2 font-semibold">Share:</p>
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
                    @click="addToCart"
                    :disabled="isAddToCartDisabled"
                    :loading="cartStore.loading"
                  >
                    {{ addToCartButtonText }}
                  </v-btn>

                  <!-- Favorite Button -->
                  <v-btn
                    icon
                    variant="outlined"
                    rounded="lg"
                    @click="isLiked = !isLiked"
                  >
                    <v-icon :color="isLiked ? 'red' : 'grey'">
                      {{ isLiked ? "line-md:heart-filled" : "line-md:heart" }}
                    </v-icon>
                  </v-btn>
                </div>

                <v-btn
                  block
                  size="large"
                  color="primary"
                  rounded="lg"
                  @click="buyNow"
                  :disabled="isAddToCartDisabled"
                  :loading="cartStore.loading"
                >
                  BUY NOW
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

        <!-- Rest of your template remains the same -->
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
          <p class="text-center font-bold text-[25px]">Products Related</p>
        </div>

        <!-- recommendation -->
        <div class="">
          <NewArrival />
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
          Woman Store Items: {{ womanItems?.length || 0 }}
        </span>
      </v-alert>
      <v-btn color="primary" @click="router.push('/woman')">
        Back to Products
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
