<template>
    <swiper ref="swiperr" :effect="'fade'" :loop="true" :speed="1000" :modules="[EffectFade]" @swiper="onSwiper" :allowTouchMove="false"
        class="bg-container">
        <swiper-slide class="bg-image" :style="bgStylet"></swiper-slide>
        <swiper-slide class="bg-image" :style="bgStyleb"></swiper-slide>
    </swiper>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ColorThief from 'colorthief'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

import backgrounds from '~/assets/backgrounds.json'

const model = defineModel()

// 当前索引 & 当前背景图 URL
const currentIndex = ref<number>(0)
const imageUrlt = ref<string>('') // 初始直接显示第一张图
const imageUrlb = ref<string>('') // 初始直接显示第一张图

// 背景图样式（含 transform 偏移 + scale）
const bgStylet = computed(() => ({
    backgroundImage: `url(${imageUrlt.value})`
}))

const bgStyleb = computed(() => ({
    backgroundImage: `url(${imageUrlb.value})`
}))

// 提取主题色并计算亮度
function extractThemeColor(img: HTMLImageElement): void {
    const colorThief = new ColorThief()
    try {
        const brighten1 = (val: number): number => Math.min(255, Math.round(val * 2))
        const [r, g, b] = colorThief.getColor(img)
        const rL = brighten1(r)
        const gL = brighten1(g)
        const bL = brighten1(b)
        const baseColor = `rgb(${rL}, ${gL}, ${bL})`

        // 👉 增亮颜色（提升每个分量 20%，最高不超过 255）
        const brighten2 = (val: number): number => Math.min(255, Math.round(val * 2.2))
        const rH = brighten2(r)
        const gH = brighten2(g)
        const bH = brighten2(b)
        const highColor = `rgb(${rH}, ${gH}, ${bH})`

        setTimeout(() => {
            document.documentElement.style.setProperty('--lyntrix-theme-color', baseColor)
            document.documentElement.style.setProperty('--lyntrix-theme-color-high', highColor)
        }, 500)
    } catch (e) {
        console.error('提取主题色失败:', e)
    }
}

const swiperInstance = ref<any>(null)

const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper
}

// 加载图片后才设置 URL（后续切换使用）
function preloadAndSetImage(Index: number): void {
    const img = new Image()
    img.src = backgrounds[Index].image
    img.onload = () => {
        currentIndex.value = Index
        model.value = backgrounds[Index]
        imageUrlb.value = backgrounds[Index].image
        swiperInstance.value.slideTo(1);
        extractThemeColor(img);
        setTimeout(() => {
            imageUrlt.value = imageUrlb.value
            swiperInstance.value.slideTo(0);
        }, 1200);
    }
}

// 随机生成一个与当前索引不同的索引
function getRandomIndex(excludeIndex: number): number {
    let randomIndex
    do {
        randomIndex = Math.floor(Math.random() * backgrounds.length)
    } while (randomIndex === excludeIndex)
    return randomIndex
}

// 初始化：随机显示第一张图，同时开始随机轮播
onMounted(() => {
    const firstIndex = getRandomIndex(-1) // 初始随机显示
    imageUrlt.value = backgrounds[firstIndex].image
    preloadAndSetImage(firstIndex)
    setInterval(() => {
        const nextIndex = getRandomIndex(currentIndex.value)
        preloadAndSetImage(nextIndex)
    }, 5000)
})
</script>

<style>
.bg-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    transform: translate(var(--tx), var(--ty)) scale(1.1);
    z-index: 0;
    transition: transform 0.1s ease-out, background-image 1s ease-in-out;
    will-change: transform;
    filter: blur(clamp(0px, calc(calc(var(--scroll-y-percent) - 0.05) * 40px), 10px)) brightness(clamp(0.7, calc(1.025 - calc(var(--scroll-y-percent) * 0.5)), 1));
}

html.dark-mode .bg-container {
    display: none;
}

.bg-image {
    width: 100vw;
    height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
</style>