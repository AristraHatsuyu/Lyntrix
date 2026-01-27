<template>
    <swiper ref="swiperr" :effect="'fade'" :loop="true" :speed="1000" :modules="[EffectFade]" @swiper="onSwiper"
        :allowTouchMove="false" class="bg-container">
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

import config from '~/assets/profile.json'

const model = defineModel()
const backgrounds = config.background

const currentIndex = ref<number>(0)
const imageUrlt = ref<string>('') // 当前显示的图片
const imageUrlb = ref<string>('') // 下一张图片
const randomOrder = ref<number[]>([]) // 随机顺序数组
const currentOrderIndex = ref<number>(0) // 当前随机顺序的索引

const bgStylet = computed(() => ({
    backgroundImage: `url(${imageUrlt.value})`
}))

const bgStyleb = computed(() => ({
    backgroundImage: `url(${imageUrlb.value})`
}))

const swiperInstance = ref<any>(null)

const onSwiper = (swiper: any) => {
    swiperInstance.value = swiper
}

function generateRandomOrder(): number[] {
    const order = Array.from({ length: backgrounds.length }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[order[i], order[j]] = [order[j], order[i]]
    }
    return order
}

function preloadAndSetImage(index: number): void {
    const img = new Image()
    img.src = backgrounds[index].image
    img.onload = () => {
        currentIndex.value = index
        model.value = backgrounds[index]
        imageUrlb.value = backgrounds[index].image
        swiperInstance.value.slideTo(1)
        extractThemeColor(img)
        setTimeout(() => {
            imageUrlt.value = imageUrlb.value
            swiperInstance.value.slideTo(0)
        }, 1200)
    }
}

function extractThemeColor(img: HTMLImageElement): void {
    const colorThief = new ColorThief()
    try {
        const brighten1 = (val: number): number => Math.min(255, Math.round(val * 2))
        const [r, g, b] = colorThief.getColor(img)
        const rL = brighten1(r)
        const gL = brighten1(g)
        const bL = brighten1(b)
        const baseColor = `rgb(${rL}, ${gL}, ${bL})`

        const brighten2 = (val: number): number => Math.min(255, Math.round(val * 2.2))
        const rH = brighten2(r)
        const gH = brighten2(g)
        const bH = brighten2(b)
        const highColor = `rgb(${rH}, ${gH}, ${bH})`

        setTimeout(() => {
            const styleSheet = document.styleSheets[0]
            const ruleIndex = Array.from(styleSheet.cssRules).findIndex(rule =>
                rule instanceof CSSStyleRule && rule.selectorText === '*'
            )
            if (ruleIndex !== -1) {
                const rule = styleSheet.cssRules[ruleIndex] as CSSStyleRule
                rule.style.setProperty('--lyntrix-color', baseColor)
                rule.style.setProperty('--lyntrix-color-high', highColor)
            } else {
                styleSheet.insertRule(`* { --lyntrix-color: ${baseColor}; --lyntrix-color-high: ${highColor}; }`, styleSheet.cssRules.length)
            }
        }, 500)
    } catch (e) {
        console.error('提取主题色失败:', e)
    }
}

function playNextImage(): void {
    if (currentOrderIndex.value >= randomOrder.value.length) {
        randomOrder.value = generateRandomOrder()
        currentOrderIndex.value = 0
    }

    const nextIndex = randomOrder.value[currentOrderIndex.value]
    currentOrderIndex.value++
    preloadAndSetImage(nextIndex)
}

onMounted(() => {
    randomOrder.value = generateRandomOrder()
    currentOrderIndex.value = 0

    const firstIndex = randomOrder.value[currentOrderIndex.value]
    currentOrderIndex.value++
    imageUrlt.value = backgrounds[firstIndex].image
    preloadAndSetImage(firstIndex)

    setInterval(() => {
        playNextImage()
    }, 10000)
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
    transition: transform 0.1s ease-out;
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