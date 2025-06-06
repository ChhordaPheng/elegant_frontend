<script setup lang="ts">
definePageMeta({
  layout: "shop",
});
import { useDisplay } from "vuetify";
const activeIndex = ref<number | null>(null);
const drawer = ref<boolean>(false);
const { mdAndDown, lgAndUp } = useDisplay();
// Consider anything md and down as mobile
const isMobile = computed(() => mdAndDown.value);
const isLarge = computed(() => lgAndUp.value);
const priceRange = ref([50, 120]);
const selected = ref("Blue");
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
  {
    id: 1,
    name: "xs",
  },
  {
    id: 2,
    name: "s",
  },
  {
    id: 3,
    name: "m",
  },
  {
    id: 4,
    name: "l",
  },
  {
    id: 5,
    name: "xl",
  },
  {
    id: 6,
    name: "2xl",
  },
];
const brands = [
  {
    id: 1,
    image: "/brands/inamore.png",
  },
  {
    id: 2,
    image: "/brands/mable.png",
  },
  {
    id: 3,
    image: "/brands/ruelala.png",
  },
  {
    id: 4,
    image: "/brands/SMKFLWR.webp",
  },
  {
    id: 5,
    image: "/brands/zara.webp",
  },
];
</script>
<template>
  <div>
    <Header />

    <!-- banner  -->
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
                  alt="da"
                />
              </div>
              <p class="text-white mt-3">Shoes</p>
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </div>
    </div>

    <!-- filter  -->
    <v-app>
      <!-- App Bar -->
      <v-app-bar app flat>
        <v-app-bar-nav-icon v-if="isMobile" @click="drawer = true" />
        <div v-if="isMobile">Responsive Layout</div>
      </v-app-bar>

      <!-- Large screen layout -->
      <template v-if="isLarge">
        <v-container fluid class="pa-0 mt-[60px]">
          <v-row no-gutters class="">
            <!-- Sidebar -->
            <v-col cols="4" class="pa-4" style="min-height: 100vh">
              <!-- price  -->
              <div class="flex justify-between items-center border-b-2">
                <p class="uppercase font-bold text-[25px]">price</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
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
                  <span class="text-black font-weight-bold"
                    >{{ priceRange[0] }}$ - {{ priceRange[1] }}$</span
                  >
                </div>
              </div>
              <!-- color  -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">colors</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
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
              <!-- size  -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">sizes</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                >
                  reset
                </v-btn>
              </div>
              <v-item-group selected-class="bg-primary">
                <v-container>
                  <v-row>
                    <v-col
                      v-for="size in sizes"
                      :key="size.id"
                      cols="12"
                      md="4"
                    >
                      <v-item v-slot="{ isSelected, selectedClass, toggle }">
                        <v-card
                          :class="['d-flex align-center', selectedClass]"
                          variant="outlined"
                          @click="toggle"
                        >
                          <div class="text-h3 flex-grow-1 text-center pa-5">
                            <p class="uppercase text-[20px]">{{ size.name }}</p>
                          </div>
                        </v-card>
                      </v-item>
                    </v-col>
                  </v-row>
                </v-container>
              </v-item-group>
              <!-- brand  -->
              <div class="flex justify-between items-center border-b-2 my-5">
                <p class="uppercase font-bold text-[25px]">brands</p>
                <v-btn
                  variant="text"
                  class="uppercase !font-bold text-[15px] text-gray-500"
                >
                  reset
                </v-btn>
              </div>
              <v-item-group selected-class="selected-card">
                <v-container>
                  <v-row>
                    <v-col
                      v-for="brand in brands"
                      :key="brand.id"
                      cols="12"
                      md="4"
                    >
                      <v-item v-slot="{ isSelected, selectedClass, toggle }">
                        <v-card
                          :class="[
                            'd-flex align-center justify-center',
                            selectedClass,
                          ]"
                          variant="outlined"
                          @click="toggle"
                        >
                          <div
                            class="flex h-16 w-16 justify-center items-center"
                          >
                            <img :src="brand.image" :alt="brand.image" />
                          </div>
                        </v-card>
                      </v-item>
                    </v-col>
                  </v-row>
                </v-container>
              </v-item-group>
              <!-- trending  -->
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
                        alt=""
                      />
                    </div>
                    <div class="ml-5 mt-2">
                      <div class="d-flex items-end">
                        <Icon icon="noto:star" width="25" height="25" />
                        <div class="" v-for="i in 4" :key="i">
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
              <v-main>
                <v-container>
                  <div class="d-flex flex-wrap ">
                    <v-card v-for="n in 5" :key="n" class="ma-4 w-64" variant="text">
                      <div class="relative flex justify-center items-center">
                        <div
                          class="absolute w-[60%] h-[80%] top-20 flex items-end justify-evenly p-2"
                        >
                          <v-tooltip text="Add to Favorites">
                            <template v-slot:activator="{ props }">
                              <v-btn v-bind="props" icon="mynaui:heart"></v-btn>
                            </template>
                          </v-tooltip>
                          <v-tooltip text="Add to Cart">
                            <template v-slot:activator="{ props }">
                              <v-btn
                                v-bind="props"
                                icon="pepicons-pencil:cart"
                              ></v-btn>
                            </template>
                          </v-tooltip>
                          <v-tooltip text="Quick View">
                            <template v-slot:activator="{ props }">
                              <v-btn
                                v-bind="props"
                                icon="carbon:image-copy"
                              ></v-btn>
                            </template>
                          </v-tooltip>
                        </div>
                        <img src="/images/da.jpg" width="360" alt="" />
                      </div>
                      <div class="text-center my-5">
                        <p class="font-bold text-[20px]">White Shirt</p>
                        <p class="text-blue-700 font-bold uppercase my-1">
                          Zara
                        </p>
                        <div class="d-flex justify-center">
                          <Icon icon="noto:star" width="20" height="20" />
                          <div class="" v-for="i in 4" :key="i">
                            <Icon
                              icon="uim:star"
                              class="!text-gray-400"
                              width="20"
                              height="20"
                            />
                          </div>
                        </div>
                        <div class="flex justify-center items-center mt-2">
                          <p class="text-red mr-2">$60.00 USD</p>
                          <p class="line-through text-gray-500">$70.00 USD</p>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </v-container>
              </v-main>
            </v-col>
          </v-row>
        </v-container>
      </template>

      <!-- Mobile layout -->
      <template v-else>
        <!-- Navigation Drawer -->
        <v-navigation-drawer v-model="drawer" temporary app>
          <v-container>
            <div class="d-flex justify-space-between">
              <p class="text-h6">emm</p>
              <p class="text-h6">emm</p>
            </div>
          </v-container>
        </v-navigation-drawer>

        <v-main>
          <v-container>
            <h1>Welcome to My App</h1>
            <p>The sidebar is toggleable on mobile.</p>
          </v-container>
        </v-main>
      </template>
    </v-app>
    <Footer />
  </div>
</template>

<style scoped>
.banner {
  background-image: url(/public/banners/banner-bag.png);
  background-position: left bottom left;
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
