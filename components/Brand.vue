<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const brandStore = useBrandStore();
const { brands } = storeToRefs(brandStore);
const router = useRouter();

const scrollContainer = ref<HTMLElement>();
const isUserScrolling = ref(false);
const autoScrollInterval = ref<NodeJS.Timeout>();
const scrollSpeed = 1; // pixels per frame
const pauseDuration = 0; // pause duration after user interaction
const intervalDelay = 5; // run every 5ms instead of 10ms

// Function to handle brand click navigation
const handleBrandClick = (brandId: string | number) => {
  router.push({
    path: "/brand",
    query: { id: brandId.toString() },
  });
};

// Auto scroll function
const startAutoScroll = () => {
  if (autoScrollInterval.value) return;

  autoScrollInterval.value = setInterval(() => {
    if (!isUserScrolling.value && scrollContainer.value) {
      const container = scrollContainer.value;
      const maxScroll = container.scrollWidth - container.clientWidth;
      container.scrollLeft =
        container.scrollLeft >= maxScroll
          ? 0
          : container.scrollLeft + scrollSpeed;
    }
  }, intervalDelay);
};

// Stop auto scroll
const stopAutoScroll = () => {
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value);
    autoScrollInterval.value = undefined;
  }
};

// Handle user scroll start
const handleScrollStart = () => {
  isUserScrolling.value = true;
  stopAutoScroll();
};

// Handle user scroll end (with debounce)
let scrollTimeout: NodeJS.Timeout;
const handleScroll = () => {
  handleScrollStart();

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isUserScrolling.value = false;
    setTimeout(startAutoScroll, pauseDuration);
  }, 10); // debounce delay
};

// Handle mouse enter/leave for better UX
const handleMouseEnter = () => {
  isUserScrolling.value = true;
  stopAutoScroll();
};

const handleMouseLeave = () => {
  setTimeout(() => {
    if (!isUserScrolling.value) {
      startAutoScroll();
    }
  }, 10);
  isUserScrolling.value = false;
};

onMounted(async () => {
  await brandStore.fetchBrands();

  // Start auto scroll after brands are loaded
  setTimeout(startAutoScroll, 10);
});

onUnmounted(() => {
  stopAutoScroll();
  clearTimeout(scrollTimeout);
});
</script>

<template>
  <div class="overflow-hidden w-full">
    <div
      ref="scrollContainer"
      class="brands-scroll-track flex overflow-x-auto scrollbar-hide cursor-pointer"
      @scroll="handleScroll"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @touchstart="handleScrollStart"
    >
      <!-- Duplicate brands for seamless infinite scroll -->
      <template v-for="_ in 2" :key="`set-${_}`">
        <img
          v-for="brand in brands"
          :key="`${_}-${brand.id}`"
          :src="brand.logo_url"
          @click="handleBrandClick(brand.id)"
          class="mx-4 w-40 h-36 object-cover flex-shrink-0 hover:opacity-80 transition-opacity"
          alt="brand logo"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.brands-scroll-track {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.brands-scroll-track img {
  transition: opacity 0.2s ease;
}

.brands-scroll-track img:hover {
  opacity: 0.8;
}
</style>
