import { ref, onMounted, onUnmounted } from 'vue'

const scrollYPercent = ref(0)

function updateScrollYPercent(): void {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const viewportHeight = window.innerHeight
  scrollYPercent.value = scrollTop / viewportHeight

  document.documentElement.style.setProperty('--scroll-y-percent', scrollYPercent.value.toString())
}

export function useScrollYPercent() {
  onMounted(() => {
    updateScrollYPercent()
    window.addEventListener('scroll', updateScrollYPercent)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateScrollYPercent)
  })

  return { scrollYPercent }
}
