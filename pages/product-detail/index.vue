<script setup lang="ts">
import type { Item } from "~/types/item/item"; // Make sure this path is correct

// Layout
definePageMeta({ layout: "main-layout" });

// Router
const route = useRoute();
const router = useRouter();

// UI States
const quantity = ref<number>(1);
const isLiked = ref<boolean>(true);
const tab = ref<string>("description");
const rating = ref<number>(4.5);
const selectedSizeId = ref<string | number | null>(null);

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

// Product State
const currentProduct = ref<Item | null>(null);
const isLoadingProduct = ref(false);
const productError = ref<string | null>(null);

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
  if (womanItems.value && productId.value) {
    const found = womanItems.value.find((item) => item.id === productId.value);
    return found || null;
  }
  return null;
};

const uniqueSizes = computed(() => {
  if (!currentProduct.value) return [];

  const sizes = currentProduct.value.variants.map((v) => v.size);

  const uniqueMap = new Map<string, (typeof sizes)[0]>();
  sizes.forEach((size) => {
    if (size && !uniqueMap.has(size.id)) {
      uniqueMap.set(size.id, size);
    }
  });

  return Array.from(uniqueMap.values());
});

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

// Computed price display
const displayPrice = computed(() => {
  if (!currentProduct.value?.variants?.length) {
    return { final: "0.00", original: "0.00", hasDiscount: false };
  }
  const variant = currentProduct.value.variants[0];
  const finalPrice = parseFloat(
    String(variant.final_price ?? variant.price ?? "0")
  ).toFixed(2);
  const originalPrice = parseFloat(String(variant.price ?? "0")).toFixed(2);
  return {
    final: finalPrice,
    original: originalPrice,
    hasDiscount:
      !!variant.final_price &&
      parseFloat(String(variant.final_price)) <
        parseFloat(String(variant.price ?? "0")),
  };
});

// If you want to display brand name later
// const brandName = computed(() => currentProduct.value?.brand?.name || "Unknown Brand");

const isDevelopment = computed(() => process.env.NODE_ENV === "development");

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
  } else {
    productError.value = "No product ID found in route";
  }
});

const addToCart = () => {
  if (!currentProduct.value) {
    console.warn("No item available to add to cart");
    return;
  }

  const cartItem = {
    id: currentProduct.value.id,
    quantity: quantity.value,
    variant: currentProduct.value.variants?.[0] ?? null,
  };

  console.log("Adding to cart:", cartItem);
  // TODO: Integrate your cart store here, e.g.
  // cartStore.addToCart(cartItem);
};

const buyNow = () => {
  if (!currentProduct.value) {
    console.warn("No item available for purchase");
    return;
  }

  addToCart();
  router.push("/checkout");
};
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
            <!-- left  -->
            <v-col cols="12" sm="3" md="2" class="mb:5 md:mb-4">
              <div class="flex md:flex-col justify-start items-center h-full">
                <v-card
                  class="w-[110px] h-[130px] md:h-52 md:w-[175px] md:mb-5 cursor-pointer hover:shadow-lg transition-shadow"
                  v-for="(variant, index) in currentProduct.variants"
                  :key="variant.id"
                >
                  <img
                    :src="
                      variant.image ||
                      'https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg'
                    "
                    class="rounded w-full"
                    :alt="`${currentProduct.name} variant ${index + 1}`"
                  />
                </v-card>
              </div>
            </v-col>

            <!-- middle -->
            <v-col cols="12" sm="9" md="5" class="mb-4">
              <div class="h-100">
                <v-carousel
                  class="h-100"
                  show-arrows
                  hide-delimiter-background
                  hide-delimiters
                  :interval="5000"
                  cycle
                >
                  <v-carousel-item
                    v-for="variant in currentProduct.variants"
                    :key="variant.id"
                    class="h-100"
                  >
                    <v-img
                      :src="
                        variant.image ||
                        'https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg'
                      "
                      class="h-[450px] md:h-[740px] object-cover rounded"
                      cover
                    />
                  </v-carousel-item>
                </v-carousel>
              </div>
            </v-col>

            <!-- right  -->
            <v-col cols="12" sm="12" md="5">
              <div class="border-b-[2px]">
                <p class="text-[35px] font-bold">
                  {{ currentProduct.name }}
                </p>

                <!-- rating  -->
                <div>
                  <v-rating v-model="rating" readonly>
                    <template v-slot:item="props">
                      <v-icon
                        size="25"
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

              <!-- brand  -->
              <div class="flex justify-between">
                <div class="flex justify-between items-center">
                  <p class="font-bold mr-3 text-[20px]">Brand:</p>
                  <div class="w-32 border-2 rounded border-blue-400 p-2">
                    <p class="text-center font-semibold">
                      {{ currentProduct.brand.name }}
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

              <!-- item variants -->
              <div class="">
                <p class="font-bold mb-5">
                  {{ currentProduct.variants.length }} Colors Available :
                </p>
                <div class="flex flex-wrap gap-2">
                  <v-card
                    class="relative mb-2 w-[120px] cursor-pointer hover:shadow-lg transition-shadow"
                    v-for="variant in currentProduct.variants"
                    :key="variant.id"
                  >
                    <div
                      class="absolute z-10 px-2 rounded text-[12px] right-1 top-1"
                      :style="{ backgroundColor: variant.color?.hex_code }"
                    >
                      {{ variant.color?.name || "Default" }}
                    </div>
                    <img
                      :src="
                        variant.image ||
                        'https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg'
                      "
                      class="rounded w-full"
                      :alt="`${currentProduct.name} in ${
                        variant.color?.name || 'default color'
                      }`"
                    />
                  </v-card>
                </div>
              </div>

              <!-- size  -->
              <div class="flex items-center my-4">
                <p class="mr-2 font-semibold">Size :</p>
                <v-item-group
                  v-model="selectedSizeId"
                  mandatory
                  selected-class="bg-primary"
                >
                  <v-container>
                    <v-row>
                      <v-col v-for="size in uniqueSizes" :key="size.id">
                        <v-item v-slot="{ selectedClass, toggle }">
                          <v-card
                            :class="[
                              'd-flex text-center justify-center cursor-pointer',
                              selectedClass,
                            ]"
                            variant="outlined"
                            @click="toggle"
                          >
                            <div class="text-center px-2 py-1">
                              <p class="uppercase text-[14px] p-2">
                                {{ size.name }}
                              </p>
                            </div>
                          </v-card>
                        </v-item>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-item-group>
              </div>

              <!-- share  -->
              <div class="flex items-center my-4">
                <p class="mr-2 font-semibold">Share :</p>
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

              <!-- btn  -->
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

                    <v-btn variant="text" size="small" @click="increase" icon>
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </div>

                  <!-- Add to Cart Button -->
                  <v-btn
                    color="blue"
                    class="text-white px-10 w-[55%] md:w-[65%]"
                    rounded="lg"
                    size="large"
                  >
                    ADD TO CART
                  </v-btn>

                  <!-- Favorite Button -->
                  <v-btn icon variant="outlined" rounded="lg">
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
                >
                  BUY NOW
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
        <!-- description  -->
        <v-card variant="text">
          <v-tabs align-tabs="center" v-model="tab">
            <v-tab value="description">description</v-tab>
            <v-tab value="review">review</v-tab>
          </v-tabs>

          <v-card-text>
            <v-tabs-window v-model="tab">
              <!-- description -->
              <v-tabs-window-item value="description">
                <v-row class="justify-center mt-3">
                  <v-col cols="12" md="4" class="flex justify-center">
                    <div class="w-[200px] md:w-[400px] md:mb-2">
                      <img
                        :src="currentProduct.variants[1].image"
                        class="rounded"
                        alt=""
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
                          <p>Weight</p>
                          <p>Dimensions</p>
                          <p>Color</p>
                          <p>Size</p>
                        </v-col>
                        <v-col class="text-[18px] text-gray-500">
                          <p>: 500 g</p>
                          <p>: 70 × 500 × 700 cm</p>
                          <p>: {{ currentProduct.variants[0].color.name }}</p>
                          <p>: {{ currentProduct.variants[0].size.name }}</p>
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
              <!-- review  -->
              <v-tabs-window-item value="review">
                <v-row class="justify-center my-3">
                  <v-col cols="12" md="5">
                    <v-card class="mx-auto border mb-4" v-for="n in 3" :key="n">
                      <v-card-title>
                        <div class="flex justify-between">
                          <div class="flex">
                            <v-avatar size="x-large">
                              <img
                                src="/images/da.jpg"
                                class="object-cover"
                                alt=""
                              />
                            </v-avatar>
                            <div class="ml-3">
                              <p class="font-bold text-[20px]">Dada</p>
                              <p class="text-[12px] text-gray-500">
                                5 hour ago
                              </p>
                            </div>
                          </div>
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
                                  {{
                                    props.isFilled ? "noto:star" : "uim:star"
                                  }}
                                </v-icon>
                              </template>
                            </v-rating>
                          </div>
                        </div>
                      </v-card-title>
                      <v-card-text class="!text-[18px] my-3"
                        >I'm really happy with this shirt , it looks so good,
                        and I don't regret buying it at all.</v-card-text
                      >
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="5">
                    <p class="font-bold text-[25px]">Be the first to review</p>
                    <p class="text-gray-400 my-2">
                      Your email address will not be published. Required fields
                      are marked *
                    </p>
                    <!-- rating  -->
                    <div class="flex items-center">
                      <p class="font-bold mr-2">
                        Your rating <span class="text-red">*</span> :
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
                    <!-- remark  -->
                    <div class="">
                      <v-textarea
                        label="Your review *"
                        variant="outlined"
                      ></v-textarea>
                      <p class="text-gray-500 text-[12px]">
                        <span class="text-red">*</span> You have to be logged in
                        to be able review the products .
                      </p>
                    </div>
                    <div class="mt-4">
                      <v-btn rounded class="px-5" color="primary">submit</v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
        <!-- brand  -->
        <div class="w-full">
          <Brand />
        </div>
        <!-- product relate  -->
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

<style scoped></style>
