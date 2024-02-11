import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router/auto'
import App from './App.vue'
import './style.scss'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    extendRoutes(routes) {
        // routes.push({
        //     path: '/',
        //     redirect: '/xxx'
        // })
        return routes
    }
})

const title = document.title
router.afterEach((to) => {
    if (to.meta?.title) {
        document.title = `${to.meta.title} | ${title}`
    }
})

createApp(App).use(router).mount('#app')

if (import.meta.env.DEV) {
    console.log(import.meta.env)
    console.log(router.getRoutes())
    // import('eruda').then(({ default: eruda }) => eruda.init())
}
