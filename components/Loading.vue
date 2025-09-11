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
  width: 42px;  /* smaller than 56px */
  height: 42px;
  animation: 2s spining infinite;
}

.item1,
.item2,
.item3,
.item4 {
  width: 10.5px;   /* smaller than 14px */
  height: 10.5px;
  position: absolute;
  background: #1576F5;
  border-radius: 10.5px;
}

.item1 {
  top: 6.3px;   /* 10.5 * 0.6 */
  left: 6.3px;
  animation: 1s changeHeight infinite;
}

.item2 {
  top: 6.3px;
  right: 6.3px;
  animation: 1s changeWidth infinite;
}

.item3 {
  bottom: 6.3px;
  left: 6.3px;
  animation: 1s changeWidth infinite;
}

.item4 {
  bottom: 6.3px;
  right: 6.3px;
  animation: 1s changeHeight infinite;
}

@keyframes changeHeight {
  50% {
    height: 35.7px; /* 42 - 6.3 */
  }
}

@keyframes changeWidth {
  50% {
    width: 35.7px; /* 42 - 6.3 */
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
