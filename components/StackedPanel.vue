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
                <div class="card">
                    <div class="equalizer">
                        <div class="equalizer-content">
                            <div v-for="(item, index) in equvolume" :key="index" class="equ-rangeinput">
                                <div class="vol-text">{{ valueToGain(item.value) }}</div>
                                <div class="rginput">
                                    <div class="vlprogress">
                                        <div class="progress" :style="{ height: (item.value / 24 * 100) + '%' }" />
                                    </div>
                                    <input type="range" min="0" max="24" step="1" v-model="item.value" @input="onEqualizerInput" />
                                </div>
                                <div class="feq-text">{{ item.text }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </swiper-slide>

            <swiper-slide class="stacked-slide">
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">Panel 2</h3>
                    </div>
                </div>
            </swiper-slide>

            <swiper-slide class="stacked-slide">
                <div class="card">
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
import { ref, computed, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCreative } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-creative'

// ============================================
// 类型定义
// ============================================
interface EqualizerBand {
    text: string;
    feq: number;
    value: number;
}

// ============================================
// Props 和 Emits
// ============================================
interface Props {
    modelValue?: EqualizerBand[];
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [
        { text: "31", feq: 31, value: 12 },
        { text: "62", feq: 62, value: 12 },
        { text: "125", feq: 125, value: 12 },
        { text: "250", feq: 250, value: 12 },
        { text: "500", feq: 500, value: 12 },
        { text: "1k", feq: 1000, value: 12 },
        { text: "2k", feq: 2000, value: 12 },
        { text: "4k", feq: 4000, value: 12 },
        { text: "8k", feq: 8000, value: 12 },
        { text: "16k", feq: 16000, value: 12 }
    ]
});

const emit = defineEmits<{
    'update:modelValue': [value: EqualizerBand[]];
    'change': [value: EqualizerBand[]];
}>();

// ============================================
// 响应式状态
// ============================================
let swiperInstance: any = null;
const currentIndex = ref<number>(0);

const equvolume = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

// ============================================
// 工具函数
// ============================================

const valueToGain = (value: number): number => {
    return value - 12;
};

const onEqualizerInput = () => {
    const newValue = [...equvolume.value];
    
    emit('update:modelValue', newValue);
    emit('change', newValue);
    
    // 保存到 localStorage
    try {
        localStorage.setItem('equalizerSettings', JSON.stringify(newValue));
    } catch (e) {
    }
};

const resetEqualizer = () => {
    const resetValue = equvolume.value.map(item => ({
        ...item,
        value: 12
    }));
    
    emit('update:modelValue', resetValue);
    emit('change', resetValue);
    
    console.log('[EQ] Reset to flat (0dB)');
};

// ============================================
// Swiper 控制
// ============================================

const onSwiper = (swiper: any) => {
    swiperInstance = swiper;
};

const onSlideChange = (swiper: any) => {
    currentIndex.value = swiper.activeIndex;
};

const slideTo = (index: number) => {
    if (swiperInstance) {
        swiperInstance.slideTo(index);
    }
};

// ============================================
// 生命周期
// ============================================

onMounted(() => {
    try {
        const saved = localStorage.getItem('equalizerSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            const restoredValue = equvolume.value.map((item, i) => ({
                ...item,
                value: parsed[i]?.value !== undefined ? parsed[i].value : 12
            }));
            
            emit('update:modelValue', restoredValue);
            emit('change', restoredValue);
        }
    } catch (e) { }
});

// ============================================
// 暴露方法
// ============================================
defineExpose({
    resetEqualizer,
    valueToGain
});
</script>

<style lang="scss">
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
    padding-right: 3em;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;

    .card-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;

        .card-title {
            font-size: 3em;
            font-weight: 700;
            margin: 0 0 clamp(8px, 2%, 16px) 0;
            letter-spacing: -0.02em;
            box-sizing: border-box;
        }
    }

    .equalizer {
        width: 100%;
        height: 100%;
        padding: 1.3em 0 1.25em 0;
        display: flex;
        box-sizing: border-box;
        justify-content: center;

        .equalizer-content {
            height: 100%;
            display: flex;
            box-sizing: border-box;

            .equ-rangeinput {
                height: 100%;
                width: 3em;
                display: flex;
                align-items: center;
                flex-direction: column;
                justify-content: space-between;

                .rginput {
                    width: 1.25em;
                    height: 72.5%;
                    display: flex;
                    align-items: center;
                    flex-direction: column-reverse;
                    position: relative;

                    .vlprogress {
                        width: 65%;
                        height: 100%;
                        transition: background-color .6s, width .3s;
                        border-radius: 100px;
                        overflow: hidden;
                        position: relative;
                        pointer-events: none;
                        display: flex;
                        flex-direction: column-reverse;
                        background-color: color-mix(in srgb, color-mix(in srgb, var(--lyntrix-color-high, #FFF), #FFF 20%), #000 15%);

                        .progress {
                            height: 0%;
                            width: 100%;
                            position: absolute;
                            border-radius: 100px;
                            transition: background-color .6s, height .25s ease, opacity .3s;
                            background-color: color-mix(in srgb, var(--lyntrix-color-high, #000), #000 50%);
                        }
                    }

                    &:active {
                        .vlprogress {
                            width: 100%;
                            transition: background-color .6s, width .5s .1s;

                            .progress {
                                transition: background-color 6s, height 0.1s ease;
                            }
                        }
                    }

                    input[type=range] {
                        appearance: slider-vertical;
                        margin: 0;
                        opacity: 0;
                        width: 100%;
                        height: 100%;
                        position: absolute;
                    }
                }

                .vol-text {
                    font-size: 1.35em;
                    margin-bottom: 0.15em;
                }

                .feq-text {
                    font-size: 1.35em;
                }
            }
        }
    }
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
    box-sizing: border-box;
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

    &:hover {
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
