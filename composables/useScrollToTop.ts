// composables/useScrollToTop.ts
export const useScrollToTop = () => {
  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    if (process.client) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior
      })
    }
  }

  return {
    scrollToTop
  }
}