// app/router.options.ts
import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    return { left: 0, top: 0 } // ignore savedPosition and hash
  }
}


