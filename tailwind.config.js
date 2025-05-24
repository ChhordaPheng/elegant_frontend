// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{vue,js,ts,jsx,tsx}",  // Include all files in the pages directory
    "./components/**/*.{vue,js,ts,jsx,tsx}", // Include all files in the components directory
    "./layouts/**/*.{vue,js,ts,jsx,tsx}", // Include all files in the layouts directory
    "./plugins/**/*.{js,ts}", // Include all files in the plugins directory
    "./app.vue", // Include your main app component
  ],
  theme: {
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1537px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      fontFamily: {
        khmer: ["Battambang", "Roboto", "Khmer OS", "sans-serif"],
        body: ["Roboto", "Battambang", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/forms'),
  ],
  corePlugins: {
    preflight: true,
  },
}
