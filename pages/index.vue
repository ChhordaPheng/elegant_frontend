<script setup lang="ts">
import { useBannerStore } from "../stores/banner/bannerStore";

definePageMeta({
  layout: "default",
});
const router = useRouter();
const tab = ref("newArrival");
const bannerStore = useBannerStore();
const { banners } = storeToRefs(bannerStore);
const promotionStore = usePromotionStore();
const { promotions } = storeToRefs(promotionStore);
const discountStore = useDiscountStore();
const { discountedItems } = storeToRefs(discountStore);
const menStore = useManIteStore();
const { men } = storeToRefs(menStore);
const womenStore = useWomanIteStore();
const { women } = storeToRefs(womenStore);

const topTrendingStore = useTopTrendingStore();
const { topTrendings } = storeToRefs(topTrendingStore);

// Auto-fetch timer
let fetchTimer: any = null;

const bannerss = [
  {
    id: 1,
    img: "https://i.pinimg.com/1200x/7d/aa/1f/7daa1f177aaa14d718a0a39642101a3a.jpg",
  },
  {
    id: 2,
    img: "https://i.pinimg.com/736x/d0/e8/f3/d0e8f3f3fd3f705fb4d2266f4c16c53d.jpg",
  },
  {
    id: 3,
    img: "https://i.pinimg.com/736x/da/ec/38/daec385e61b0a599fa9d69eb2313614b.jpg",
  },
  {
    id: 4,
    img: "https://i.pinimg.com/736x/fa/b6/12/fab612e5d91cb9d9d56fb2ff26b51fbc.jpg",
  },
];

// Duplicate banners to make it loop visually
const bannersLoop = computed(() =>
  discountedItems.value.flatMap((item) =>
    item.variants.map((variant) => ({
      id: variant.id,
      image: variant.image,
      price: variant.price,
      discounted_price: variant.discounted_price,
      discount_info: variant.discount_info,
    }))
  )
);

function goInstagram() {
  window.open("https://ig.me/m/elegant_chic119", "_blank");
}
const defaultImage = "https://via.placeholder.com/200x150";

// Safe image loading for the first men's item
const firstItemImage = computed(() => {
  const fallbackImage =
    "https://i.pinimg.com/736x/6f/1a/f6/6f1af60d4d7765280cd779b92cba05ce.jpg";

  if (!men.value || men.value.length === 0) {
    return fallbackImage;
  }

  const firstItem = men.value[0];
  if (!firstItem?.variants || firstItem.variants.length === 0) {
    return fallbackImage;
  }

  const firstVariant = firstItem.variants[0];
  if (!firstVariant?.image || firstVariant.image.length === 0) {
    return fallbackImage;
  }

  return firstVariant.image;
});

const firstItemImageWomen = computed(() => {
  const fallbackImage =
    "https://i.pinimg.com/736x/6f/1a/f6/6f1af60d4d7765280cd779b92cba05ce.jpg";

  if (!women.value || women.value.length === 0) {
    return fallbackImage;
  }

  const firstItem = women.value[0];
  if (!firstItem?.variants || firstItem.variants.length === 0) {
    return fallbackImage;
  }

  const firstVariant = firstItem.variants[0];
  if (!firstVariant?.image || firstVariant.image.length === 0) {
    return fallbackImage;
  }

  return firstVariant.image;
});

// Function to start auto-fetching promotion data
const startAutoFetch = (intervalSeconds = 30) => {
  // Clear existing timer if any
  if (fetchTimer) {
    clearInterval(fetchTimer);
  }

  // Set up periodic fetching
  fetchTimer = setInterval(async () => {
    try {
      await promotionStore.fetchPromotion();
    } catch (error) {
      console.error("Error fetching promotion:", error);
    }
  }, intervalSeconds * 1000);
};

const quickView = (productId: string) => {
  router.push({
    path: "/product-detail",
    query: { id: productId.toString() },
  });
};

onMounted(async () => {
  await bannerStore.fetchBanners();
  await promotionStore.fetchPromotion();
  await discountStore.fetchDiscountedItems();
  await menStore.fetchManItems();
  await womenStore.fetchWomanItems();
  await topTrendingStore.fetchTopTrendings(),
    // Start auto-fetching promotion data every 30 seconds
    startAutoFetch(30);
});

onUnmounted(() => {
  // Clean up the timer when component is unmounted
  if (fetchTimer) {
    clearInterval(fetchTimer);
    fetchTimer = null;
  }
});
</script>

<template>
  <div>
    <!-- banner  -->
    <div>
      <div
        class="banner bg-[#E0F0FF] min-h-[400px] md:h-[710px] relative overflow-hidden"
      >
        <!-- Background circle - hidden on mobile -->
        <div
          class="hidden md:block absolute top-[-100px] right-[-400px] w-[1000px] h-[1000px] rounded-full bg-white clip-half-circle"
        ></div>

        <!-- Main Row -->
        <v-row class="z-500 px-2 md:px-4 items-center justify-center h-100">
          <!-- Column 1: Left-side Carousel -->
          <v-col
            cols="12"
            md="4"
            class="flex justify-center items-center mb-4 md:mb-0"
          >
            <v-carousel
              :show-arrows="false"
              hide-delimiter-background
              hide-delimiters
              :interval="5000"
              cycle
              class="w-full max-w-[300px] md:max-w-[405px] h-auto"
            >
              <v-carousel-item v-for="banner in banners" :key="banner.id">
                <img
                  :src="
                    banner.big_image ||
                    'https://i.pinimg.com/736x/71/d8/c3/71d8c399c2de74a2281e0ab46dadef85.jpg'
                  "
                  alt="banner"
                  class="w-full object-cover"
                />
              </v-carousel-item>
            </v-carousel>
          </v-col>

          <!-- Column 2: Text Content (stays in middle) -->
          <v-col
            cols="12"
            md="4"
            class="flex flex-col justify-center text-center py-8 md:h-[900px]"
          >
            <v-carousel
              :show-arrows="false"
              hide-delimiter-background
              hide-delimiters
              :interval="5000"
              cycle
            >
              <v-carousel-item v-for="banner in banners" :key="banner.id">
                <div
                  class="h-full flex flex-col justify-center items-center text-center px-4"
                >
                  <p class="text-red text-2xl md:text-4xl font-bold mb-2">
                    {{ banner.discount }} % SALE
                  </p>
                  <p
                    class="font-bold text-3xl md:text-[40px] lg:text-[70px] my-2 lg:my-16 leading-tight lg:leading-[70px]"
                  >
                    {{ banner.title }}
                  </p>

                  <p class="my-3 md:my-5 px-4 md:px-6 text-sm md:text-base">
                    {{ banner.description }}
                  </p>
                  <div
                    class="flex flex-col sm:flex-row justify-center gap-3 mt-4"
                  >
                    <v-btn
                      size="large"
                      to="/man"
                      class="!font-bold w-full sm:w-auto"
                      >{{ $t("buttons.shop_now") }}</v-btn
                    >
                    <v-btn
                      to="/new-arrival"
                      size="large"
                      class="bg-blue !text-white !font-bold w-full sm:w-auto"
                    >
                      {{ $t("content.new_arrival") }}
                    </v-btn>
                  </div>
                </div>
              </v-carousel-item>
            </v-carousel>
          </v-col>

          <!-- Column 3: Right-side Card with Carousel -->
          <v-col cols="12" md="4" class="flex justify-center items-center">
            <v-card elevation="3" class="w-full max-w-[250px] md:max-w-[300px]">
              <v-carousel
                :show-arrows="false"
                hide-delimiter-background
                hide-delimiters
                :interval="5000"
                cycle
                class="h-auto"
              >
                <v-carousel-item v-for="banner in banners" :key="banner.id">
                  <img
                    :src="
                      banner.small_image ||
                      'https://i.pinimg.com/736x/16/6a/ef/166aef267fcefb91f60f330f1531e0fd.jpg'
                    "
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

    <!-- promotion with auto-fetched countdown -->
    <v-container
    v-if="promotions"
      fluid
      class="bg-[#F3F4F5] min-h-[120px] md:h-[150px] flex items-center py-4"
    >
      <v-row class="justify-center items-center w-full">
        <v-col cols="12" md="8" class="md:text-left">
          <p class="text-xs md:text-sm mb-2">
            {{ promotions?.title || "Loading..." }}
          </p>
          <p class="font-bold text-lg md:text-[25px]">
            {{ promotions?.description || "Loading promotion..." }}
          </p>
        </v-col>

        <v-col cols="12" md="4" class="flex justify-center">
          <div
            class="flex items-center justify-center gap-2 md:gap-4 flex-wrap"
          >
            <!-- Days (only show if > 0) -->
            <div class="mx-1" v-if="promotions?.countdown?.days > 0">
              <v-btn height="48" min-width="48" icon class="p-0 text-center">
                <div class="text-center">
                  <p class="font-bold text-sm md:text-[20px] leading-none">
                    {{ String(promotions.countdown.days).padStart(2, "0") }}
                  </p>
                  <p
                    class="capitalize text-[8px] md:text-[10px] pt-1 leading-none"
                  >
                    Days
                  </p>
                </div>
              </v-btn>
            </div>

            <!-- Hours -->
            <div class="mx-1">
              <v-btn height="48" min-width="48" icon class="p-0 text-center">
                <div class="text-center">
                  <p class="font-bold text-sm md:text-[20px] leading-none">
                    {{
                      String(promotions?.countdown?.hours || 0).padStart(2, "0")
                    }}
                  </p>
                  <p
                    class="capitalize text-[8px] md:text-[10px] pt-1 leading-none"
                  >
                    Hours
                  </p>
                </div>
              </v-btn>
            </div>

            <!-- Minutes -->
            <div class="mx-1">
              <v-btn height="48" min-width="48" icon class="p-0 text-center">
                <div class="text-center">
                  <p class="font-bold text-sm md:text-[20px] leading-none">
                    {{
                      String(promotions?.countdown?.minutes || 0).padStart(
                        2,
                        "0"
                      )
                    }}
                  </p>
                  <p
                    class="capitalize text-[8px] md:text-[10px] pt-1 leading-none"
                  >
                    Mins
                  </p>
                </div>
              </v-btn>
            </div>

            <!-- Seconds -->
            <div class="mx-1">
              <v-btn height="48" min-width="48" icon class="p-0 text-center">
                <div class="text-center">
                  <p class="font-bold text-sm md:text-[20px] leading-none">
                    {{
                      String(promotions?.countdown?.seconds || 0).padStart(
                        2,
                        "0"
                      )
                    }}
                  </p>
                  <p
                    class="capitalize text-[8px] md:text-[10px] pt-1 leading-none"
                  >
                    Secs
                  </p>
                </div>
              </v-btn>
            </div>

            <v-btn
              height="44"
              rounded="full"
              class="bg-primary text-white rounded-xl px-3 ml-2"
              size="small"
              to="/discount"
            >
              <div class="flex items-center gap-1">
                <span class="text-xs md:text-sm">{{
                  $t("buttons.see_more")
                }}</span>
                <Icon icon="system-uicons:upward" width="16" height="16" />
              </div>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <!-- recommendation -->
    <div class="mt-6 md:mt-10 px-2 md:px-0">
      <v-card variant="text">
        <v-tabs v-model="tab" align-tabs="center" class="overflow-x-auto">
          <v-tab value="newArrival" class="!font-bold text-sm md:text-base">{{
            $t("content.new_arrival")
          }}</v-tab>
          <v-tab value="bestSeller" class="!font-bold text-sm md:text-base">{{
            $t("content.best_seller")
          }}</v-tab>
          <v-tab value="topTrending" class="!font-bold text-sm md:text-base">{{
            $t("content.top_trending")
          }}</v-tab>
        </v-tabs>

        <v-card-text class="px-2 md:px-4">
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
    <div class="w-full px-2 md:px-0 my-10">
      <Brand />
    </div>

    <!-- men and women recommend -->
    <div class="mb-6 md:mb-10 text-center px-4">
      <p class="text-gray-400 uppercase text-xs md:text-[15px] mb-3 md:mb-5">
        love at first sight
      </p>
      <p class="font-bold uppercase text-2xl md:text-[35px]">gotta have this</p>
    </div>

    <div class="min-h-[400px] md:h-[500px] mb-8">
      <v-container>
        <v-row class="justify-center">
          <v-col cols="12" md="6" class="mb-4 md:mb-0">
            <div class="relative flex justify-center">
              <div class="absolute z-10 top-32 md:top-64 left-4 md:left-20">
                <p
                  class="font-bold text-lg md:text-[20px] text-black md:text-black"
                >
                  Discover Your <br />
                  Style
                </p>
                <a href="/man" class="underline text-black md:text-black"
                  >SeeMore</a
                >
              </div>
              <div
                class="hidden md:block absolute z-10 top-[70px] left-[200px]"
              >
                <p class="text-rotate text-[15px] text-gray-400">
                  SALE UP TO 30% OFF
                </p>
              </div>
              <div class="w-64 md:w-72 h-auto relative">
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
                    v-for="(item, index) in men.slice(0, 3)"
                    :key="index"
                  >
                    <div
                      @click="quickView(item.id)"
                      class="relative w-64 md:w-72 cursor-pointer"
                    >
                      <v-img
                        :src="
                          item?.variants?.[0]?.image ||
                          'https://i.pinimg.com/1200x/a6/9b/73/a69b73a42de54464bf275b8bccc2a04d.jpg'
                        "
                        class="rounded-sm w-64 md:w-72 bg-top"
                        cover
                        alt=""
                      ></v-img>
                      <div
                        class="absolute top-0 left-0 text-white pa-1 mt-2 ml-2 md:pa-1 !bg-blue-500 rounded-md"
                      >
                        ${{ item?.variants?.[0]?.price }} USD
                      </div>
                    </div>
                  </v-carousel-item>
                </v-carousel>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="relative flex justify-center mt-8 md:mt-14">
              <div class="absolute z-10 top-16 md:top-20 left-4 md:left-16">
                <p
                  class="font-bold text-lg md:text-[20px] text-black md:text-black"
                >
                  Redefine Your <br />
                  Look
                </p>
                <a href="/woman" class="underline text-black md:text-black"
                  >SeeMore</a
                >
              </div>
              <div
                class="hidden md:block absolute z-10 top-[70px] left-[200px]"
              >
                <p class="text-rotate text-[15px] text-gray-400">
                  SALE UP TO 30% OFF
                </p>
              </div>
              <div class="w-64 md:w-72 h-auto relative">
                <v-carousel
                  :show-arrows="false"
                  hide-delimiter-background
                  hide-delimiters
                  :interval="5000"
                  cycle
                >
                  <v-carousel-item
                    v-for="(item, index) in women.slice(0, 3)"
                    :key="index"
                    cover
                  >
                    <div
                      @click="quickView(item.id)"
                      class="relative w-64 md:w-72 cursor-pointer"
                    >
                      <v-img
                        :src="
                          item?.variants?.[0]?.image ||
                          'https://i.pinimg.com/1200x/a6/9b/73/a69b73a42de54464bf275b8bccc2a04d.jpg'
                        "
                        class="rounded-sm w-64 md:w-72 bg-top h-80"
                        cover
                        alt=""
                      ></v-img>
                      <div
                        class="absolute top-0 right-0 text-white pa-1 mt-2 ml-2 md:pa-1 !bg-blue-500 rounded-md"
                      >
                        ${{ item?.variants?.[0]?.price }} USD
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
    <div class="relative mb-20 md:mb-0">
      <div
        v-for="discount in discountedItems"
        :key="discount.id"
        class="banner-discount bg-gray-500 min-h-[400px] md:h-[550px] flex flex-col text-white uppercase text-center pt-16 md:pt-24 px-4"
      >
        <p class="text-base md:text-[20px]">
          {{ discount.discount_details.name }}
        </p>
        <p
          class="text-4xl md:text-6xl my-2 md:my-3 text-center leading-tight md:leading-snug"
        >
          {{ discount.discount_details.description }}
        </p>

        <v-btn to="/discount" variant="text" class="!underline w-auto">{{
          $t("buttons.shop_now")
        }}</v-btn>
      </div>

      <!-- discount  -->
      <div class="relative">
        <div
          class="min-h-[300px] absolute z-10 -top-48 flex justify-center w-full"
        >
          <v-slide-group show-arrows center-active class="h-full">
            <v-slide-group-item
              v-for="(banner, index) in bannersLoop"
              :key="banner.id"
            >
              <div class="relative h-[400px] flex items-center">
                <div
                  class="mx-2 jump_box"
                  :class="index % 2 === 0 ? 'jump_box_up' : 'jump_box_down'"
                >
                  <div
                    class="w-64 h-64 md:h-64 relative overflow-hidden rounded-md"
                  >
                    <v-card class="relative" variant="text">
                      <div class="relative w-full cursor-pointer">
                        <!-- Product Image -->
                        <v-img
                          :src="banner.image"
                          cover
                          position="top"
                          @click="quickView(discountedItems[0].id)"
                          :alt="`Product Image - ${banner.id}`"
                        />

                        <!-- Discount Badge -->
                        <div
                          v-if="banner.discount_info?.value"
                          class="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold"
                        >
                          {{ banner.discount_info.value }} % OFF
                        </div>

                        <!-- Original Price -->
                        <div
                          v-if="banner.price"
                          :key="banner.id"
                          class="absolute bottom-4 left-4 line-through text-red px-2 py-1 rounded-md text-sm font-bold"
                        >
                          {{ banner.price }} $
                        </div>

                        <!-- Discounted Price -->
                        <div
                          v-if="banner.discounted_price"
                          :key="banner.id"
                          class="absolute bottom-10 left-4 text-blue px-2 py-1 rounded-md text-lg font-bold"
                        >
                          {{ banner.discounted_price }} $
                        </div>
                      </div>
                    </v-card>
                  </div>
                </div>
              </div>
            </v-slide-group-item>
          </v-slide-group>
        </div>
      </div>
    </div>

    <!-- instagram -->
    <div class="mt-[50px] md:mt-[200px]">
      <v-container>
        <v-row>
          <v-col
            cols="12"
            md="4"
            class="flex flex-col items-center justify-center text-center md:text-left mb-6 md:mb-0"
          >
            <div class="px-4 md:px-0">
              <p class="text-3xl md:text-[50px] mb-2">Our Instagram</p>
              <p class="text-xl md:text-[25px] mb-4">@elegant_chic</p>
              <p class="text-gray-400 text-sm md:text-base leading-relaxed">
                Find everyday essentials and true style for both men and
                women.Stay up to date with the latest trends. Follow us for
                fresh style inspiration. Tag us and get featured @elegant_chic
              </p>
              <v-btn
                color="primary"
                rounded
                class="!font-bold mt-6 md:mt-10 w-full md:w-auto"
                size="large"
                @click="goInstagram"
              >
                follow us
                <Icon icon="system-uicons:upward" width="24" height="24" />
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="8">
            <p class="text-end md:text-end text-gray-500 mb-4">
              Check out latest trends
            </p>
            <div class="photo-grid">
              <div class="photo-item photo-1 placeholder">
                <img class="bg-top" :src="firstItemImage" alt="trend" />
              </div>

              <div class="photo-item photo-2 placeholder">
                <img
                  :src="
                    men?.[6]?.variants?.[0]?.image ||
                    'https://i.pinimg.com/736x/08/50/81/0850815065b7978f80fe952d4bfba244.jpg'
                  "
                  alt="trend"
                />
              </div>

              <div class="photo-item photo-3 placeholder">
                <img
                  :src="
                    men?.[7]?.variants?.[0]?.image ||
                    'https://i.pinimg.com/736x/a6/9b/73/a69b73a42de54464bf275b8bccc2a04d.jpg'
                  "
                  alt="trend"
                />
              </div>

              <div class="photo-item photo-4 placeholder">
                <img
                  :src="
                    men?.[8]?.variants?.[0]?.image ||
                    'https://i.pinimg.com/736x/a6/9b/73/a69b73a42de54464bf275b8bccc2a04d.jpg'
                  "
                  alt="trend"
                />
              </div>

              <div class="photo-item photo-5 placeholder">
                <img
                  :src="
                    men?.[9]?.variants?.[0]?.image ||
                    'https://i.pinimg.com/736x/a6/9b/73/a69b73a42de54464bf275b8bccc2a04d.jpg'
                  "
                  alt="trend"
                />
              </div>

              <div class="photo-item photo-6 placeholder">
                <img
                  :src="
                    men?.[10]?.variants?.[0]?.image ||
                    'https://i.pinimg.com/736x/a6/9b/73/a69b73a42de54464bf275b8bccc2a04d.jpg'
                  "
                  alt="trend"
                />
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- service  -->
    <div class="mt-8">
      <v-container fluid class="bg-[#F5F5F5] py-8 md:py-12">
        <v-row>
          <v-col
            cols="12"
            sm="6"
            lg="3"
            class="text-center flex flex-col justify-center items-center px-4 mb-6 md:mb-0"
          >
            <Icon
              class="text-gray-400 mb-3"
              icon="hugeicons:delivery-truck-02"
              width="50"
              height="50"
            />
            <p class="font-bold text-lg md:text-[20px] mb-2">Free Shipping</p>
            <p class="text-gray-500 text-sm md:text-base">
              We offer free shipping for new customers on orders over $50.
            </p>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            lg="3"
            class="text-center flex flex-col justify-center items-center px-4 mb-6 md:mb-0"
          >
            <Icon
              class="text-gray-400 mb-3"
              icon="tdesign:location"
              width="50"
              height="50"
            />
            <p class="font-bold text-lg md:text-[20px] mb-2">
              25 Provinces/Cities Delivered
            </p>
            <p class="text-gray-500 text-sm md:text-base">
              Experience fast, reliable, and free delivery right to your
              doorstep every time, on time.
            </p>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            lg="3"
            class="text-center flex flex-col justify-center items-center px-4 mb-6 md:mb-0"
          >
            <Icon
              class="text-gray-400 mb-3"
              icon="fa-solid:box-open"
              width="50"
              height="50"
            />
            <p class="font-bold text-lg md:text-[20px] mb-2">Returns</p>
            <p class="text-gray-500 text-sm md:text-base">
              We do not offer refunds, but exchanges items in our store.
            </p>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            lg="3"
            class="text-center flex flex-col justify-center items-center px-4"
          >
            <Icon
              class="text-gray-400 mb-3"
              icon="tdesign:service-filled"
              width="50"
              height="50"
            />
            <p class="font-bold text-lg md:text-[20px] mb-2">
              24/7 Customer Service
            </p>
            <p class="text-gray-500 text-sm md:text-base">
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
  background-size: cover;
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
  justify-content: center;
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
    transform: translateY(20px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Mobile Responsive Styles */
@media (max-width: 960px) {
  .text-rotate {
    display: none;
  }

  .banner {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .jump_box_up,
  .jump_box_down {
    animation: none; /* Disable animations on mobile for better performance */
  }
}

@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(3, 150px);
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

  .banner {
    min-height: 500px;
  }
}

@media (max-width: 480px) {
  .photo-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 180px);
    gap: 8px;
    padding: 8px;
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

  .banner {
    min-height: 400px;
  }

  .banner-discount {
    min-height: 350px;
    padding-top: 3rem;
  }
}

/* Extra small screens */
@media (max-width: 360px) {
  .photo-grid {
    grid-template-rows: repeat(6, 160px);
  }

  .banner {
    min-height: 350px;
  }
}
</style>
