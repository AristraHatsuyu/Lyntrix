<template>
    <div class="cursor" :class="{ 'show': showmouse, 'pointer': inpointer, 'press': mousedown }" ref="circle"></div>
</template>

<script setup lang="ts">
const circle = ref<HTMLDivElement | null>(null)
const mouse = { x: 0, y: 0 }
const circlePos = { x: 0, y: 0 }
const delay = computed(() =>
  document.documentElement.classList.contains('forcetouch') ? 1 : 0.15
)
const showmouse = ref(false)
const inpointer = ref(false)
const mousedown = ref(false)

// 判断是否是可点击元素
function isPointerElement(element: HTMLElement | null): boolean {
    while (element) {
        if (element.hasAttribute('data-pointer') && element.getAttribute('data-pointer') !== "false") {
            return true
        }
        element = element.parentElement // 递归检查父元素
    }
    return false
}

onMounted(() => {
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX
        mouse.y = e.clientY
    })

    const animate = () => {
        circlePos.x += (mouse.x - circlePos.x) * delay.value
        circlePos.y += (mouse.y - circlePos.y) * delay.value
        if (circle.value) {
            circle.value.style.transform = `translate(${circlePos.x}px, ${circlePos.y}px)`
        }
        requestAnimationFrame(animate)
    }
    animate()

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
        window.addEventListener('mouseout', () => (showmouse.value = false));
        window.addEventListener('mouseover', () => (showmouse.value = true));
    }

    document.addEventListener('mousedown', () => (mousedown.value = true))
    document.addEventListener('mouseup', () => (mousedown.value = false))

    // 鼠标进入元素时检查是否是可点击元素
    document.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement
        inpointer.value = isPointerElement(target)
    })

    // 鼠标离开元素时检查是否离开可点击元素
    document.addEventListener('mouseout', (e) => {
        const target = e.target as HTMLElement
        inpointer.value = isPointerElement(target)
    })
})
</script>

<style lang="scss">
.cursor {
  position: fixed;
  top: -19px;
  left: -19px;
  width: 36px;
  height: 36px;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transform: translate(0, 0);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transition: top 0.3s, left 0.3s, width 0.3s, height 0.3s, opacity 0.3s, background-color 0.3s;

  &.show {
    opacity: 1;
  }

  &.pointer {
    top: -14px;
    left: -14px;
    width: 26px;
    height: 26px;
    background-color: #ffffff55;
  }

  &.press {
    top: -11px;
    left: -11px;
    width: 20px;
    height: 20px;
    background-color: #ffffff88;
  }
}

.forcetouch .cursor {
    background-color: #ffffff;
}
</style>