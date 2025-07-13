<script setup lang="ts">
const newArrivalStore = useNewArrivalStore();
const { items } = storeToRefs(newArrivalStore);

onMounted(async () => {
  await newArrivalStore.fetchNewArrivals();
});
</script>

<template>
  <v-slide-group center-active>
    <v-slide-group-item
      v-for="item in items"
      :key="item.id"
      v-slot="{ toggle }"
    >
      <v-card class="relative w-[360px] mr-5" variant="text">
        <v-hover v-slot="{ isHovering, props }">
          <div v-bind="props" class="relative w-full cursor-pointer">
            <!-- Product Image -->
            <img :src="item.variants[0].image" class="w-full object-cover" />
            <!-- <img src="/images/da.jpg" class="w-full object-cover" /> -->

            <!-- Animated Buttons on Hover (narrow wrapper for better positioning) -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6">
              <!-- Favorite (slide from left) -->
              <transition name="slide-left">
                <div v-if="isHovering">
                  <v-tooltip text="Add to Favorites">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon class="bg-white text-black">
                        <v-icon icon="akar-icons:heart" />
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
                      <v-btn v-bind="props" icon class="bg-white text-black">
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
                      <v-btn v-bind="props" icon class="bg-white text-black">
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
          <p class="font-bold text-[20px]">{{ item.name }}</p>
          <p class="text-blue-700 font-bold uppercase my-1">
            {{ item.brand.name }}
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
              ${{ item.variants[0]?.final_price }} USD
            </p>
            <p class="line-through text-gray-500">
              ${{ item.variants[0]?.price }} USD
            </p>
          </div>
        </div>
      </v-card>
    </v-slide-group-item>
  </v-slide-group>
</template>

<style scoped>
/* Transitions */
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
