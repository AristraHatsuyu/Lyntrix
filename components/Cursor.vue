<template>
    <div class="cursor" :class="{ 'show': showmouse }" ref="circle"></div>
</template>

<script setup lang="ts">
const circle = ref<HTMLDivElement | null>(null)
const mouse = { x: 0, y: 0 }
const circlePos = { x: 0, y: 0 }
const delay = 0.15 // 越小越快，0.1~0.2 比较自然
const showmouse = ref(false)

onMounted(() => {
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX
        mouse.y = e.clientY
    })
    const animate = () => {
        circlePos.x += (mouse.x - circlePos.x) * delay
        circlePos.y += (mouse.y - circlePos.y) * delay
        if (circle.value) {
            circle.value.style.transform = `translate(${circlePos.x}px, ${circlePos.y}px)`
        }
        requestAnimationFrame(animate)
    }
    animate()
    document.addEventListener('mouseleave', () => (showmouse.value = false))
    document.addEventListener('mouseenter', () => (showmouse.value = true))
})
</script>