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

// 当前索引 & 当前背景图 URL
const currentIndex = ref<number>(0)
const imageUrlt = ref<string>('') // 当前显示的图片
const imageUrlb = ref<string>('') // 下一张图片
const randomOrder = ref<number[]>([]) // 随机顺序数组
const currentOrderIndex = ref<number>(0) // 当前随机顺序的索引

// 背景图样式
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

// 生成一个完整的不重复随机顺序
function generateRandomOrder(): number[] {
    const order = Array.from({ length: backgrounds.length }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[order[i], order[j]] = [order[j], order[i]]
    }
    return order
}

// 加载图片后才设置 URL（后续切换使用）
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

        // 增亮颜色
        const brighten2 = (val: number): number => Math.min(255, Math.round(val * 2.2))
        const rH = brighten2(r)
        const gH = brighten2(g)
        const bH = brighten2(b)
        const highColor = `rgb(${rH}, ${gH}, ${bH})`

        setTimeout(() => {
            const styleSheet = document.styleSheets[0] // 获取第一个样式表
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

// 播放下一张图片
function playNextImage(): void {
    if (currentOrderIndex.value >= randomOrder.value.length) {
        // 如果当前顺序播放完，生成新的随机顺序
        randomOrder.value = generateRandomOrder()
        currentOrderIndex.value = 0
    }

    const nextIndex = randomOrder.value[currentOrderIndex.value]
    currentOrderIndex.value++
    preloadAndSetImage(nextIndex)
}

// 初始化：随机显示第一张图，同时开始随机轮播
onMounted(() => {
    randomOrder.value = generateRandomOrder() // 初始化随机顺序
    currentOrderIndex.value = 0

    const firstIndex = randomOrder.value[currentOrderIndex.value]
    currentOrderIndex.value++
    imageUrlt.value = backgrounds[firstIndex].image
    preloadAndSetImage(firstIndex)

    setInterval(() => {
        playNextImage()
    }, 10000) // 每 5 秒切换一次
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