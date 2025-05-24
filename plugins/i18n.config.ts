import { languages } from '~/locales/index';
import { createI18n } from 'vue-i18n';

const messages = Object.assign(languages);

export default defineNuxtPlugin(({ vueApp }) => {
  const config = useRuntimeConfig();
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: config.public.locale,
    fallback: config.public.locale,
    messages
});
  vueApp.use(i18n)
});
