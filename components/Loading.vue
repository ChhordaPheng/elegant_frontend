<script setup lang="ts">
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="wrapper">
      <div class="item1"></div>
      <div class="item2"></div>
      <div class="item3"></div>
      <div class="item4"></div>
    </div>
  </div>
</template>

<style scoped lang="css">
.wrapper {
  position: relative;
  width: 56px;  /* 14px * 4 */
  height: 56px;
  animation: 2s spining infinite;
}

.item1,
.item2,
.item3,
.item4 {
  width: 14px;
  height: 14px;
  position: absolute;
  background: #1576F5;
  border-radius: 14px;
}

.item1 {
  top: 8.4px;   /* 14px * 0.6 */
  left: 8.4px;
  animation: 1s changeHeight infinite;
}

.item2 {
  top: 8.4px;
  right: 8.4px;
  animation: 1s changeWidth infinite;
}

.item3 {
  bottom: 8.4px;
  left: 8.4px;
  animation: 1s changeWidth infinite;
}

.item4 {
  bottom: 8.4px;
  right: 8.4px;
  animation: 1s changeHeight infinite;
}

@keyframes changeHeight {
  50% {
    height: 47.6px; /* 56px - 8.4px */
  }
}

@keyframes changeWidth {
  50% {
    width: 47.6px; /* 56px - 8.4px */
  }
}

@keyframes spining {
  25% {
    rotate: 90deg;
  }
  50% {
    rotate: 180deg;
  }
  75% {
    rotate: 270deg;
  }
  100% {
    rotate: 360deg;
  }
}
</style>
