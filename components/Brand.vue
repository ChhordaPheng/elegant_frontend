<script setup lang="ts">
const brandStore = useBrandStore();
const { brands } = storeToRefs(brandStore);

onMounted(async () => {
  await brandStore.fetchBrands();
});
</script>

<template>
  <div class="overflow-hidden w-full">
    <div class="brands-scroll-track flex w-40 h-40">
      <img
        v-for="brand in brands"
        :key="brand.id"
        :src="brand.logo_url"
        class="mx-4 w-40 h-36 object-cover"
        alt="brand logo"
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
