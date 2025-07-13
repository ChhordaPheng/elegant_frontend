<script setup>
import { useBannerStore } from "../stores/banner/bannerStore";

definePageMeta({
  layout: "main-layout",
});

const tab = ref("newArrival");
const bannerStore = useBannerStore();
const { banners } = storeToRefs(bannerStore);
// const rmBanners = ref([
//   {
//     id: 1,
//     img: "images/da_rm_bg.png",
//   },
//   {
//     id: 2,
//     img: "images/da_rm_bg.png",
//   },
//   {
//     id: 3,
//     img: "images/da_rm_bg.png",
//   },
// ]);

// const banners = ref([
//   {
//     id: 1,
//     img: "images/da.jpg",
//   },
//   {
//     id: 2,
//     img: "images/da.jpg",
//   },
//   {
//     id: 3,
//     img: "images/da.jpg",
//   },
// ]);

onMounted(async () => {
  await bannerStore.fetchBanners();
});
</script>

<template>
  <div>
    <!-- banner  -->
    <div>
      <div class="banner bg-[#E0F0FF] h-[710px] relative overflow-hidden">
        <!-- Background circle -->
        <div
          class="absolute top-[-100px] right-[-400px] w-[1000px] h-[1000px] rounded-full bg-white clip-half-circle"
        ></div>

        <!-- Main Row -->
        <v-row class="z-500 px-4" align="center" justify="center">
          <!-- Column 1: Right-side Carousel -->
          <v-col cols="12" md="4" class="flex justify-center mb-6 md:mb-0">
            <v-carousel
              :show-arrows="false"
              hide-delimiter-background
              hide-delimiters
              :interval="5000"
              cycle
              class="w-full max-w-[405px] h-auto"
            >
              <v-carousel-item v-for="banner in banners" :key="banner.id">
                <img
                  :src="banner.big_image"
                  alt="banner"
                  class="w-full object-cover"
                />
              </v-carousel-item>
            </v-carousel>
          </v-col>

          <!-- Column 2: Text Content -->
          <v-col
            cols="12"
            md="4"
            class="flex flex-col justify-center text-center h-[900px]"
          >
            <v-carousel
              :show-arrows="false"
              hide-delimiter-background
              hide-delimiters
              :interval="5000"
              cycle
            >
              <v-carousel-item v-for="banner in banners" :key="banner.id">
                <p class="text-red text-4xl font-bold">
                  {{ banner.discount }} % SALE
                </p>
                <p class="font-bold text-[40px] md:text-[70px]">
                  {{ banner.title }}
                </p>
                <p class="my-5 px-2 md:px-6">
                  {{ banner.description }}
                </p>
                <div class="flex justify-center gap-3 mt-2">
                  <v-btn size="large" class="!font-bold">Shop Now</v-btn>
                  <v-btn size="large" class="bg-blue !text-white !font-bold"
                    >New Arrival</v-btn
                  >
                </div>
              </v-carousel-item>
            </v-carousel>
          </v-col>

          <!-- Column 3: Card with Carousel -->
          <v-col cols="12" md="4" class="flex justify-center">
            <v-card elevation="3" class="w-full max-w-[300px]">
              <v-carousel
                :show-arrows="false"
                hide-delimiter-background
                hide-delimiters
                :interval="5000"
                cycle
                class="h-auto"
              >
                <v-carousel-item v-for="banner in banners" :key="banner.id">
                  <v-img
                    :src="banner.small_image"
                    class="rounded-sm w-full h-auto !border-4 border-gray-400"
                    cover
                    alt=""
                  />
                </v-carousel-item>
              </v-carousel>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- promotin  -->
    <v-container fluid class="bg-[#F3F4F5] h-[150px] flex items-center">
      <v-row class="justify-evenly">
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
    </v-container>

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

            <v-tabs-window-item value="bestSeller">
              <BestSeller />
            </v-tabs-window-item>

            <v-tabs-window-item value="topTrending">
              <TopTranding />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </div>

    <!-- brand  -->
    <div class="w-full">
      <Brand />
    </div>

    <!-- men and women recommand -->
    <div class="my-20 text-center">
      <p class="text-gray-400 uppercase text-[15px] mb-5">
        love at first sight
      </p>
      <p class="font-bold uppercase text-[35px]">gotta have this</p>
    </div>

    <div class="h-[500px]">
      <v-container>
        <v-row class="">
          <v-col cols="6">
            <div class="relative flex justify-center">
              <div class="absolute z-10 top-64 left-20">
                <p class="font-bold text-[20px]">
                  Discover Your <br />
                  Style
                </p>
                <a href="#" class="underline">SeeMore</a>
              </div>
              <div class="absolute z-10 top-[70px] left-[200px]">
                <p class="text-rotate text-[15px] text-gray-400">
                  SALE UP TO 30% OFF
                </p>
              </div>
              <div class="w-72 h-auto absolute">
                <v-carousel
                  class=""
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
                    <div class="relative w-72">
                      <v-img
                        :src="banner.img"
                        class="rounded-sm w-72 h-auto"
                        cover
                        alt=""
                      ></v-img>
                      <div class="absolute top-0 left-0 text-white pa-4">
                        $6.000 USD
                      </div>
                    </div>
                  </v-carousel-item>
                </v-carousel>
              </div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="relative flex justify-center mt-14">
              <div class="absolute z-10 top-20 left-16">
                <p class="font-bold text-[20px]">
                  Redefine Your <br />
                  Look
                </p>
                <a href="#" class="underline">SeeMore</a>
              </div>
              <div class="w-72 h-auto absolute">
                <v-carousel
                  class=""
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
                    <div class="relative w-72">
                      <v-img
                        :src="banner.img"
                        class="rounded-sm w-72 h-64"
                        cover
                        alt=""
                      ></v-img>
                      <div class="absolute top-0 right-0 text-white pa-4">
                        $6.000 USD
                      </div>
                    </div>
                  </v-carousel-item>
                </v-carousel>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- super sell  -->
    <div class="relative">
      <div
        class="banner-discount bg-gray-500 h-[550px] flex flex-col text-white uppercase text-center pt-24"
      >
        <p class="text-[20px]">BESTSELLERS</p>
        <p class="text-6xl my-3">Super Sale! Up To</p>
        <span class="text-6xl my-3"> 80% Off </span>
        <v-btn variant="text" class="!underline">shop now</v-btn>
      </div>

      <!-- season  -->
      <div
        class="h-[400px] absolute z-10 -bottom-[250px] flex items-center justify-center w-full"
      >
        <v-container class="h-full">
          <v-row class="h-full">
            <!-- col 1  -->
            <v-col cols="3" class="">
              <v-carousel
                class="jump_box_up h-70 mt-16"
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
                  <div class="relative w-72">
                    <v-img
                      :src="banner.img"
                      class="rounded-sm w-72 h-auto"
                      cover
                      alt=""
                    ></v-img>
                    <div class="absolute top-0 left-0 text-white pa-4">
                      $6.000 USD
                    </div>
                  </div>
                </v-carousel-item>
              </v-carousel>
            </v-col>
            <!-- col 2 -->
            <v-col cols="3">
              <v-carousel
                class="jump_box_down"
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
                  <div class="relative w-72">
                    <v-img
                      :src="banner.img"
                      class="rounded-sm w-72 h-auto"
                      cover
                      alt=""
                    ></v-img>
                    <div class="absolute top-0 left-0 text-white pa-4">
                      $6.000 USD
                    </div>
                  </div>
                </v-carousel-item>
              </v-carousel>
            </v-col>
            <!-- col 3  -->
            <v-col cols="3" class="mt-16">
              <v-carousel
                class="jump_box_up"
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
                  <div class="relative w-72">
                    <v-img
                      :src="banner.img"
                      class="rounded-sm w-72 h-auto"
                      cover
                      alt=""
                    ></v-img>
                    <div class="absolute top-0 left-0 text-white pa-4">
                      $6.000 USD
                    </div>
                  </div>
                </v-carousel-item>
              </v-carousel>
            </v-col>
            <!-- col 4  -->
            <v-col cols="3" class="mt-5">
              <v-carousel
                class="jump_box_down"
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
                  <div class="relative w-72">
                    <v-img
                      :src="banner.img"
                      class="rounded-sm w-72 h-auto"
                      cover
                      alt=""
                    ></v-img>
                    <div class="absolute top-0 left-0 text-white pa-4">
                      $6.000 USD
                    </div>
                  </div>
                </v-carousel-item>
              </v-carousel>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>

    <!-- instagram -->
    <div class="mt-[450px]">
      <v-container>
        <v-row>
          <v-col
            cols="12"
            md="4"
            sm="12"
            class="flex flex-col items-center justify-center"
          >
            <div class="">
              <p class="text-[50px]">Our Instagram</p>
              <p class="text-[25px]">@elegant_chic</p>
              <p class="text-gray-400 mt-10">
                Find everyday essentials and true style for both men and
                women.Stay up to date with the latest trends. Follow us for
                fresh style inspiration. Tag us and get featured @elegant_chic
              </p>
              <v-btn
                color="primary"
                rounded
                class="!font-bold mt-10"
                size="large"
              >
                follow us
                <Icon icon="system-uicons:upward" width="24" height="24" />
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="8" sm="12">
            <p class="text-end text-gray-500">Check out latest trends</p>
            <div class="photo-grid">
              <div class="photo-item photo-1 placeholder">
                <img
                  class="bg-top"
                  src="https://i.pinimg.com/736x/6f/1a/f6/6f1af60d4d7765280cd779b92cba05ce.jpg"
                  alt="trend"
                />
              </div>

              <div class="photo-item photo-2 placeholder">
                <img
                  src="https://i.pinimg.com/736x/08/50/81/0850815065b7978f80fe952d4bfba244.jpg"
                  alt="trend"
                />
              </div>

              <div class="photo-item photo-3 placeholder">
                <img
                  src="https://i.pinimg.com/736x/a6/9b/73/a69b73a42de54464bf275b8bccc2a04d.jpg"
                  alt="trend"
                />
              </div>

              <div class="photo-item photo-4 placeholder">
                <img
                  src="https://i.pinimg.com/736x/19/b5/f9/19b5f9d1937a42c515091c80993584ae.jpg"
                  alt="trend"
                />
              </div>

              <div class="photo-item photo-5 placeholder">
                <img
                  src="https://i.pinimg.com/736x/1d/b8/10/1db810bc7ff9f5aa2f21fe7b35059901.jpg"
                  alt="trend"
                />
              </div>

              <div class="photo-item photo-6 placeholder">
                <img
                  src="https://i.pinimg.com/736x/51/5e/07/515e0795115fd625cfc797eebc0bd9f4.jpg"
                  alt="trend"
                />
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- service  -->
    <div class="">
      <v-container fluid class="bg-[#F5F5F5]">
        <v-row>
          <v-col
            lg="3"
            md="3"
            sm="6"
            class="text-center flex flex-col justify-center items-center px-2"
          >
            <Icon
              class="text-gray-400"
              icon="hugeicons:delivery-truck-02"
              width="70"
              height="70"
            />
            <p class="font-bold text-[20px] my-2">Free Shipping</p>
            <p class="text-gray-500">
              We offer free shipping for new customers on orders over $50.
            </p>
          </v-col>
          <v-col
            lg="3"
            md="3"
            sm="6"
            class="text-center flex flex-col justify-center items-center px-2"
          >
            <Icon
              class="text-gray-400"
              icon="tdesign:location"
              width="70"
              height="70"
            />
            <p class="font-bold text-[20px] my-2">
              25 Provinces/Cities Delivered
            </p>
            <p class="text-gray-500">
              Experience fast, reliable, and free delivery right to your
              doorstep every time, on time.
            </p>
          </v-col>
          <v-col
            lg="3"
            md="3"
            sm="6"
            class="text-center flex flex-col justify-center items-center px-2"
          >
            <Icon
              class="text-gray-400"
              icon="fa-solid:box-open"
              width="70"
              height="70"
            />
            <p class="font-bold text-[20px] my-2">Returns</p>
            <p class="text-gray-500">
              We do not offer refunds, but exchanges items in our store.
            </p>
          </v-col>
          <v-col
            lg="3"
            md="3"
            sm="6"
            class="text-center flex flex-col justify-center items-center p-3 my-3"
          >
            <Icon
              class="text-gray-400"
              icon="tdesign:service-filled"
              width="70"
              height="70"
            />
            <p class="font-bold text-[20px] my-2">24/7 Customer Service</p>
            <p class="text-gray-500">
              Excited to share our new product with you! designed to bring
              exceptional value
            </p>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<style scoped>
.text-rotate {
  transform: translateX(180px) rotate(90deg);
}
.banner-discount {
  background-image: url("/public/banners/discount.jpg");
  background-position: top center;
}
.jump_box_up,
.jump_box_down {
  animation: jump_box_up 8s infinite;
}
.jump_box_down {
  animation: jump_box_down 8s infinite;
}
.photo-grid {
  display: grid;
  grid-template-columns: 235px 250px 235px;
  grid-template-rows: 200px 250px 200px;
  gap: 15px;
  padding: 20px;
}

.photo-item {
  background-color: #999;
  border-radius: 8px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.photo-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.photo-item img {
  border-radius: 10px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}

/* Grid positioning */
.photo-1 {
  grid-column: 1;
  grid-row: 1;
}

.photo-2 {
  grid-column: 2;
  grid-row: 1 / 3;
}

.photo-3 {
  grid-column: 3;
  grid-row: 1;
}

.photo-4 {
  grid-column: 1;
  grid-row: 2 / 4;
}

.photo-5 {
  grid-column: 2;
  grid-row: 3;
}

.photo-6 {
  grid-column: 3;
  grid-row: 2 / 4;
}
@keyframes jump_box_up {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
}
@keyframes jump_box_down {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(100px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(3, 200px);
    gap: 10px;
    padding: 10px;
  }

  .photo-1 {
    grid-column: 1;
    grid-row: 1;
  }
  .photo-2 {
    grid-column: 2;
    grid-row: 1;
  }
  .photo-3 {
    grid-column: 1;
    grid-row: 2;
  }
  .photo-4 {
    grid-column: 2;
    grid-row: 2;
  }
  .photo-5 {
    grid-column: 1;
    grid-row: 3;
  }
  .photo-6 {
    grid-column: 2;
    grid-row: 3;
  }
}

@media (max-width: 480px) {
  .photo-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 200px);
  }

  .photo-1,
  .photo-2,
  .photo-3,
  .photo-4,
  .photo-5,
  .photo-6 {
    grid-column: 1;
  }

  .photo-1 {
    grid-row: 1;
  }
  .photo-2 {
    grid-row: 2;
  }
  .photo-3 {
    grid-row: 3;
  }
  .photo-4 {
    grid-row: 4;
  }
  .photo-5 {
    grid-row: 5;
  }
  .photo-6 {
    grid-row: 6;
  }
}
</style>
