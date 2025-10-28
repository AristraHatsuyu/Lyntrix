<template>
    <div class="wrapper" :class="{ 'lightbg': currentbg.highbg }" :style="wrapperStyle" @mousemove="handleMouseMove"
        @mouseleave="resetOffset">
        <Particles />
        <FlowImage v-model="currentbg" />
        <Banner />
        <Content />
        <NextIcon />
        <Footer :title="currentbg.title" :url="currentbg.url" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentbg = ref({
    title: 'Loading',
    url: '',
    highbg: false
});

// 鼠标偏移控制
const maxOffset = 10
const offsetX = ref<number>(0)
const offsetY = ref<number>(0)

const wrapperStyle = computed(() => ({
    '--tx': offsetX.value ? offsetX.value + 'px' : '0px',
    '--ty': offsetY.value ? offsetY.value + 'px' : '0px'
}))

const handleMouseMove = (e: MouseEvent) => {
    const { innerWidth, innerHeight } = window
    const xRatio = (e.clientX / innerWidth - 0.5) * 2
    const yRatio = (e.clientY / innerHeight - 0.5) * 2
    offsetX.value = xRatio * maxOffset
    offsetY.value = yRatio * maxOffset
}

const resetOffset = () => {
    offsetX.value = 0
    offsetY.value = 0
}
</script>

<style>
.wrapper {
    position: relative;
    width: 100vw;
    max-width: min(100% - 104px, 1280px);
    margin: 0 auto;
}

@media (max-width: 768px) {
    .wrapper {
        max-width: calc(100% - 48px);
    }
}
</style>