<script setup lang="ts">
definePageMeta({
  layout: "main-layout",
});

import { useDisplay } from "vuetify";

// Reactive variables
const activeIndex = ref<number | null>(null);
const drawer = ref<boolean>(false);
const { mdAndDown, lgAndUp } = useDisplay();
const active = ref<number | string>(20);
const page = ref<number>(1);

// Consider anything md and down as mobile
const isMobile = computed(() => mdAndDown.value);
const isLarge = computed(() => lgAndUp.value);

// Filter states
const priceRange = ref([50, 120]);
const selected = ref("Blue");
const selectedSizes = ref<number[]>([]);
const selectedBrands = ref<number[]>([]);

// Store
const womanStore = useWomanIteStore();
const womanItems = storeToRefs(womanStore);

// Static data
const colors = [
  { name: "Blue", hex: "#2D5BFF" },
  { name: "Grey", hex: "#B0B0B0" },
  { name: "Red", hex: "#FF1E1E" },
  { name: "Green", hex: "#00FF5A" },
  { name: "Yellow", hex: "#FFD600" },
  { name: "Pink", hex: "#FF2FF0" },
  { name: "Brown", hex: "#963D36" },
  { name: "White", hex: "#FFFFFF" },
];

const sizes = [
  { id: 1, name: "xs" },
  { id: 2, name: "s" },
  { id: 3, name: "m" },
  { id: 4, name: "l" },
  { id: 5, name: "xl" },
  { id: 6, name: "2xl" },
];

const brands = [
  { id: 1, name: "Inamore", image: "/brands/inamore.png" },
  { id: 2, name: "Mable", image: "/brands/mable.png" },
  { id: 3, name: "Ruelala", image: "/brands/ruelala.png" },
  { id: 4, name: "SMKFLWR", image: "/brands/SMKFLWR.webp" },
  { id: 5, name: "Zara", image: "/brands/zara.webp" },
];

// Computed properties for active filters
const activeFilters = computed(() => {
  const filters = [];

  // Price filter
  if (priceRange.value[0] !== 0 || priceRange.value[1] !== 200) {
    filters.push({
      type: "price",
      label: `$${priceRange.value[0]} - $${priceRange.value[1]}`,
      value: priceRange.value,
    });
  }

  // Color filter
  if (selected.value) {
    filters.push({
      type: "color",
      label: selected.value,
      value: selected.value,
    });
  }

  // Size filters
  selectedSizes.value.forEach((sizeId) => {
    const size = sizes.find((s) => s.id === sizeId);
    if (size) {
      filters.push({
        type: "size",
        label: size.name.toUpperCase(),
        value: sizeId,
      });
    }
  });

  // Brand filters
  selectedBrands.value.forEach((brandId) => {
    const brand = brands.find((b) => b.id === brandId);
    if (brand) {
      filters.push({
        type: "brand",
        label: brand.name,
        value: brandId,
      });
    }
  });

  return filters;
});

// Reset functions
const resetPrice = () => {
  priceRange.value = [0, 200];
};

const resetColor = () => {
  selected.value = "";
};

const resetSizes = () => {
  selectedSizes.value = [];
};

const resetBrands = () => {
  selectedBrands.value = [];
};

const clearAllFilters = () => {
  resetPrice();
  resetColor();
  resetSizes();
  resetBrands();
};

// Remove individual filter
const removeFilter = (filter: any) => {
  switch (filter.type) {
    case "price":
      resetPrice();
      break;
    case "color":
      resetColor();
      break;
    case "size":
      selectedSizes.value = selectedSizes.value.filter(
        (id) => id !== filter.value
      );
      break;
    case "brand":
      selectedBrands.value = selectedBrands.value.filter(
        (id) => id !== filter.value
      );
      break;
  }
};

// Handle size selection
const toggleSize = (sizeId: number) => {
  const index = selectedSizes.value.indexOf(sizeId);
  if (index > -1) {
    selectedSizes.value.splice(index, 1);
  } else {
    selectedSizes.value.push(sizeId);
  }
};

// Handle brand selection
const toggleBrand = (brandId: number) => {
  const index = selectedBrands.value.indexOf(brandId);
  if (index > -1) {
    selectedBrands.value.splice(index, 1);
  } else {
    selectedBrands.value.push(brandId);
  }
};

// Lifecycle
onMounted(async () => {
  await womanStore.fetchWomanItems();
});
</script>

<template>
  <div>
    <!-- Banner -->
    <div
      class="banner w-100 d-flex flex-col justify-center items-center h-[400px]"
    >
      <p class="text-white text-[40px] font-medium">Clothes</p>
      <div class="mx-auto max-w-screen-lg my-5">
        <v-slide-group class="bg-transparent">
          <v-slide-group-item
            v-for="n in 25"
            :key="n"
            v-slot="{ isSelected, toggle }"
          >
            <div
              class="flex flex-col justify-center items-center mr-5"
              @click="activeIndex = n"
            >
              <div
                :class="{
                  'border-[1px] border-white': activeIndex === n,
                  'rounded-full p-1': true,
                }"
              >
                <img
                  src="/images/daa.jpg"
                  class="w-40 rounded-full border-white border-2"
                  alt="category"
                />
              </div>
              <p class="text-white mt-3">Shoes</p>
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
                  :min="0"
                  :max="200"
                  step="1"
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
                          :style="{ backgroundColor: color.hex }"
                        ></div>
                        {{ color.name }}
                      </div>
                    </v-chip>
                  </v-chip-group>
                </v-responsive>
              </v-sheet>

              <!-- Size Filter -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">sizes</p>
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
                        selectedSizes.includes(size.id) ? 'bg-primary' : '',
                      ]"
                      variant="outlined"
                      @click="toggleSize(size.id)"
                    >
                      <div class="text-h3 flex-grow-1 text-center pa-5">
                        <p class="uppercase text-[20px]">{{ size.name }}</p>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>

              <!-- Brand Filter -->
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
                <v-row>
                  <v-col
                    v-for="brand in brands"
                    :key="brand.id"
                    cols="12"
                    md="4"
                  >
                    <v-card
                      :class="[
                        'd-flex align-center justify-center',
                        selectedBrands.includes(brand.id)
                          ? 'selected-card'
                          : '',
                      ]"
                      variant="outlined"
                      @click="toggleBrand(brand.id)"
                    >
                      <div class="flex h-16 w-16 justify-center items-center">
                        <img :src="brand.image" :alt="brand.name" />
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>

              <!-- Trending Products -->
              <div class="border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">TRENDING PRODUCTS</p>
              </div>
              <div
                v-for="n in 3"
                :key="n"
                class="border-b-[1px] border-gray-400 pb-3 mb-3"
              >
                <v-card variant="text">
                  <div class="flex">
                    <div>
                      <img
                        src="/images/daa.jpg"
                        class="rounded"
                        width="150px"
                        alt="trending product"
                      />
                    </div>
                    <div class="ml-5 mt-2">
                      <div class="d-flex items-end">
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
                          ( 0 Reviews )
                        </p>
                      </div>
                      <p class="font-bold my-3 text-[20px]">White Shirt</p>
                      <p class="text-blue-700 font-bold uppercase my-1">Zara</p>
                      <div class="flex item-center my-3">
                        <p class="line-through text-gray-500 text-[15px]">
                          $70.00 USD
                        </p>
                        <p class="text-red ml-2 text-[20px]">$60.00 USD</p>
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
                          Clothing ({{
                            womanItems.items.value?.length || 0
                          }}
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
                            @click="active = 10"
                          >
                            10
                          </p>
                          <p
                            :class="[
                              'border-r-[2px] px-2 cursor-pointer',
                              active === 20 ? 'text-red-500' : '',
                            ]"
                            @click="active = 20"
                          >
                            20
                          </p>
                          <p
                            :class="[
                              'uppercase px-2 cursor-pointer',
                              active === 'all' ? 'text-red-500' : '',
                            ]"
                            @click="active = 'all'"
                          >
                            all
                          </p>
                        </div>
                        <div>
                          <v-select
                            label="Select"
                            class="w-44"
                            :items="[
                              'Default shorting',
                              'Short by latest',
                              'Short by : hight to low',
                              'Short by : low to hight',
                              'Short by season',
                            ]"
                            variant="underlined"
                          ></v-select>
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Products Grid -->
                  <div class="d-flex flex-wrap">
                    <v-card
                      v-for="womanitem in womanItems.items.value"
                      :key="womanitem.id"
                      class="ma-4 w-[280px]"
                      variant="text"
                    >
                      <div
                        v-if="
                          womanitem.variants && womanitem.variants.length > 0
                        "
                      >
                        <!-- Make this the group -->
                        <div class="relative w-fit group">
                          <!-- Image -->
                          <img
                            src="https://i.pinimg.com/736x/16/2c/0c/162c0ce5a325eb96b05aa19fba013427.jpg"
                            :alt="womanitem.name"
                            class="w-full h-auto"
                          />
                          <!-- <img
                            :src="womanitem.variants[0]?.image"
                            :alt="womanitem.name"
                            class="w-full h-auto"
                          /> -->
                          <!-- Buttons Container -->
                          <div class="absolute top-3 right-2 text-center">
                            <p
                              class="bg-red px-4 rounded text-[13px] mb-2 text-white"
                            >
                              New
                            </p>
                            <p
                              class="bg-orange text-white rounded text-[13px] mb-2 px-2"
                            >
                              Hot
                            </p>
                            <p
                              v-if="womanitem.variants[0]?.discount"
                              class="bg-red text-white rounded text-[13px] px-2"
                            >
                              -{{ womanitem.variants[0].discount?.value }}% OFF
                            </p>
                          </div>

                          <!-- Action Buttons -->
                          <div
                            class="absolute inset-0 flex items-end justify-between p-4 w-[65%] mx-auto"
                          >
                            <v-tooltip text="Add to Favorites" location="top">
                              <template v-slot:activator="{ props }">
                                <v-btn
                                  v-bind="props"
                                  icon="mynaui:heart"
                                  size="small"
                                ></v-btn>
                              </template>
                            </v-tooltip>

                            <v-tooltip text="Add to Cart" location="top">
                              <template v-slot:activator="{ props }">
                                <v-btn
                                  v-bind="props"
                                  icon="pepicons-pencil:cart"
                                  size="small"
                                ></v-btn>
                              </template>
                            </v-tooltip>

                            <v-tooltip text="Quick View" location="top">
                              <template v-slot:activator="{ props }">
                                <v-btn
                                  v-bind="props"
                                  icon="carbon:image-copy"
                                  size="small"
                                ></v-btn>
                              </template>
                            </v-tooltip>
                          </div>
                        </div>

                        <!-- Card Content -->
                        <div class="text-center my-5">
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
                            <p class="text-gray-500 text-[14px] pl-1 mb-3">
                              ( 1 Review )
                            </p>
                          </div>
                          <p class="font-bold text-[20px]">
                            {{ womanitem.name }}
                          </p>
                          <p class="text-blue-700 font-bold uppercase my-1">
                            {{ womanitem.brand?.name }}
                          </p>
                          <div class="flex justify-center items-center mt-2">
                            <p class="text-red mr-2">
                              ${{
                                womanitem.variants[0]?.final_price?.toFixed(2)
                              }}
                              USD
                            </p>
                            <p class="line-through text-gray-500">
                              ${{
                                parseFloat(
                                  womanitem.variants[0]?.price || "0"
                                ).toFixed(2)
                              }}
                              USD
                            </p>
                          </div>
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
                          v-model="page"
                          :length="10"
                          rounded="circle"
                          class="my-4"
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
                  :min="0"
                  :max="200"
                  step="1"
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

              <!-- Other mobile filters would go here... -->
            </div>
          </v-container>
        </v-navigation-drawer>

        <v-main>
          <v-container>
            <div class="pl-3">
              <p>Clothing ({{ womanItems.items.value?.length || 0 }} items)</p>
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

            <!-- Mobile Products Grid -->
            <div class="d-flex flex-wrap justify-center">
              <v-card
                v-for="womanitem in womanItems.items.value"
                :key="womanitem.id"
                class="ma-2 w-[280px]"
                variant="text"
              >
                <!-- Mobile product content (same structure as desktop) -->
                <div v-if="womanitem.variants && womanitem.variants.length > 0">
                  <div class="relative w-fit group">
                    <img
                      :src="womanitem.variants[0]?.image"
                      :alt="womanitem.name"
                      class="w-full h-auto"
                    />
                    <!-- Mobile product details -->
                    <div class="text-center my-3">
                      <p class="font-bold text-[18px]">{{ womanitem.name }}</p>
                      <p class="text-blue-700 font-bold uppercase my-1">
                        {{ womanitem.brand?.name }}
                      </p>
                      <div class="flex justify-center items-center mt-2">
                        <p class="text-red mr-2">
                          ${{
                            womanitem.variants[0]?.final_price?.toFixed(2)
                          }}
                          USD
                        </p>
                        <p class="line-through text-gray-500">
                          ${{
                            parseFloat(
                              womanitem.variants[0]?.price || "0"
                            ).toFixed(2)
                          }}
                          USD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
          </v-container>
        </v-main>
      </template>
    </v-app>
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
</style>
