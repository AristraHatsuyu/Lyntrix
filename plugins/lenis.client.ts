import Lenis from '@studio-freight/lenis'

export default defineNuxtPlugin((nuxtApp) => {
  const lenis = new Lenis()

  const raf = (time: number) => {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // 将 Lenis 提供给整个 app
  nuxtApp.provide('lenis', lenis)
})