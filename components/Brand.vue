<script setup lang="ts">
const brandStore = useBrandStore()
const { brands } = storeToRefs(brandStore)

onMounted(async () => {
  await brandStore.fetchBrands()
})
</script>

<template>
  <div class="overflow-hidden w-full">
    <div class="brands-scroll-track flex">
      <v-img
        v-for="brand in brands"
        :key="brand.id"
        :src="brand.logo_url"
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
