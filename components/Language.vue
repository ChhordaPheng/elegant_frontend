<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { Language } from "~/types/language/language";

const { locale } = useI18n();

const dialogShowLang = defineModel<boolean>({ default: false });
const activeLanguage = ref<string>("");
const selectedLanguage = ref<string>("");

const LANG_KEY = "app_language";

const languages: Language[] = [
  {
    id: 1,
    name: "ខ្មែរ",
    flag: "/flags/Flag_of_Cambodia.svg.png",
    language_code: "kh",
  },
  { id: 2, name: "English", flag: "/flags/us_flag.svg", language_code: "en" },
];

function setLanguage(code: string) {
  locale.value = code;
  activeLanguage.value = code;
  selectedLanguage.value = code;
  localStorage.setItem(LANG_KEY, code); // Save to localStorage
}

function changeLanguage(lang: Language) {
  if (lang.language_code !== locale.value) {
    setLanguage(lang.language_code);
  }
}

onMounted(() => {
  const savedLang = localStorage.getItem(LANG_KEY);
  const langToSet = savedLang || locale.value;
  setLanguage(langToSet);
});

watch(selectedLanguage, (val) => {
  if (val && val !== locale.value) {
    setLanguage(val);
  }
});
</script>

<template>
  <p class="mb-4">{{ $t("content.select_language") }}</p>
  <v-card class="pa-0">
    <v-card-text class="pa-0" style="padding-bottom: 0 !important">
      <v-row
        v-for="language in languages"
        :key="language.id"
        class="justify-center items-center border-b pa-0 ma-0 cursor-pointer"
        :class="activeLanguage === language.language_code && 'bg-slate-100'"
        @click="changeLanguage(language)"
      >
        <v-row class="items-center justify-between ma-3 w-full">
          <v-col cols="3">
            <v-img
              class="rounded-[2px] w-[50px] h-[31px]"
              :src="language.flag"
              :alt="language.language_code"
            />
          </v-col>
          <v-col>
            <span class="text-[16px] font-semibold">
              {{ language.name }}
            </span>
          </v-col>
          <v-col cols="2" class="d-flex justify-end">
            <v-icon
              v-if="activeLanguage === language.language_code"
              color="#1890FF"
            >
              mdi-check-circle
            </v-icon>
          </v-col>
        </v-row>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>
