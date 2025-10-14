<script setup lang="ts">
const faqs = [
  {
    question: "content.return_policy_question",
    answer: "content.return_policy_answer",
  },
  {
    question: "content.international_shipping_question",
    answer: "content.international_shipping_answer",
  },
  {
    question: "content.track_order_question",
    answer: "content.track_order_answer",
  },
  {
    question: "content.sizes_question",
    answer: "content.sizes_answer",
  },
  {
    question: "content.cancel_order_question",
    answer: "content.cancel_order_answer",
  },
];
</script>

<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-3xl font-bold mb-6 text-center">
          {{ $t("faq.title") }}
        </h1>

        <v-expansion-panels multiple>
          <v-expansion-panel
            v-for="(faq, index) in faqs"
            :key="index"
            elevation="2"
            class="mb-2 rounded-xl"
          >
            <v-expansion-panel-title class="text-base font-semibold">
              {{ $t(faq.question) }}
            </v-expansion-panel-title>
            <v-expansion-panel-text class="text-gray-600">
              {{ $t(faq.answer) }}
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>
