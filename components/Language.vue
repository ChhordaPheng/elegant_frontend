<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";

type Language = {
  id: number;
  name: string;
  flag: string;
  language_code: string;
};

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
  localStorage.setItem(LANG_KEY, code);
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
  <p class="mb-4 text-lg font-semibold text-gray-800">
    {{ $t("content.select_language") }}
  </p>

  <v-card variant="outlined" class="pa-0 rounded-xl shadow-sm !bg-blue-400">
    <v-list>
      <v-list-item
        v-for="language in languages"
        :key="language.id"
        class="hover:bg-gray-100 transition-all duration-200 rounded-lg my-5"
        :class="activeLanguage === language.language_code && 'bg-blue-50'"
        @click="changeLanguage(language)"
      >
        <template #prepend>
          <v-img
            :src="language.flag"
            :alt="language.language_code"
            class="rounded-sm w-[50px] h-[31px] border object-cover"
          />
        </template>

        <v-list-item-title class="font-medium ml-3    ">
          {{ language.name }}
        </v-list-item-title>

        <template #append>
          <v-icon v-if="activeLanguage === language.language_code" color="primary">
            mdi-check-circle
          </v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style scoped>
.v-list-item {
  cursor: pointer;
}
</style>
