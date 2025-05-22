export default defineNuxtConfig({
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  app: {
    baseURL: '/',
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  compatibilityDate: '2025-05-22',
  devtools: { enabled: true },
  modules: ['@vesp/nuxt-fontawesome'],
  fontawesome: {
    icons: {
      solid: ['envelope', 'feather', 'building', 'pen-to-square', 'chart-simple'],
      brands: ['github', 'discord', 'instagram'],
    }
  }
})