import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import GuidesIndex from './views/GuidesIndex.vue'
import GuidePage from './views/GuidePage.vue'
import SearchPage from './views/SearchPage.vue'
import { guideByPath, guideBySlug } from './content'
import { trackGuideVisit } from './analytics'
import './styles.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'guides', component: GuidesIndex },
    { path: '/page/:page(\\d+)', name: 'guides-page', component: GuidesIndex },
    { path: '/guides/:category', name: 'guides-category', component: GuidesIndex },
    { path: '/search', name: 'search', component: SearchPage },
    // Rutas antiguas de hlquery / guides.hlquery.com
    { path: '/installation/how-to-install-hlquery', redirect: '/installation/como-instalar-dashcole' },
    { path: '/installation/how-to-install-dashcole', redirect: '/installation/como-instalar-dashcole' },
    { path: '/:category/:slug', name: 'guide', component: GuidePage },
    {
      path: '/:slug',
      name: 'legacy-guide',
      redirect: (to) => guideBySlug(to.params.slug)?.path || '/'
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to) {
    if (to.hash === '#all-guides') {
      const mobileOffset = typeof window !== 'undefined' && window.innerWidth <= 720
      return { el: '.all-guides-grid', top: mobileOffset ? 92 : 104, behavior: 'smooth' }
    }
    if (to.hash) return { el: to.hash, top: 104, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (!Object.prototype.hasOwnProperty.call(to.query, 'lang')) return true

  const query = { ...to.query }
  delete query.lang

  return {
    path: to.path,
    query,
    hash: to.hash
  }
})

router.afterEach((to) => {
  const guide = typeof to.params.category === 'string' && typeof to.params.slug === 'string'
    ? guideByPath(to.params.category, to.params.slug)
    : null
  document.title = guide
    ? `${guide.title} | Guías DashCole`
    : to.name === 'search'
      ? 'Buscar guías | DashCole'
      : 'Guías DashCole'

  trackGuideVisit(to.fullPath)
})

createApp(App).use(router).mount('#app')
