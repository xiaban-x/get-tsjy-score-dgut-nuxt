// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    'shadcn-nuxt'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  app: {
    head: {
      title: '东莞理工学院通识教育学分查询',
      meta: [
        { name: 'description', content: '东莞理工学院通识教育学分查询系统' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})