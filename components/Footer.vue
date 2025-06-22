<script setup>
import { ref } from "vue";

const icons = ref([
  "mdi-facebook",
  "mdi-twitter",
  "mdi-linkedin",
  "mdi-instagram",
]);
</script>

<template>
  <div class="">
    <svg
      id="wave"
      style="transform: rotate(0deg); transition: 0.3s"
      viewBox="0 0 1440 190"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sw-gradient-0" x1="0" x2="0" y1="1" y2="0">
          <stop stop-color="rgba(224, 240, 255, 1)" offset="0%"></stop>
          <stop stop-color="rgba(224, 240, 255, 1)" offset="100%"></stop>
        </linearGradient>
      </defs>
      <path
        style="transform: translate(0, 0px); opacity: 1"
        fill="url(#sw-gradient-0)"
        d="M0,133L34.3,139.3C68.6,146,137,158,206,142.5C274.3,127,343,82,411,72.8C480,63,549,89,617,101.3C685.7,114,754,114,823,95C891.4,76,960,38,1029,47.5C1097.1,57,1166,114,1234,126.7C1302.9,139,1371,108,1440,85.5C1508.6,63,1577,51,1646,41.2C1714.3,32,1783,25,1851,47.5C1920,70,1989,120,2057,142.5C2125.7,165,2194,158,2263,139.3C2331.4,120,2400,89,2469,72.8C2537.1,57,2606,57,2674,72.8C2742.9,89,2811,120,2880,123.5C2948.6,127,3017,101,3086,95C3154.3,89,3223,101,3291,95C3360,89,3429,63,3497,66.5C3565.7,70,3634,101,3703,123.5C3771.4,146,3840,158,3909,152C3977.1,146,4046,120,4114,110.8C4182.9,101,4251,108,4320,117.2C4388.6,127,4457,139,4526,123.5C4594.3,108,4663,63,4731,63.3C4800,63,4869,108,4903,129.8L4937.1,152L4937.1,190L4902.9,190C4868.6,190,4800,190,4731,190C4662.9,190,4594,190,4526,190C4457.1,190,4389,190,4320,190C4251.4,190,4183,190,4114,190C4045.7,190,3977,190,3909,190C3840,190,3771,190,3703,190C3634.3,190,3566,190,3497,190C3428.6,190,3360,190,3291,190C3222.9,190,3154,190,3086,190C3017.1,190,2949,190,2880,190C2811.4,190,2743,190,2674,190C2605.7,190,2537,190,2469,190C2400,190,2331,190,2263,190C2194.3,190,2126,190,2057,190C1988.6,190,1920,190,1851,190C1782.9,190,1714,190,1646,190C1577.1,190,1509,190,1440,190C1371.4,190,1303,190,1234,190C1165.7,190,1097,190,1029,190C960,190,891,190,823,190C754.3,190,686,190,617,190C548.6,190,480,190,411,190C342.9,190,274,190,206,190C137.1,190,69,190,34,190L0,190Z"
      ></path>
    </svg>
  </div>
  <v-footer class="d-flex flex-column ga-2 py-4 relative" color="#E0F0FF">
    <div class="ocean">
      <div class="wave"></div>
      <div class="wave"></div>
    </div>

    <div class="footer-content px-4">
      <v-row>
        <v-col
          cols="12"
          sm="3"
          md="3"
          class="flex flex-col justify-center items-center mb-6 md:mb-0"
        >
          <div>
            <img class="w-36 sm:w-40" src="logo/logo.png" alt="Logo" />
          </div>
          <p class="text-center text-sm sm:text-base mt-2 px-2">
            <span class="font-bold">Elegant Chic</span> offers stylish,
            affordable clothing to help you look and feel your best every day.
          </p>
          <div class="d-flex ga-3 text-[#1576F5] mt-3">
            <v-btn
              v-for="icon in icons"
              :key="icon"
              :icon="icon"
              density="comfortable"
              variant="text"
              class="mx-1"
            ></v-btn>
          </div>
        </v-col>

        <v-col cols="6" sm="2" md="2" class="mb-6 md:mb-0">
          <p class="font-bold text-lg pb-2">Menu</p>
          <ul class="circle-list pl-4">
            <li>Home</li>
            <li>Woman</li>
            <li>Man</li>
            <li>About Us</li>
            <li>Services</li>
            <li>Contact</li>
          </ul>
        </v-col>

        <v-col cols="6" sm="2" md="2" class="mb-6 md:mb-0">
          <p class="font-bold text-lg pb-2">Explore</p>
          <ul class="circle-list pl-4">
            <li>New Arrivals</li>
            <li>Best Sellers</li>
            <li>Trending Now</li>
            <li>Seasonal Collection</li>
          </ul>
        </v-col>

        <v-col cols="6" sm="2" md="2" class="mb-6 md:mb-0">
          <p class="font-bold text-lg pb-2">Customer Service</p>
          <ul class="circle-list pl-4">
            <li>FAQs</li>
            <li>Shipping & Delivery</li>
            <li>Exchanges</li>
            <li>Track Order</li>
            <li>Size Guide</li>
          </ul>
        </v-col>

        <v-col cols="6" sm="3" md="3">
          <p class="font-bold text-lg pb-5">Get In Touch</p>
          <v-row class="mb-3 pl-2">
            <v-col class="pa-0" cols="2" md="1">
              <Icon
                icon="basil:location-outline"
                class="text-[#1576F5] size-6 mr-3"
              />
            </v-col>
            <v-col class="pa-0">
              <p class="text-sm sm:text-base">Chrouy changvar, Phnom Penh</p>
            </v-col>
          </v-row>
          <v-row class="mb-3 pl-2">
            <v-col cols="2" md="1" class="pa-0">
              <Icon icon="fontisto:email" class="text-[#1576F5] size-6 mr-3" />
            </v-col>
            <v-col class="pa-0">
              <p class="text-sm sm:text-base">elegant_chic @gmail.com</p>
            </v-col>
          </v-row>
          <v-row class="mb-3 pl-2">
            <v-col class="pa-0" cols="2" md="1">
              <Icon icon="mage:phone-call" class="text-[#1576F5] size-6 mr-3" />
            </v-col>
            <v-col class="pa-0">
              <p class="text-sm sm:text-base">093-24-50-94</p>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <div class="text-gray-500 mt-8 text-center">
        <p class="text-[13px] font-bold">
          © {{ new Date().getFullYear() }} all rights reserved
        </p>
      </div>
    </div>
  </v-footer>
</template>

<style scoped>
.footer-svg {
  width: 100%;
  height: 120px;
  display: block;
}

.ocean {
  height: 120px;
  width: 100%;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
}

.wave {
  background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/85486/wave.svg)
    repeat-x;
  position: absolute;
  bottom: -15px;
  width: 3200px; /* smaller width for mobile */
  height: 100%;
  animation: wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
  transform: translate3d(0, 0, 0);
  opacity: 0.7;
}

.wave:nth-of-type(2) {
  bottom: -15px;
  animation: wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) -0.125s infinite,
    swell 7s ease -1.25s infinite;
  opacity: 0.5;
}

.circle-list {
  list-style-type: circle;
}
/* Adjust font sizes on smaller devices */
@media (max-width: 600px) {
  .footer-content {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  p {
    font-size: 0.9rem;
  }

  .circle-list {
    padding-left: 1.2rem;
  }
}

/* Waves animation */
@keyframes wave {
  0% {
    margin-left: 0;
  }
  100% {
    margin-left: -800px; /* adjusted for smaller width */
  }
}

@keyframes swell {
  0%,
  100% {
    transform: translateY(-15px);
  }
  50% {
    transform: translateY(5px);
  }
}
</style>
