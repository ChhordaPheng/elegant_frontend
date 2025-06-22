<script setup lang="ts">
import { ref } from "vue";
const dialog = ref(true);
const cartItems = ref([
  {
    id: 1,
    name: "White T-shirt",
    price: 200,
    quantity: 1,
    image: "/images/da.jpg",
  },
  {
    id: 2,
    name: "White T-shirt",
    price: 100,
    quantity: 1,
    image: "/images/dada.jpg",
  },
]);

const increase = (item: any) => {
  item.quantity++;
};

const decrease = (item: any) => {
  if (item.quantity > 1) item.quantity--;
};

const removeItem = (id: number) => {
  cartItems.value = cartItems.value.filter((item) => item.id !== id);
};

// Computed values for summary
const subtotal = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

const delivery = ref(5);
const discount = ref(3);

const total = computed(() => subtotal.value + delivery.value - discount.value);
const isValid = ref(false);

const form = ref({
  name: "",
  phoneNumber: "",
  address: "",
});

const rules = {
  required: (value: string) => !!value || "Required.",
  phoneNumber: (value: string) => !!value || "Required.",
  address: (value: string) => !!value || "Required.",
};

const submitForm = () => {
  alert(`Submitted:\nName: ${form.value.name}\nAddress: ${form.value.address}`);
};
</script>

<template>
  <div>
    <div
      class="bg-gray-200 h-[400px] flex items-center justify-center text-center"
      style="
        background-image: url('https://t3.ftcdn.net/jpg/02/84/32/52/360_F_284325273_ei2pxwlAyg4ghLOBINFPiF1LVubbfLpA.jpg');
        object-fit: cover;
        background-size: cover;
        background-position: left center;
      "
    >
      <p class="uppercase text-[30px] font-bold text-white">shopping cart</p>
    </div>
    <v-container class="mt-4">
      <v-row>
        <v-col cols="12" sm="7" md="8">
          <!-- title  -->
          <v-row class="uppercase border-b text-center">
            <v-col cols="3" md="4" class="text-left">
              <p class="">Product</p>
            </v-col>
            <v-col cols="2" class="flex items-center justify-center">
              <p class="">Price</p>
            </v-col>
            <v-col cols="3" md="3" class="flex items-center justify-center">
              <p class="">Quantity</p>
            </v-col>
            <v-col cols="2" class="flex items-center justify-center">
              <p class="">Total</p>
            </v-col>
            <v-col cols="2" md="1" class="flex items-center justify-between">
            </v-col>
          </v-row>

          <v-row
            v-for="item in cartItems"
            :key="item.id"
            class="uppercase border-b text-center"
          >
            <v-col cols="3" md="4" class="pa-0">
              <div
                class="py-3 flex flex-col sm:flex-row sm:items-center sm:space-x-4"
              >
                <v-card class="w-[100px] mx-auto sm:mx-0">
                  <img :src="item.image" alt="Product Image" />
                </v-card>
                <p
                  class="pt-2 text-center sm:pt-0 sm:text-left text-[10px] md:text-[15px]"
                >
                  {{ item.name }}
                </p>
              </div>
            </v-col>

            <v-col cols="2" class="flex items-center justify-center">
              <p class="text-grey">{{ item.price }}$</p>
            </v-col>

            <v-col cols="3" md="3" class="flex items-center justify-center">
              <div
                class="flex items-center justify-between px-2 py-1 md:w-[100%] lg:w-[80%]"
              >
                <v-btn
                  size="small"
                  variant="flat"
                  @click="decrease(item)"
                  :disabled="item.quantity <= 1"
                  icon
                >
                  <v-icon>mdi-minus</v-icon>
                </v-btn>

                <p class="text-center w-8">{{ item.quantity }}</p>

                <v-btn
                  variant="tonal"
                  size="small"
                  @click="increase(item)"
                  icon
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
            </v-col>

            <v-col cols="2" class="flex items-center justify-center">
              <p class="font-bold">{{ item.price * item.quantity }}$</p>
            </v-col>

            <v-col cols="2" md="1" class="flex items-center justify-between">
              <Icon
                icon="mynaui:trash"
                class="size-[30px] cursor-pointer"
                @click="removeItem(item.id)"
              />
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" sm="5" md="4">
          <v-card class="!bg-gray-100 pa-5">
            <p class="uppercase border-b pb-3 font-bold">order summary</p>
            <v-row class="mt-3" v-for="item in cartItems" :key="item.id">
              <v-col cols="8">
                <div class="flex">
                  <v-card class="me-3 flex-shrink-0">
                    <img
                      class="object-cover"
                      :src="item.image"
                      width="80"
                      height="80"
                      :alt="item.name"
                    />
                  </v-card>
                  <div>
                    <p>{{ item.name }}</p>
                    <p class="text-grey">Quantity : {{ item.quantity }}</p>
                  </div>
                </div>
              </v-col>

              <v-col>
                <p class="text-grey text-center">
                  ${{ item.price * item.quantity }}
                </p>
              </v-col>
            </v-row>
            <!-- border -->
            <div class="border-b my-8"></div>
            <div>
              <v-row class="items-center">
                <v-col>
                  <p class="uppercase font-bold">subtotal</p>
                </v-col>
                <p class="pr-3 text-grey">${{ subtotal }}</p>
              </v-row>
              <v-row class="items-center">
                <v-col>
                  <p class="uppercase font-bold">STANDARD DELIVERY</p>
                </v-col>
                <p class="pr-3 text-grey">${{ delivery }}</p>
              </v-row>
              <v-row class="items-center">
                <v-col>
                  <p class="uppercase font-bold">COUPON DISCOUNT</p>
                </v-col>
                <p class="pr-3 text-red">- ${{ discount }}</p>
              </v-row>

              <div class="border-b my-8"></div>
              <v-row class="items-center text-[20px] font-bold">
                <v-col>
                  <p class="uppercase">TOTAL</p>
                </v-col>
                <p class="pr-3">${{ total }}</p>
              </v-row>
              <v-btn
                class="w-full mt-4 text-white"
                color="black"
                variant="elevated"
                size="large"
                @click="dialog = true"
              >
                proceed to checkout
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dialog: set max-width here -->
      <v-dialog v-model="dialog" max-width="600px">
        <v-card class="pa-5">
          <v-card-title class="text-h6 font-bold">
            <v-row class="mb-2 items-center">
              <p>SHIPPING ADDRESS</p>
              <v-spacer></v-spacer>
              <v-btn
                icon="ix:cancel"
                @click="dialog = false"
                class="text-red"
                variant="text"
              />
            </v-row>
          </v-card-title>

          <v-form v-model="isValid" @submit.prevent="submitForm">
            <v-text-field
              v-model="form.name"
              label="User Name"
              :rules="[rules.required]"
              required
              class="mb-3"
              prepend-inner-icon="iconoir:user"
            />

            <v-text-field
              v-model="form.phoneNumber"
              label="Phone Number"
              :rules="[rules.required, rules.phoneNumber]"
              required
              class="mb-3"
              prepend-inner-icon="quill:phone"
            />

            <v-text-field
              v-model="form.address"
              label="Address"
              :rules="[rules.required, rules.address]"
              type="string"
              required
              class="mb-3"
              prepend-inner-icon="material-symbols:location-on-outline"
            />

            <v-btn
              type="submit"
              :disabled="!isValid"
              color="primary"
              class="mt-2"
            >
              checkout
            </v-btn>
          </v-form>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<style scoped></style>
