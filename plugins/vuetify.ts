import { createVuetify } from "vuetify";
import { aliases, custom } from "~/utils/custom-icons";
import { VDateInput } from 'vuetify/labs/VDateInput'

import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components: {
      ...components,
      VDateInput, // Register VDateInput here
    },
    directives,
    icons: {
      defaultSet: "custom", // Default icon set
      aliases,
      sets: {
        custom, // Material Design Icons
      },
    },
    theme: {
      defaultTheme: "light", // Default theme (light or dark)
      themes: {
        light: {
          dark: false,
          colors: {
            primary: "#1890FF",
            secondary: "#424242",
            accent: "#82B1FF",
            error: "#FF5252",
            info: "#2196F3",
            success: "#27A209",
            warning: "#FFC107",
            pending: "#FFA800",
            holding: "#ED5050",
            tbheader: "#E7F0FF",
            tbBorder: "#595959",
            main: "#FAF9F7"
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: "#2196F3",
            secondary: "#424242",
            accent: "#FF4081",
            error: "#FF5252",
            info: "#2196F3",
            success: "#27A209",
            warning: "#FB8C00",
            pending: "#FFA800",
          },
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
