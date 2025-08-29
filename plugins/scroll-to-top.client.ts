// plugins/force-scroll-top.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const forceScrollTop = () => {
      // Multiple methods to ensure scroll to top
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      
      // Handle any scrollable containers
      const scrollContainers = document.querySelectorAll('[style*="overflow"], .v-application, .v-main')
      scrollContainers.forEach(container => {
        if (container.scrollTop !== undefined) {
          container.scrollTop = 0
        }
      })
    }

    // Multiple hooks to catch all scenarios
    nuxtApp.hook('page:start', forceScrollTop)
    nuxtApp.hook('page:finish', () => {
      forceScrollTop()
      
      // Additional delayed attempts
      setTimeout(forceScrollTop, 0)
      setTimeout(forceScrollTop, 10)
      setTimeout(forceScrollTop, 50)
      setTimeout(forceScrollTop, 100)
      setTimeout(forceScrollTop, 200)
    })

    // Also hook into route changes
    nuxtApp.hook('vue:setup', () => {
      const router = useRouter()
      router.beforeEach(() => {
        forceScrollTop()
      })
      router.afterEach(() => {
        forceScrollTop()
        setTimeout(forceScrollTop, 100)
      })
    })
  }
})