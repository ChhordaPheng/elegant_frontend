<script setup lang="ts">
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
  <div class="overflow-hidden w-full">
    <div class="brands-scroll-track flex">
      <v-img
        v-for="(brand, index) in brands.concat(brands)"
        :key="index"
        :src="brand.image"
        height="80"
        width="200"
        class="mx-4"
        cover
      />
    </div>
  </div>
</template>

<style scoped>
.brands-scroll-track {
  width: 100%;
  animation: scroll-left 20s linear infinite;
  width: max-content;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
