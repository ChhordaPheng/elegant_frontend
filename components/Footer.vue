<script setup>
const icons = ref([
  "mdi-facebook",
  "mdi-twitter",
  "mdi-linkedin",
  "mdi-instagram",
]);
</script>
<template>
  <v-footer class="d-flex flex-column ga-2 py-4 mt-20 relative" color="#E0F0FF">
    <div class="">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
          fill="#0099ff"
          fill-opacity="1"
          d="M0,96L30,128C60,160,120,224,180,224C240,224,300,160,360,160C420,160,480,224,540,240C600,256,660,224,720,197.3C780,171,840,149,900,154.7C960,160,1020,192,1080,208C1140,224,1200,224,1260,202.7C1320,181,1380,139,1410,117.3L1440,96L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
        ></path>
      </svg>
    </div>
    <div class="ocean">
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
    <div class="">
      <v-row>
        <v-col cols="3" class="flex flex-col justify-center items-center">
          <div class="">
            <img class="w-40" src="logo/logo.png" />
          </div>
          <p class="text-center">
            <span class="font-bold"> Elegant Chic</span> offers stylish,
            affordable clothing to help you look and feel your best every day.
          </p>
          <div class="d-flex ga-3 text-[#1576F5]">
            <v-btn
              v-for="icon in icons"
              :key="icon"
              :icon="icon"
              density="comfortable"
              variant="text"
            ></v-btn>
          </div>
        </v-col>
        <v-col cols="2">
          <p class="font-bold text-[20px] pb-2">Menu</p>
          <ul class="circle-list pl-4">
            <li>Home</li>
            <li>Woman</li>
            <li>Man</li>
            <li>About Us</li>
            <li>Services</li>
            <li>Contact</li>
          </ul>
        </v-col>
        <v-col cols="2">
          <p class="font-bold text-[20px] pb-2">Explore</p>
          <ul class="circle-list pl-4">
            <li>New Arrivals</li>
            <li>Best Sellers</li>
            <li>Trending Now</li>
            <li>Seasonal Collection</li>
          </ul>
        </v-col>
        <v-col cols="2">
          <p class="font-bold text-[20px] pb-2">Customer Service</p>
          <ul class="circle-list pl-4">
            <li>FAQs</li>
            <li>Shipping & Delivery</li>
            <li>Exchanges</li>
            <li>Track Order</li>
            <li>Size Guide</li>
          </ul>
        </v-col>
        <v-col cols="3">
          <p class="font-bold text-[20px] pb-5">Get In Touch</p>
          <v-row class="mb-3 pl-2">
            <Icon
              icon="basil:location-outline"
              class="text-[#1576F5] size-6 mr-3"
            />
            <p>Chrouy changvar, phnom penh</p>
          </v-row>
          <v-row class="mb-3 pl-2">
            <Icon icon="fontisto:email" class="text-[#1576F5] size-6 mr-3" />
            <p>elegant_chic@gmail.com</p>
          </v-row>
          <v-row class="pl-2">
            <Icon icon="mage:phone-call" class="text-[#1576F5] size-6 mr-3" />
            <p>093-24-50-94</p>
          </v-row>
        </v-col>
      </v-row>
      <div class="text-gray-500">
        <p class="text-[13px] font-bold">
          © {{ new Date().getFullYear() }} all right reserved
        </p>
      </div>
    </div>
  </v-footer>
</template>

<style lang="css" scoped>
.circle-list {
  list-style-type: circle;
}
.ocean {
  height: 200px;
  width: 100%;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
}

.ocean.v01 {
  transform: rotate(180deg);
  position: absolute;
  top: 0;
  left: 0;
}

.wave {
  background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/85486/wave.svg)
    repeat-x;
  position: absolute;
  bottom: -25px;
  width: 6400px;
  height: 100%;
  animation: wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
  transform: translate3d(0, 0, 0);
}

.wave:nth-of-type(2) {
  bottom: -25px;
  animation: wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) -0.125s infinite,
    swell 7s ease -1.25s infinite;
  opacity: 1;
}

@keyframes wave {
  0% {
    margin-left: 0;
  }
  100% {
    margin-left: -1600px;
  }
}

@keyframes swell {
  0%,
  100% {
    transform: translateY(-25px);
  }
  50% {
    transform: translateY(5px);
  }
}
</style>
