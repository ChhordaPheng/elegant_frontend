<!-- pages/index.vue -->
<script setup>
definePageMeta({
  layout: "home-page",
});

const rmBanners = ref([
  {
    id: 1,
    img: "images/da_rm_bg.png",
  },
  {
    id: 2,
    img: "images/da_rm_bg.png",
  },
  {
    id: 3,
    img: "images/da_rm_bg.png",
  },
]);

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
</script>

<template>
  <div>
    <Header />
    <!-- banner  -->
    <div>
      <div class="banner bg-[#E0F0FF] h-[710px] relative overflow-hidden">
        <div
          class="absolute top-[-100px] right-[-400px] w-[1000px] h-[1000px] rounded-full bg-white clip-half-circle"
        ></div>
        <v-row class="absolute top-0 right-0 w-full h-full z-500">
          <v-col class="pa-0 flex justify-end">
            <v-carousel
              :show-arrows="false"
              hide-delimiter-background
              hide-delimiters
              :interval="5000"
              cycle
              class="h-100"
            >
              <v-carousel-item v-for="banner in rmBanners" :key="banner.id">
                <img
                  :src="banner.img"
                  alt="banner"
                  class="w-[405px] object-cover"
                />
              </v-carousel-item>
            </v-carousel>
          </v-col>
          <v-col cols="4">
            <div class="flex flex-col items- justify-center h-full">
              <p class="text-red text-center text-4xl">50% SALE</p>
              <p class="text-center font-bold text-[70px]">Unigue Fashion</p>
              <p class="text-center my-5">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Id
                temporibus pariatur molestias, iusto beatae odio, amet
                praesentium error dolores nam facilis ipsum quam. Quisquam eius
                facere dolore blanditiis delectus voluptatem?
              </p>
              <div class="flex justify-center mt-2">
                <v-btn size="large" class="!font-bold">Shop Now</v-btn>
                <v-btn size="large" class="bg-blue ml-3 !font-bold"
                  >New Arrival
                </v-btn>
              </div>
            </div>
          </v-col>
          <v-col cols="4" class="flex items-center justify-center">
            <div class=" ">
              <v-carousel
                class="h-auto"
                :show-arrows="false"
                hide-delimiter-background
                hide-delimiters
                :interval="5000"
                cycle
              >
                <v-carousel-item
                  cover
                  v-for="banner in banners"
                  :key="banner.id"
                >
                  <div class="">
                    <v-img
                      :src="banner.img"
                      class="rounded-sm size-64 h-auto !border-4 border-gray-400"
                      cover
                      alt=""
                    />
                  </div>
                </v-carousel-item>
              </v-carousel>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- promotin  -->
      <div class="bg-[#F3F4F5]">
        <v-container>
          <v-row>
            <v-col>
              <p>EXCLUSIVE DISCOUNTS THIS WEEK</p>
              <p class="font-bold">
                DON'T MISS <span class="text-red">70% OFF</span> ALL SALE! NO
                CODE NEEDED!
              </p>
            </v-col>
            <v-col>
              <div class="flex">
                <v-btn size="64" icon>
                  <div class="">
                    <p class="font-bold">129</p>
                    <p class="capitalize text-[12px]">Days</p>
                  </div>
                </v-btn>
                <v-btn size="64" icon>
                  <div class="">
                    <p class="font-bold">13</p>
                    <p class="capitalize text-[12px]">Hours</p>
                  </div>
                </v-btn>
                <v-btn size="64" icon>
                  <div class="">
                    <p class="font-bold">09</p>
                    <p class="capitalize text-[12px]">Mins</p>
                  </div>
                </v-btn>
                <v-btn size="64" icon>
                  <div class="">
                    <p class="font-bold text-[20px]">46</p>
                    <p class="capitalize text-[12px]">Secs</p>
                  </div>
                </v-btn>
                <v-btn class="bg-primary" rounded="xl">
                  <p>Learn more</p>
                  <Icon icon="system-uicons:upward" width="21" height="21" />
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>
