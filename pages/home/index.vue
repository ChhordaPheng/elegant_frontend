<!-- pages/index.vue -->
<script setup>
definePageMeta({
  layout: "default",
});

const tab = ref("newArrival");
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

const brands = [
  "/brands/zara.webp",
  "/brands/SMKFLWR.webp",
  "/brands/ruelala.png",
  "/brands/mable.png",
  "/brands/inamore.png",
];
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
    </div>
    <!-- promotin  -->
    <div class="bg-[#F3F4F5] h-[150px] flex items-center">
      <v-row class="d-flex justify-evenly">
        <v-col class="ml-5">
          <p>EXCLUSIVE DISCOUNTS THIS WEEK</p>
          <p class="font-bold text-[25px] mt-3">
            DON'T MISS <span class="text-red">70% OFF</span> ALL SALE! NO CODE
            NEEDED!
          </p>
        </v-col>

        <v-col cols="4" class="">
          <div class="flex items-center justify-evenly">
            <v-btn size="64" icon>
              <div class="">
                <p class="font-bold">129</p>
                <p class="capitalize text-[10px] pt-1">Days</p>
              </div>
            </v-btn>

            <v-btn size="64" icon>
              <div class="">
                <p class="font-bold">13</p>
                <p class="capitalize text-[10px] pt-1">Hours</p>
              </div>
            </v-btn>

            <v-btn size="64" icon>
              <div class="">
                <p class="font-bold">09</p>
                <p class="capitalize text-[10px] pt-1">Mins</p>
              </div>
            </v-btn>

            <v-btn height="64" min-width="64" icon class="p-0">
              <div class="text-center">
                <p class="font-bold text-[20px] leading-none">46</p>
                <p class="capitalize text-[10px] pt-1 leading-none">Secs</p>
              </div>
            </v-btn>

            <v-btn
              height="54"
              rounded="full"
              class="bg-primary text-white rounded-xl px-4"
            >
              <div class="flex items-center gap-2">
                <span>Learn more</span>
                <Icon icon="system-uicons:upward" width="21" height="21" />
              </div>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- recommendation -->
    <div class="mt-10">
      <v-card variant="text">
        <v-tabs v-model="tab" align-tabs="center">
          <v-tab value="newArrival" class="font-bold">New Arrivals</v-tab>
          <v-tab value="bestSeller">Best Sellers</v-tab>
          <v-tab value="topTrending">Top Trending</v-tab>
        </v-tabs>

        <v-card-text>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="newArrival">
              <NewArrival />
            </v-tabs-window-item>

            <v-tabs-window-item value="bestSeller"> Two </v-tabs-window-item>

            <v-tabs-window-item value="topTrending"> Three </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </div>

    <!-- brand  -->
    <div class="scroll-container">
      <div class="scroll-content">
        <div class="scroll-track" v-for="i in 10" :key="i">
          <v-img
            v-for="(brand, index) in brands"
            :key="index"
            :src="brand"
            height="80"
            width="190"
            class="mx-4"
            cover
          />
        </div>
      </div>
    </div>

    <!-- men and women recommand -->
    <div class="my-20 text-center">
      <p class="text-gray-400 uppercase text-[15px] mb-5">
        love at first sight
      </p>
      <p class="font-bold uppercase text-[35px]">gotta have this</p>
    </div>
    <div class="w-[1200px] ">
      <v-row class="">
        <v-col cols="6">
          <div class="relative">
            <div class="absolute z-10">
              <p>Discover Your Style</p>
              <a href="#" class="underline">See more</a>
            </div>
            <v-carousel
              class="h-auto"
              :show-arrows="false"
              hide-delimiter-background
              hide-delimiters
              :interval="5000"
              cycle
            >
              <v-carousel-item cover v-for="banner in banners" :key="banner.id">
                <div class="relative w-72">
                  <v-img
                    :src="banner.img"
                    class="rounded-sm w-72 h-auto"
                    cover
                    alt=""
                  ></v-img>
                  <div
                    class="absolute top-0 left-0 text-white pa-4"
                  >
                    $6.000 USD
                  </div>
                </div>
              </v-carousel-item>
            </v-carousel>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="bg-blue">hahah</div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<style scoped>
.scroll-container {
  overflow: hidden;
  width: 100%;
  background-color: #fff;
  padding: 1rem 0;
}

.scroll-content {
  display: flex;
  align-items: center;
}

.scroll-track {
  display: flex;
  animation: scroll-left 10s linear infinite;
  width: max-content;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-40%);
  }
}
</style>
