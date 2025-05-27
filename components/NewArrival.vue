<script setup>
const tab = ref(null);
</script>
<template>
  <div class="">
    <v-sheet class="mx-auto" elevation="8">
      <v-slide-group v-model="tab" class="pa-4" center-active>
        <v-slide-group-item v-for="n in 10" :key="n" v-slot="{ toggle }">
          <v-card class="ma-4" variant="text" @click="toggle">
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
                    <v-btn v-bind="props" icon="pepicons-pencil:cart"></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Quick View">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="carbon:image-copy"></v-btn>
                  </template>
                </v-tooltip>
              </div>
              <img src="/images/da.jpg" width="360" alt="" />
            </div>
            <div class="text-center my-5">
              <p class="font-bold text-[20px]">White Shirt</p>
              <p class="text-blue-700 font-bold uppercase my-1">Zara</p>
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
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>
  </div>
</template>

<style scoped></style>
