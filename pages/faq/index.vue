<script setup lang="ts">
const faqs = [
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 14 days of delivery. Items must be unworn and in original packaging.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship worldwide. Shipping fees and delivery times vary depending on your location.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you’ll receive an email with a tracking number and link.",
  },
  {
    question: "What sizes do you carry?",
    answer:
      "Our clothing is available in sizes XS to XXL. Check the size chart on each product page.",
  },
  {
    question: "Can I cancel or change my order?",
    answer:
      "Please contact us within 12 hours of placing your order to make changes or request cancellation.",
  },
];
</script>

<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-3xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h1>

        <v-expansion-panels multiple>
          <v-expansion-panel
            v-for="(faq, index) in faqs"
            :key="index"
            elevation="2"
            class="mb-2 rounded-xl"
          >
            <v-expansion-panel-title class="text-base font-semibold">
              {{ faq.question }}
            </v-expansion-panel-title>
            <v-expansion-panel-text class="text-gray-600">
              {{ faq.answer }}
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.text-3xl {
  font-size: 2rem;
}
</style>
