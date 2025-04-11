import { ref, onMounted, onUnmounted } from 'vue'

const scrollYPercent = ref(0)

function updateScrollYPercent(): void {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const viewportHeight = window.innerHeight
  scrollYPercent.value = scrollTop / viewportHeight

  const styleSheet = document.styleSheets[0]
  const ruleIndex = Array.from(styleSheet.cssRules).findIndex(rule =>
    rule instanceof CSSStyleRule && rule.selectorText === '*'
  )

  if (ruleIndex !== -1) {
    const rule = styleSheet.cssRules[ruleIndex] as CSSStyleRule
    rule.style.setProperty('--scroll-y-percent', scrollYPercent.value.toString())
  } else {
    styleSheet.insertRule(`* { --scroll-y-percent: ${scrollYPercent.value}; }`, styleSheet.cssRules.length)
  }
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