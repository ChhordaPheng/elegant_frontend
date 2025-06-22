<script setup lang="ts">
definePageMeta({
  layout: "main-layout",
});
const quantity = ref<number>(1);
const isLiked = ref<boolean>(true);
const tab = ref<string>("review");
const colors = ["green", "purple", "orange", "indigo", "red"];
const rating = ref(4.5);

function increase() {
  quantity.value++;
}

function decrease() {
  if (quantity.value > 1) quantity.value--;
}

const banners = ref([
  {
    id: 1,
    img: "images/da.jpg",
  },
  {
    id: 2,
    img: "images/da.jpg",
  },
  {
    id: 3,
    img: "images/da.jpg",
  },
]);

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
</script>
<template>
  <div class="">
    <v-container fluid>
      <v-container max-width="1400px">
        <v-row>
          <!-- left  -->
          <v-col cols="12" sm="3" md="2" class="mb:5 md:mb-4">
            <div class="flex md:flex-col justify-between items-center h-full">
              <v-card
                class="w-[110px] md:w-[175px] md:mb-2"
                v-for="n in 3"
                :key="n"
              >
                <img src="/images/da.jpg" class="rounded" alt="" />
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
                  v-for="banner in banners"
                  :key="banner.id"
                  class="h-100"
                >
                  <v-img
                    :src="banner.img"
                    class="h-100 rounded"
                    cover
                    alt=""
                  ></v-img>
                </v-carousel-item>
              </v-carousel>
            </div>
          </v-col>
          <!-- right  -->
          <v-col cols="12" sm="12" md="5">
            <div class="border-b-[2px]">
              <p class="text-[35px] font-bold">White Shirt</p>
              <!-- rating  -->
              <div>
                <v-rating v-model="rating">
                  <template v-slot:item="props">
                    <v-icon
                      size="25"
                      :color="
                        props.isFilled ? colors[props.index] : 'grey-lighten-1'
                      "
                    >
                      {{ props.isFilled ? "noto:star" : "uim:star" }}
                    </v-icon>
                  </template>
                </v-rating>
              </div>
              <div class="d-flex items-center my-3">
                <p class="text-red mr-2 text-[30px]">$60.00 USD</p>
                <p class="line-through text-gray-500 text-[15px]">$70.00 USD</p>
              </div>
            </div>
            <!-- brand  -->
            <div class="flex justify-between">
              <div class="flex justify-between items-center">
                <p class="font-bold mr-3 text-[20px]">Brand:</p>
                <div class="w-32 border-2 rounded border-blue-400">
                  <img class="" src="/brands/zara.webp" alt="" />
                </div>
              </div>

              <div class="">
                <v-dialog>
                  <template v-slot:activator="{ props: activatorProps }">
                    <div
                      v-bind="activatorProps"
                      class="flex flex-col items-center justify-center"
                    >
                      <v-btn
                        class="text-blue"
                        variant="text"
                        size="x-large"
                        icon
                      >
                        <v-icon size="40">mingcute:t-shirt-fill</v-icon>
                      </v-btn>

                      <p>Guid Size</p>
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
            <!-- item  -->
            <div class="">
              <p class="font-bold mb-5">2 Colors Available :</p>
              <div class="flex">
                <v-card
                  class="relative mb-2 mr-5 w-[175px]"
                  v-for="n in 2"
                  :key="n"
                >
                  <div
                    class="absolute z-10 bg-red text-white px-2 rounded text-[15px] right-2 top-2"
                  >
                    Red
                  </div>
                  <img src="/images/da.jpg" class="rounded" alt="" />
                </v-card>
              </div>
            </div>
            <!-- size  -->
            <div class="flex items-center">
              <p class="mr-2">Size :</p>
              <v-item-group selected-class="bg-primary">
                <v-container>
                  <v-row>
                    <v-col v-for="size in sizes" :key="size.id">
                      <v-item v-slot="{ isSelected, selectedClass, toggle }">
                        <v-card
                          :class="[
                            'd-flex text-center justify-evenly',
                            selectedClass,
                          ]"
                          variant="outlined"
                          @click="toggle"
                        >
                          <div
                            class="text-h3 flex-grow-1 text-center px-5 py-2"
                          >
                            <p class="uppercase text-[15px]">
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
            <div class="flex items-center">
              <p>Share :</p>
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
              <v-btn block size="large" color="primary" rounded="lg"
                >buy now</v-btn
              >
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
                    <img src="/images/da.jpg" class="rounded" alt="" />
                  </div>
                </v-col>
                <v-col cols="12" md="5" class="">
                  <div class="">
                    <div class="border-b-2 pb-2 border-gray-300">
                      <p class="text-[20px] font-bold">Perfect Quality Wear</p>
                    </div>
                    <p class="py-4 text-gray-500">
                      <span class="pl-5"></span>It’s difficult to find examples
                      of lorem ipsum in use before Letraset made it popular as a
                      dummy text in the 1960s, although McClintock says he
                      remembers .
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
                        <p>: Red, Purple</p>
                        <p>: L, M, S</p>
                      </v-col>
                    </v-row>
                  </div>
                  <div class="">
                    <div class="border-b-2 pb-2 border-gray-300">
                      <p class="text-[20px] font-bold">Washing Instructions</p>
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
                            <p class="text-[12px] text-gray-500">5 hour ago</p>
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
                                {{ props.isFilled ? "noto:star" : "uim:star" }}
                              </v-icon>
                            </template>
                          </v-rating>
                        </div>
                      </div>
                    </v-card-title>
                    <v-card-text class="!text-[18px] my-3"
                      >I'm really happy with this shirt , it looks so good, and
                      I don't regret buying it at all.</v-card-text
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
</template>

<style scoped></style>
