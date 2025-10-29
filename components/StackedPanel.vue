<template>
    <div class="stacked-wrapper" @mousedown.stop @dblclick.stop>
        <swiper ref="swiperRef" :slidesPerView="1" :direction="'vertical'" :allowTouchMove="true" :speed="400"
            :effect="'creative'" :modules="[EffectCreative]" :creativeEffect="{
                prev: {
                    translate: [0, '10%', -1],
                    opacity: 0,
                    scale: 0.95,
                },
                next: {
                    translate: [0, '20%', 0],
                    scale: 1,
                    opacity: 0,

                }
            }" @swiper="onSwiper" @slideChange="onSlideChange" class="stacked-swiper">

            <swiper-slide class="stacked-slide">
                <div class="card card-1">
                    <div class="card-content">
                        <h3 class="card-title">Panel 1</h3>
                    </div>
                </div>
            </swiper-slide>

            <swiper-slide class="stacked-slide">
                <div class="card card-2">
                    <div class="card-content">
                        <h3 class="card-title">Panel 2</h3>
                    </div>
                </div>
            </swiper-slide>

            <swiper-slide class="stacked-slide">
                <div class="card card-3">
                    <div class="card-content">
                        <h3 class="card-title">Panel 3</h3>
                    </div>
                </div>
            </swiper-slide>
        </swiper>

        <div class="indicators">
            <span v-for="(i, index) in 3" :key="index" :class="{ active: currentIndex === index }" class="indicator"
                @click="slideTo(index)" data-pointer></span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCreative } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-creative'

let swiperInstance: any = null
const currentIndex = ref<number>(0)

const onSwiper = (swiper: any) => {
    swiperInstance = swiper
}

const onSlideChange = (swiper: any) => {
    currentIndex.value = swiper.activeIndex
}

const slideTo = (index: number) => {
    if (swiperInstance) {
        swiperInstance.slideTo(index)
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}

.stacked-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 1.75em;
}

.stacked-swiper {
    width: 100%;
    height: 100%;
    position: relative;
}

.stacked-slide {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.12);
    border-radius: 1.75em;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.card-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
}

.card-title {
    font-size: 3em;
    font-weight: 700;
    margin: 0 0 clamp(8px, 2%, 16px) 0;
    letter-spacing: -0.02em;
}

/* 指示器 */
.indicators {
    position: absolute;
    right: 1em;
    display: flex;
    gap: .6em;
    z-index: 100;
    padding: .8em .6em;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 1000px;
    flex-direction: column;
    transition: padding .3s, gap .3s;

    .indicator {
        width: .8em;
        height: .8em;
        border-radius: 1000px;
        background-color: rgba(255, 255, 255, 0.5);
        transition: width .3s, height .3s, background-color .3s;

        &.active {
            height: 1.8em;
            background-color: white;
        }
    }
}

.indicators:hover {
    gap: 1.2em;
    padding: 1.2em 1em;

    .indicator {
        width: 1.5em;
        height: 1.5em;

        &.active {
            height: 2.8em;
            background-color: white;
        }

        &:hover {
            background-color: rgba(255, 255, 255, 0.8);
        }
    }
}

html.dark-mode .stacked-wrapper {
    .card {
        background-color: #a3e9ff22;
    }

    .indicators {
        .indicator {
            background-color: #a3e9ff55;

            &.active {
                background-color: #78c6ff;
            }
        }
    }
}
</style>
