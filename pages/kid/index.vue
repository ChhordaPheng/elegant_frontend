<script setup lang="ts">
import { useDisplay } from "vuetify";
import type { Size } from "~/types/size/size";

// Reactive variables
const activeIndex = ref<number | null>(null);
const drawer = ref<boolean>(false);
const { mdAndDown, lgAndUp } = useDisplay();
const active = ref<number | string>(20);
const page = ref<number>(1);

// Consider anything md and down as mobile
const isMobile = computed(() => mdAndDown.value);
const isLarge = computed(() => lgAndUp.value);

// Filter states - FIXED: Corrected price range based on API response
const priceRange = ref([0.03, 209.99]); // Updated to match API data
const selected = ref("");
const selectedSize = ref<string | null>(null); // Changed from array to single selection
const selectedBrand = ref<string | null>(null);
const sortSelection = ref("");
const favoriteVariants = ref<Set<string>>(new Set());

const router = useRouter();
const currentProduct = ref<any>(null);
const currentVariant = ref<any>(null);
const quantity = ref<number>(1);
const snackbar = ref(false);
const text = ref(""); // message for snackbar

// Store
const cartStore = useCartStore();
const kidStore = useKidIteStore();
const { kids } = storeToRefs(kidStore);
const brandStore = useBrandStore();
const { brands } = storeToRefs(brandStore);
const categoryStore = useCategoryStore();
const { categories } = storeToRefs(categoryStore);
const colorStore = useColorStore();
const { colors } = storeToRefs(colorStore);
const sizeStore = useSizeStore();
const { sizes } = storeToRefs(sizeStore);
const priceStore = usePriceStore();
const { prices } = storeToRefs(priceStore);
const favoriteStore = useFavoriteStore();
const topTrendingStore = useTopTrendingStore();
const { topTrendings } = storeToRefs(topTrendingStore);

// Selected category name - NEW
const selectedCategoryName = ref("Clothes");

// Computed property to build current filters
const currentFilters = computed(() => {
  const filters: any = {};

  // Price filter
  if (priceRange.value[0] !== 0.03 || priceRange.value[1] !== 209.99) {
    filters.min_price = priceRange.value[0];
    filters.max_price = priceRange.value[1];
  }

  // Color filter
  if (selected.value) {
    const color = colors.value?.find((c) => c.name === selected.value);
    if (color) {
      filters.color_id = color.id;
    }
  }

  // Size filter
  if (selectedSize.value) {
    filters.size_id = selectedSize.value;
  }

  // Brand filter
  if (selectedBrand.value) {
    filters.brand_id = selectedBrand.value;
  }

  // Category filter (if you have activeIndex for category)
  if (activeIndex.value) {
    filters.category_id = activeIndex.value;
  }

  return filters;
});

// Debounce utility function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced function to apply filters
const debouncedApplyFilters = debounce(async () => {
  await kidStore.applyFilters(currentFilters.value);
}, 500); // 500ms delay

// Watch for filter changes and apply them
watch(
  [priceRange, selected, selectedSize, selectedBrand, activeIndex],
  () => {
    // Debounce the filter application to avoid too many API calls
    debouncedApplyFilters();
  },
  { deep: true }
);

// Function to get image path based on category slug - NEW
const getCategoryImage = (slug: string) => {
  const imageMap: { [key: string]: string } = {
    "womens-tops-blouses":
      "https://i.pinimg.com/1200x/ff/77/bb/ff77bb54104159804f94781b5da0e762.jpg",
    "mens-jackets-coats":
      "https://i.pinimg.com/1200x/f0/05/e2/f005e2c108fb06178812753158a344ba.jpg",
    "kids-boys-clothing":
      "https://i.pinimg.com/1200x/56/9a/06/569a064e2b1d5d781d4a1e7156d1fb80.jpg",
    "kids-baby-toddler":
      "https://i.pinimg.com/736x/ad/78/6f/ad786f96ef655f7a216e5d455872c9a6.jpg",
    "mens-suits-formal":
      "https://i.pinimg.com/736x/4d/21/c2/4d21c2427196914481a05bbff2e80a91.jpg",
    "mens-jeans-pants":
      "https://i.pinimg.com/1200x/c6/fb/f9/c6fbf9d664b617c74cf956f1edf15c39.jpg",
    "mens-shoes":
      "https://i.pinimg.com/1200x/8b/3b/fa/8b3bfaf6d9a9ad6cc09c45f3d1b06395.jpg",
    "womens-skirts":
      "https://i.pinimg.com/1200x/89/f1/85/89f1853d61a0895406183def9ede595d.jpg",
    "kids-girls-clothing":
      "https://i.pinimg.com/736x/94/be/72/94be728a18d26fbcfe35f0a51038e7ff.jpg",
    "womens-jewelry":
      "https://i.pinimg.com/736x/4a/f0/95/4af095b9178fa98828b0fff937a08e9c.jpg",
    "womens-jackets-coats":
      "https://i.pinimg.com/1200x/9d/e4/fa/9de4fa6a964166ad640af14855fb2fef.jpg",
    "kids-shoes":
      "https://i.pinimg.com/736x/da/96/75/da9675ed0b94e99b62c395af7e039d8f.jpg",
    "mens-shirts":
      "https://i.pinimg.com/1200x/f1/15/e4/f115e4321d524351b04c7ecbf24b00c2.jpg",
    "womens-handbags":
      "https://i.pinimg.com/1200x/48/0d/57/480d57c02cdbc6c26a613778b6facd42.jpg",
    "womens-pants-jeans":
      "https://i.pinimg.com/736x/6a/d7/51/6ad7512d276c29f6909b2b8b648fe516.jpg",
    "womens-shoes":
      "https://i.pinimg.com/736x/28/a8/7f/28a87f7b9a4f4cdcfb1aa96e1d74a6ad.jpg",
    "mens-tshirts-polos":
      "https://i.pinimg.com/736x/34/68/4f/34684fefc4cdb721100a442c23e4c8f8.jpg",
    "womens-dresses":
      "https://i.pinimg.com/736x/67/3a/e5/673ae596d272dd6412c493bb6167d4bb.jpg",
  };

  return (
    imageMap[slug] ||
    "https://i.pinimg.com/1200x/ff/77/bb/ff77bb54104159804f94781b5da0e762.jpg"
  );
};

// Handle category selection - UPDATED
const handleCategoryClick = async (category: any) => {
  activeIndex.value = category.id;
  selectedCategoryName.value = category.name;
  await kidStore.applyFilters(currentFilters.value);
};

// In your kid page, update the quickView function:
const quickView = (productId: string | number) => {
  router.push({
    path: "/product-detail",
    query: { id: productId.toString() },
  });
};

// Optional: Add to Wishlist  function
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
        final_price: currentVariant.value.final_price || currentVariant.value.price,
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
          discount: currentProduct.value.discount
        }
      }
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

// Optional: Add to cart function
const addToCart = (variantId: string) => {
  const product = kids.value.find((item) =>
    item.variants?.some((v) => v.id === variantId)
  );

  if (!product) {
    console.warn("No product found for variant", variantId);
    return;
  }

  const variant = product.variants.find((v) => v.id === variantId);

  if (!variant) {
    console.warn("Variant not found", variantId);
    return;
  }

  currentProduct.value = product;
  currentVariant.value = variant;
  quantity.value = 1;

  handleAddToCart();
};

// Computed properties for active filters - UPDATED for single size selection
const activeFilters = computed(() => {
  const filters = [];

  // FIXED: Updated price range check to use API values
  if (priceRange.value[0] !== 0.03 || priceRange.value[1] !== 209.99) {
    filters.push({
      type: "price",
      label: `$${priceRange.value[0]} - $${priceRange.value[1]}`,
      value: priceRange.value,
    });
  }

  if (selected.value) {
    filters.push({
      type: "color",
      label: selected.value,
      value: selected.value,
    });
  }

  // UPDATED: Single size selection
  if (selectedSize.value) {
    const size = sizes.value?.find((s: Size) => s.id === selectedSize.value);
    if (size) {
      filters.push({
        type: "size",
        label: size.name.toUpperCase(),
        value: selectedSize.value,
      });
    }
  }

  if (selectedBrand.value) {
    const brand = brands.value?.find((b) => b.id === selectedBrand.value);
    if (brand) {
      filters.push({
        type: "brand",
        label: brand.name,
        value: brand.id,
      });
    }
  }

  return filters;
});

// Reset functions - UPDATED to apply filters
const resetPrice = async () => {
  priceRange.value = [0.03, 209.99]; // Updated to API values
  await kidStore.applyFilters(currentFilters.value);
};

const resetColor = async () => {
  selected.value = "";
  await kidStore.applyFilters(currentFilters.value);
};

const resetSizes = async () => {
  selectedSize.value = null; // Updated for single selection
  await kidStore.applyFilters(currentFilters.value);
};

const resetBrands = async () => {
  selectedBrand.value = null;
  await kidStore.applyFilters(currentFilters.value);
};

const clearAllFilters = async () => {
  priceRange.value = [0.03, 209.99];
  selected.value = "";
  selectedSize.value = null;
  selectedBrand.value = null;
  activeIndex.value = null;
  await kidStore.applyFilters({});
};

// Remove individual filter - UPDATED
const removeFilter = async (filter: any) => {
  switch (filter.type) {
    case "price":
      priceRange.value = [0.03, 209.99];
      break;
    case "color":
      selected.value = "";
      break;
    case "size":
      selectedSize.value = null; // Updated for single selection
      break;
    case "brand":
      if (selectedBrand.value === filter.value) {
        selectedBrand.value = null;
      }
      break;
  }
  await kidStore.applyFilters(currentFilters.value);
};

// Handle size selection - UPDATED: Single selection only
const selectSize = async (sizeId: string) => {
  selectedSize.value = selectedSize.value === sizeId ? null : sizeId;
  await kidStore.applyFilters(currentFilters.value);
};

// Handle brand selection
const toggleBrand = async (brandId: string) => {
  selectedBrand.value = selectedBrand.value === brandId ? null : brandId;
  await kidStore.applyFilters(currentFilters.value);
};

// Handle sort change
const handleSortChange = (value: string) => {
  if (!value) {
    applySorting("", "asc");
    return;
  }

  const [field, order] = value.split("_");
  const sortOrder = (order as "asc" | "desc") || "asc";
  applySorting(field, sortOrder);
};

// Apply sorting
const applySorting = async (
  sortField: string,
  order: "asc" | "desc" = "asc"
) => {
  const filtersWithSort = {
    ...currentFilters.value,
    sort_by: sortField,
    sort_order: order,
  };

  await kidStore.applyFilters(filtersWithSort);
};

// Handle pagination
const handlePageChange = async (newPage: number) => {
  page.value = newPage;
  await kidStore.setPage(newPage);
};

// Handle items per page change
const handleItemsPerPageChange = async (count: number | string) => {
  active.value = count;

  let perPage = 20; // default
  if (count === 10) perPage = 10;
  else if (count === 20) perPage = 20;
  else if (count === "all") perPage = kidStore.total || 1000; // Large number for "all"

  kidStore.perPage = perPage;

  const filtersWithPerPage = {
    ...currentFilters.value,
    per_page: perPage,
    page: 1, // Reset to first page
  };

  await kidStore.applyFilters(filtersWithPerPage);
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    brandStore.fetchBrands(),
    categoryStore.fetchCategories(),
    colorStore.fetchColors(),
    sizeStore.fetchSize(),
    topTrendingStore.fetchTopTrendings(),
  ]);

  // Initial fetch with no filters
  await kidStore.fetchKidItems;
});
</script>

<template>
  <div>
    <!-- Banner -->
    <div
      class="banner w-full flex flex-col justify-center items-center min-h-[300px] md:h-[400px] px-4"
    >
      <!-- Dynamic category name display -->
      <p
        class="text-white text-[24px] sm:text-[32px] md:text-[40px] font-medium"
      >
        {{ selectedCategoryName }}
      </p>

      <div class="mx-auto w-full max-w-screen-lg my-5">
        <v-slide-group class="bg-transparent">
          <v-slide-group-item
            v-for="category in categories"
            :key="category.id"
            v-slot="{ isSelected, toggle }"
          >
            <div
              class="flex flex-col justify-center items-center mr-3 sm:mr-5 cursor-pointer"
              @click="handleCategoryClick(category)"
            >
              <div
                :class="{
                  'border-[1px] border-white': activeIndex === category.id,
                  'rounded-full p-1': true,
                }"
              >
                <!-- Dynamic image based on category slug -->
                <img
                  :src="getCategoryImage(category.slug)"
                  class="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full border-white border-2 object-cover"
                  :alt="category.name"
                />
              </div>
              <p class="text-white mt-2 text-sm md:text-base">
                {{ category.name }}
              </p>
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </div>
    </div>

    <!-- Main Content -->
    <v-app>
      <!-- App Bar for mobile -->
      <v-app-bar app flat>
        <v-app-bar-nav-icon v-if="isMobile" @click="drawer = true" />
        <div v-if="isMobile">Responsive Layout</div>
      </v-app-bar>

      <!-- Large screen layout -->
      <template v-if="isLarge">
        <v-container fluid class="pa-0 mt-[60px]">
          <v-row no-gutters>
            <!-- Sidebar -->
            <v-col cols="4" class="pa-3 pl-12" style="min-height: 100vh">
              <!-- Price Filter - UPDATED range -->
              <div class="flex justify-between items-center border-b-2">
                <p class="uppercase font-bold text-[25px]">price</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                  @click="resetPrice"
                >
                  reset
                </v-btn>
              </div>
              <div class="my-10">
                <v-range-slider
                  v-model="priceRange"
                  :min="0.03"
                  :max="209.99"
                  :step="0.01"
                  color="red"
                  track-color="grey"
                  thumb-color="red"
                ></v-range-slider>
                <div class="mt-2 font-weight-medium">
                  <span class="text-gray-600 mr-2">Range :</span>
                  <span class="text-black font-weight-bold">
                    ${{ priceRange[0] }} - ${{ priceRange[1] }}
                  </span>
                </div>
              </div>

              <!-- Color Filter -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">colors</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                  @click="resetColor"
                >
                  reset
                </v-btn>
              </div>
              <v-sheet class="py-4 px-1">
                <v-responsive class="overflow-y-auto" max-height="280">
                  <v-chip-group v-model="selected" column mandatory>
                    <v-chip
                      v-for="color in colors"
                      :key="color.name"
                      :value="color.name"
                      class="ma-1"
                      :class="{ 'border-selected': selected === color.name }"
                      variant="outlined"
                    >
                      <div class="d-flex align-center">
                        <div
                          class="dot mr-2"
                          :style="{ backgroundColor: color.hex_code }"
                        ></div>
                        {{ color.name }}
                      </div>
                    </v-chip>
                  </v-chip-group>
                </v-responsive>
              </v-sheet>

              <!-- Size Filter - UPDATED for single selection -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">size</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                  @click="resetSizes"
                >
                  reset
                </v-btn>
              </div>
              <v-container>
                <v-row>
                  <v-col v-for="size in sizes" :key="size.id" cols="12" md="4">
                    <v-card
                      :class="[
                        'd-flex align-center',
                        selectedSize === size.id ? 'bg-primary' : '',
                      ]"
                      variant="outlined"
                      @click="selectSize(size.id)"
                    >
                      <div class="text-h3 flex-grow-1 text-center pa-5">
                        <p class="uppercase text-[20px]">{{ size.name }}</p>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>

              <!-- Brand Filter - Fixed to use brands from store -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">brands</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                  @click="resetBrands"
                >
                  reset
                </v-btn>
              </div>
              <v-container>
                <v-row v-if="brands">
                  <v-col
                    v-for="brand in brands"
                    :key="brand.id"
                    cols="12"
                    md="4"
                  >
                    <v-card
                      :class="[
                        'd-flex align-center justify-center',
                        selectedBrand === brand.id ? 'selected-card' : '',
                      ]"
                      @click="toggleBrand(brand.id)"
                    >
                      <div class="flex h-16 w-16 justify-center items-center">
                        <img
                          :src="brand.logo_url || '/brands/mable.png'"
                          :alt="brand.name"
                          class="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row v-else>
                  <v-col cols="12">
                    <p class="text-center text-gray-500">Loading brands...</p>
                  </v-col>
                </v-row>
              </v-container>

              <!-- Trending Products -->
              <div class="border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">TRENDING PRODUCTS</p>
              </div>
              <div
                v-for="topTrending in topTrendings"
                :key="topTrending.id"
                class="border-b-[1px] border-gray-400 pb-3 mb-3"
              >
                <v-card variant="text">
                  <div
                    v-for="variant in topTrending.variants"
                    :key="variant.id"
                    class="flex mb-4"
                  >
                    <div>
                      <img
                        :src="variant.image || '/images/daa.jpg'"
                        class="rounded"
                        width="100px"
                        alt="trending product"
                      />
                    </div>
                    <div class="ml-5 mt-2">
                      <!-- Star rating -->
                      <div class="flex items-end">
                        <Icon icon="noto:star" width="25" height="25" />
                        <div v-for="i in 4" :key="i">
                          <Icon
                            icon="uim:star"
                            class="!text-gray-400"
                            width="25"
                            height="25"
                          />
                        </div>
                        <p class="text-gray-500 text-[16px] ml-1">
                          ( {{ topTrending.reviews.length || 0 }} Reviews )
                        </p>
                      </div>

                      <!-- Item info -->
                      <p class="font-bold my-1 text-[20px]">
                        {{ topTrending.name }}
                      </p>
                      <p class="text-gray-600 text-[16px] mb-2">
                        Brand: {{ topTrending.brand.name }}
                      </p>

                      <!-- Price -->
                      <p class="text-blue-700 font-bold uppercase my-1">
                        ${{ variant.price }} USD
                      </p>

                      <!-- Popularity Score instead of discounted price -->
                      <div class="flex items-center my-2">
                        <p class="text-gray-500 text-[15px]">
                          Popularity Score:
                        </p>
                        <p class="text-red ml-2 text-[20px]">
                          {{ topTrending.popularity_score }}
                        </p>
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>
            </v-col>

            <!-- Main Content -->
            <v-col cols="8">
              <v-main class="pa-0">
                <v-container class="pa-0 pr-12">
                  <v-row>
                    <v-col>
                      <div class="pl-3">
                        <p>
                          Clothing ({{ kids?.length || 0 }}
                          items)
                        </p>
                        <div class="my-3 flex items-center flex-wrap">
                          <p class="text-[14px] mr-2 mb-2">SORT BY :</p>
                          <div
                            v-for="filter in activeFilters"
                            :key="`${filter.type}-${filter.value}`"
                            class="flex justify-center items-center p-1 mr-2 mb-2 border border-black"
                          >
                            <p class="text-[13px] mr-2">{{ filter.label }}</p>
                            <Icon
                              class="text-red cursor-pointer"
                              icon="ix:cancel"
                              width="15"
                              height="15"
                              @click="removeFilter(filter)"
                            />
                          </div>
                          <p
                            v-if="activeFilters.length > 0"
                            class="text-[13px] text-red underline cursor-pointer mb-2"
                            @click="clearAllFilters"
                          >
                            Clear All
                          </p>
                        </div>
                      </div>
                    </v-col>
                    <v-col>
                      <div
                        class="text-end flex justify-end items-center pr-5 mt-1"
                      >
                        <div class="flex border-[2px] p-1 mr-3">
                          <p
                            :class="[
                              'border-r-[2px] pr-2 cursor-pointer',
                              active === 10 ? 'text-red-500' : '',
                            ]"
                            @click="handleItemsPerPageChange(10)"
                          >
                            10
                          </p>
                          <p
                            :class="[
                              'border-r-[2px] px-2 cursor-pointer',
                              active === 20 ? 'text-red-500' : '',
                            ]"
                            @click="handleItemsPerPageChange(20)"
                          >
                            20
                          </p>
                          <p
                            :class="[
                              'uppercase px-2 cursor-pointer',
                              active === 'all' ? 'text-red-500' : '',
                            ]"
                            @click="handleItemsPerPageChange('all')"
                          >
                            all
                          </p>
                        </div>
                        <div>
                          <v-select
                            v-model="sortSelection"
                            label="Sort By"
                            class="w-44"
                            :items="[
                              { title: 'Default sorting', value: '' },
                              {
                                title: 'Sort by latest',
                                value: 'created_at_desc',
                              },
                              {
                                title: 'Price: High to Low',
                                value: 'price_desc',
                              },
                              {
                                title: 'Price: Low to High',
                                value: 'price_asc',
                              },
                              { title: 'Name: A to Z', value: 'name_asc' },
                              { title: 'Name: Z to A', value: 'name_desc' },
                            ]"
                            variant="underlined"
                            @update:model-value="handleSortChange"
                          ></v-select>
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Products Grid -->
                  <div class="d-flex flex-wrap">
                    <!-- Loading skeleton -->
                    <div v-if="kidStore.isLoading" class="w-full">
                      <v-row>
                        <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="3">
                          <v-skeleton-loader
                            type="card"
                            height="400"
                          ></v-skeleton-loader>
                        </v-col>
                      </v-row>
                    </div>

                    <!-- No items found -->
                    <div
                      v-else-if="!kidStore.hasItems && !kidStore.isLoading"
                      class="w-full text-center py-8"
                    >
                      <v-icon
                        icon="mdi-package-variant"
                        size="64"
                        class="text-gray-400 mb-4"
                      ></v-icon>
                      <h3 class="text-xl font-medium text-gray-600 mb-2">
                        No products found
                      </h3>
                      <p class="text-gray-500">
                        Try adjusting your filters or search criteria.
                      </p>
                      <v-btn
                        color="primary"
                        class="mt-4"
                        @click="clearAllFilters"
                      >
                        Clear All Filters
                      </v-btn>
                    </div>

                    <!-- Products -->
                    <v-card
                      v-else
                      v-for="kidItem in kids"
                      :key="kidItem.id"
                      class="relative w-[280px] mr-5"
                      variant="text"
                    >
                      <v-hover v-slot="{ isHovering, props }">
                        <div
                          v-bind="props"
                          class="relative w-full cursor-pointer"
                        >
                          <!-- Product Image -->
                          <img
                            :src="
                              kidItem.variants[0].image ||
                              'https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg'
                            "
                            :alt="kidItem.name"
                            class="w-full cursor-pointer h-[400px] object-cover"
                            @click="quickView(kidItem.id)"
                          />

                          <!-- Animated Buttons on Hover (narrow wrapper for better positioning) -->
                          <div
                            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6"
                          >
                            <!-- Favorite (slide from left) -->
                            <transition name="slide-left">
                              <div v-if="isHovering">
                                <v-tooltip text="Add to Wishlist ">
                                  <template #activator="{ props }">
                                    <v-btn
                                      v-bind="props"
                                      @click.stop="
                                        handleAddToWishlist(
                                          kidItem.variants[0]
                                        )
                                      "
                                      icon
                                      :class="
                                        favoriteVariants.has(
                                          kidItem.variants[0].id
                                        )
                                          ? 'text-red'
                                          : 'bg-white text-black'
                                      "
                                    >
                                      <v-icon
                                        :icon="
                                          favoriteVariants.has(
                                            kidItem.variants[0].id
                                          )
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
                                      icon
                                      class="bg-white text-black"
                                      @click.stop="quickView(kidItem.id)"
                                    >
                                      <v-icon icon="carbon:image-copy" />
                                    </v-btn>
                                  </template>
                                </v-tooltip>
                              </div>
                            </transition>

                            <!-- Add to Cart (slide from right) -->
                            <transition name="slide-right">
                              <div v-if="isHovering">
                                <v-tooltip text="Add to Cart">
                                  <template #activator="{ props }">
                                    <v-btn
                                      v-bind="props"
                                      icon
                                      class="bg-white text-black"
                                      @click="addToCart(kidItem.variants[0].id)"
                                    >
                                      <v-icon icon="pepicons-pencil:cart" />
                                    </v-btn>
                                  </template>
                                </v-tooltip>
                              </div>
                            </transition>
                          </div>
                        </div>
                      </v-hover>

                      <!-- Product Info -->
                      <div class="text-center my-5">
                        <p
                          class="font-bold text-[20px] cursor-pointer hover:text-blue-500 transition-colors"
                          @click="quickView(kidItem.id)"
                        >
                          {{ kidItem.name }}
                        </p>
                        <p class="text-blue-700 font-bold uppercase my-1">
                          {{ kidItem.brand.name }}
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
                            ${{ kidItem.variants[0].final_price }} USD
                          </p>
                          <p class="line-through text-gray-500">
                            ${{ kidItem.variants[0].price }} USD
                          </p>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </v-container>
              </v-main>

              <!-- Pagination -->
              <div class="text-center">
                <v-container>
                  <v-row justify="center">
                    <v-col cols="8">
                      <v-container class="max-width">
                        <v-pagination
                          :model-value="kidStore.page"
                          :length="kidStore.totalPages"
                          rounded="circle"
                          class="my-4"
                          @update:model-value="handlePageChange"
                        ></v-pagination>
                      </v-container>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </template>

      <!-- Mobile layout -->
      <template v-else>
        <!-- Navigation Drawer -->
        <v-navigation-drawer v-model="drawer" temporary app>
          <v-container>
            <div class="pa-4" style="min-height: 100vh">
              <!-- Mobile filter content (same as desktop but in drawer) -->
              <!-- Price Filter -->
              <div class="flex justify-between items-center border-b-2">
                <p class="uppercase font-bold text-[25px]">price</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                  @click="resetPrice"
                >
                  reset
                </v-btn>
              </div>
              <div class="my-10">
                <v-range-slider
                  v-model="priceRange"
                  :min="0.03"
                  :max="209.99"
                  :step="0.01"
                  color="red"
                  track-color="grey"
                  thumb-color="red"
                ></v-range-slider>
                <div class="mt-2 font-weight-medium">
                  <span class="text-gray-600 mr-2">Range :</span>
                  <span class="text-black font-weight-bold">
                    ${{ priceRange[0] }} - ${{ priceRange[1] }}
                  </span>
                </div>
              </div>

              <!-- Color Filter for Mobile -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">colors</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                  @click="resetColor"
                >
                  reset
                </v-btn>
              </div>
              <v-sheet class="py-4 px-1">
                <v-responsive class="overflow-y-auto" max-height="280">
                  <v-chip-group v-model="selected" column mandatory>
                    <v-chip
                      v-for="color in colors"
                      :key="color.name"
                      :value="color.name"
                      class="ma-1"
                      :class="{ 'border-selected': selected === color.name }"
                      variant="outlined"
                    >
                      <div class="d-flex align-center">
                        <div
                          class="dot mr-2"
                          :style="{ backgroundColor: color.hex_code }"
                        ></div>
                        {{ color.name }}
                      </div>
                    </v-chip>
                  </v-chip-group>
                </v-responsive>
              </v-sheet>

              <!-- Size Filter for Mobile -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">size</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                  @click="resetSizes"
                >
                  reset
                </v-btn>
              </div>
              <v-container>
                <v-row>
                  <v-col v-for="size in sizes" :key="size.id" cols="12" md="6">
                    <v-card
                      :class="[
                        'd-flex align-center',
                        selectedSize === size.id ? 'bg-primary' : '',
                      ]"
                      variant="outlined"
                      @click="selectSize(size.id)"
                    >
                      <div class="text-h3 flex-grow-1 text-center pa-3">
                        <p class="uppercase text-[16px]">{{ size.name }}</p>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>

              <!-- Brand Filter for Mobile -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">brands</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                  @click="resetBrands"
                >
                  reset
                </v-btn>
              </div>
              <v-container>
                <v-row v-if="brands">
                  <v-col
                    v-for="brand in brands"
                    :key="brand.id"
                    cols="6"
                    md="4"
                  >
                    <v-card
                      :class="[
                        'd-flex align-center justify-center',
                        selectedBrand === brand.id ? 'selected-card' : '',
                      ]"
                      @click="toggleBrand(brand.id)"
                    >
                      <div class="flex h-12 w-12 justify-center items-center">
                        <img
                          :src="brand.logo_url || '/brands/mable.png'"
                          :alt="brand.name"
                          class="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </div>
          </v-container>
        </v-navigation-drawer>

        <v-main>
          <v-container>
            <div class="pl-3">
              <p>Clothing ({{ kids?.length || 0 }} items)</p>
              <div class="my-3 flex items-center flex-wrap">
                <p class="text-[14px] mr-2 mb-2">FILTERS :</p>
                <div
                  v-for="filter in activeFilters"
                  :key="`${filter.type}-${filter.value}`"
                  class="flex justify-center items-center p-1 mr-2 mb-2 border border-black"
                >
                  <p class="text-[13px] mr-2">{{ filter.label }}</p>
                  <Icon
                    class="text-red cursor-pointer"
                    icon="ix:cancel"
                    width="15"
                    height="15"
                    @click="removeFilter(filter)"
                  />
                </div>
                <p
                  v-if="activeFilters.length > 0"
                  class="text-[13px] text-red underline cursor-pointer mb-2"
                  @click="clearAllFilters"
                >
                  Clear All
                </p>
              </div>

              <!-- Mobile sorting -->
              <div class="my-4">
                <v-select
                  v-model="sortSelection"
                  label="Sort By"
                  :items="[
                    { title: 'Default sorting', value: '' },
                    { title: 'Sort by latest', value: 'created_at_desc' },
                    { title: 'Price: High to Low', value: 'price_desc' },
                    { title: 'Price: Low to High', value: 'price_asc' },
                    { title: 'Name: A to Z', value: 'name_asc' },
                    { title: 'Name: Z to A', value: 'name_desc' },
                  ]"
                  variant="outlined"
                  @update:model-value="handleSortChange"
                ></v-select>
              </div>
            </div>

            <!-- Mobile Products Grid -->
            <div class="d-flex flex-wrap justify-center">
              <!-- Loading skeleton for mobile -->
              <div v-if="kidStore.isLoading" class="w-full">
                <v-row>
                  <v-col v-for="n in 6" :key="n" cols="6">
                    <v-skeleton-loader
                      type="card"
                      height="300"
                    ></v-skeleton-loader>
                  </v-col>
                </v-row>
              </div>

              <!-- No items found for mobile -->
              <div
                v-else-if="!kidStore.hasItems && !kidStore.isLoading"
                class="w-full text-center py-8"
              >
                <v-icon
                  icon="mdi-package-variant"
                  size="48"
                  class="text-gray-400 mb-4"
                ></v-icon>
                <h3 class="text-lg font-medium text-gray-600 mb-2">
                  No products found
                </h3>
                <p class="text-gray-500 text-sm">Try adjusting your filters.</p>
                <v-btn
                  color="primary"
                  size="small"
                  class="mt-4"
                  @click="clearAllFilters"
                >
                  Clear Filters
                </v-btn>
              </div>

              <!-- Mobile Products -->
              <v-card
                v-else
                v-for="kidItem in kids"
                :key="kidItem.id"
                class="ma-2 w-[160px] sm:w-[180px]"
                variant="text"
              >
                <!-- Mobile product content -->
                <div v-if="kidItem.variants && kidItem.variants.length > 0">
                  <v-hover v-slot="{ isHovering, props }">
                    <div v-bind="props" class="relative w-full cursor-pointer">
                      <!-- Product Image -->
                      <img
                        :src="
                          kidItem.variants[0].image ||
                          'https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg'
                        "
                        :alt="kidItem.name"
                        class="w-full h-[200px] sm:h-[250px] cursor-pointer object-cover"
                        @click="quickView(kidItem.id)"
                      />

                      <!-- Animated Buttons on Hover for Mobile -->
                      <div
                        class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2"
                      >
                        <!-- Favorite (slide from left) -->
                        <transition name="slide-left">
                          <div v-if="isHovering">
                            <v-tooltip text="Add to Wishlist ">
                              <template #activator="{ props }">
                                <v-btn
                                  v-bind="props"
                                  @click.stop="
                                    handleAddToWishlist(kidItem.variants[0])
                                  "
                                  icon
                                  :class="
                                    favoriteVariants.has(kidItem.variants[0].id)
                                      ? 'text-red'
                                      : 'bg-white text-black'
                                  "
                                >
                                  <v-icon
                                    :icon="
                                      favoriteVariants.has(
                                        kidItem.variants[0].id
                                      )
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
                                  icon
                                  size="small"
                                  class="bg-white text-black"
                                  @click.stop="quickView(kidItem.id)"
                                >
                                  <v-icon icon="carbon:image-copy" size="16" />
                                </v-btn>
                              </template>
                            </v-tooltip>
                          </div>
                        </transition>

                        <!-- Add to Cart (slide from right) -->
                        <transition name="slide-right">
                          <div v-if="isHovering">
                            <v-tooltip text="Add to Cart">
                              <template #activator="{ props }">
                                <v-btn
                                  v-bind="props"
                                  icon
                                  size="small"
                                  class="bg-white text-black"
                                  @click="addToCart(kidItem.variants[0].id)"
                                >
                                  <v-icon
                                    icon="pepicons-pencil:cart"
                                    size="16"
                                  />
                                </v-btn>
                              </template>
                            </v-tooltip>
                          </div>
                        </transition>
                      </div>
                    </div>
                  </v-hover>

                  <!-- Product Info -->
                  <div class="text-center my-3">
                    <p
                      class="font-bold text-[14px] sm:text-[16px] cursor-pointer hover:text-blue-500 transition-colors line-clamp-2"
                      @click="quickView(kidItem.id)"
                    >
                      {{ kidItem.name }}
                    </p>
                    <p
                      class="text-blue-700 font-bold uppercase my-1 text-[12px]"
                    >
                      {{ kidItem.brand.name }}
                    </p>
                    <div class="d-flex justify-center mb-2">
                      <Icon icon="noto:star" width="16" height="16" />
                      <div v-for="i in 4" :key="i">
                        <Icon
                          icon="uim:star"
                          class="!text-gray-400"
                          width="16"
                          height="16"
                        />
                      </div>
                    </div>
                    <div class="flex justify-center items-center">
                      <p class="text-red mr-1 text-[14px] font-bold">
                        ${{ kidItem.variants[0].final_price }}
                      </p>
                      <p class="line-through text-gray-500 text-[12px]">
                        ${{ kidItem.variants[0].price }}
                      </p>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>

            <!-- Mobile Pagination -->
            <div class="text-center mt-6">
              <v-pagination
                :model-value="kidStore.page"
                :length="kidStore.totalPages"
                rounded="circle"
                class="my-4"
                total-visible="5"
                @update:model-value="handlePageChange"
              ></v-pagination>
            </div>
          </v-container>
        </v-main>
      </template>
    </v-app>

    <!-- Global snackbar for cart operations -->
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
  </div>
</template>

<style scoped>
.banner {
  background-image: url(/public/banners/banner-bag.png);
  background-position: left bottom;
  background-size: cover;
}

.dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
}

.border-selected {
  border: 2px solid blue !important;
}

.selected-card {
  border: 2px solid #1976d2 !important;
  background-color: transparent !important;
}

.line-clamp-2 {
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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
