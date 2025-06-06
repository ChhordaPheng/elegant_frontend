export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: true,
  // Nuxt Modules
  modules: [
    '@nuxtjs/tailwindcss', // Tailwind CSS module
    '@pinia/nuxt', // Pinia for state management
    '@nuxtjs/google-fonts', // Google Fonts module
    '@vueuse/nuxt', // VueUse utilities
  ],

  // Build Configuration
  build: {
    transpile: ['vuetify'], // Ensure Vuetify is properly transpiled
  },

  // Vite Configuration
  vite: {
    vue: {
      template: {
        transformAssetUrls: {
          base: null,
          includeAbsolute: false,
        },
      },
    },
  },

  // Google Fonts Configuration
  googleFonts: {
    outputDir: 'assets/fonts/google',
    fontsDir: 'assets/fonts/google',
    base64: true,
    families: {
      Battambang: [400, 500, 600, 700, 800, 900],
      'Noticia+Text': true,
    },
    download: true,
    display: 'swap',
    preload: true,
    useStylesheet: true,
  },

  tailwindcss: {
    config: {
      content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './nuxt.config.{js,ts}',
      ],
      theme: {
        extend: {
          fontFamily: {
            khmer: ['Battambang', 'Roboto', 'Khmer OS', 'sans-serif'],
            body: ['Noticia Text', 'Roboto', 'Battambang', 'Arial', 'sans-serif'],
          },
        },
      },

    },
  },
  // Runtime Configuration
  runtimeConfig: {
    public: {
      apiEndPoint: process.env.NUXT_PUBLIC_API_ENDPOINT,
      locale: process.env.NUXT_PUBLIC_APP_DEFAULT_LANGUAGE,
      baseURL: process.env.NUXT_PUBLIC_BASE_URL,
    },
  },

  // Include Global Plugins
  plugins: [
    '~/plugins/iconify.ts',  // Iconify plugin
    '~/plugins/vuetify.ts',  // Vuetify plugin
    '~/plugins/i18n.config.ts', // i18n plugin
  ],

  // Pinia Configuration
  pinia: {
    storesDirs: ["./stores/**"],
  },

  // Enable Nuxt's file-based routing
  pages: true,

  // Global CSS
  css: [
    "~/assets/css/main.css", // Main Tailwind CSS file
    '@mdi/font/css/materialdesignicons.min.css', // Material Design Icons
  ],

  // Dev Server Configuration
  devServer: {
    port: 3000,
  },
});
