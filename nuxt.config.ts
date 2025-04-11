export default defineNuxtConfig({
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },
  app: {
    baseURL: '/',
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  compatibilityDate: '2025-04-10',
  devtools: { enabled: true },
})