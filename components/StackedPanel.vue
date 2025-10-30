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
                        <div class="ctrlbtns">
                            <button :class="{ active: eqcontrol }" @click="switcheqctrl" data-pointer>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"/></svg>
                            </button>
                            <button @click="resetEqualizer" style="padding: 1em;" data-pointer>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M534.6 182.6C547.1 170.1 547.1 149.8 534.6 137.3L470.6 73.3C461.4 64.1 447.7 61.4 435.7 66.4C423.7 71.4 416 83.1 416 96L416 128L256 128C150 128 64 214 64 320C64 337.7 78.3 352 96 352C113.7 352 128 337.7 128 320C128 249.3 185.3 192 256 192L416 192L416 224C416 236.9 423.8 248.6 435.8 253.6C447.8 258.6 461.5 255.8 470.7 246.7L534.7 182.7zM105.4 457.4C92.9 469.9 92.9 490.2 105.4 502.7L169.4 566.7C178.6 575.9 192.3 578.6 204.3 573.6C216.3 568.6 224 556.9 224 544L224 512L384 512C490 512 576 426 576 320C576 302.3 561.7 288 544 288C526.3 288 512 302.3 512 320C512 390.7 454.7 448 384 448L224 448L224 416C224 403.1 216.2 391.4 204.2 386.4C192.2 381.4 178.5 384.2 169.3 393.3L105.3 457.3z"/></svg>
                            </button>
                            <button @click="fastset('low')" data-pointer>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M256.2 140.6c-11 18.2-20.4 40.1-29.3 64.6c-9.2-27.9-19.8-57.4-32.9-84.7c2.4-4.5 4.9-8.9 7.5-13.2C226.3 66.4 263.3 32 320 32s93.7 34.4 118.6 75.4c23.8 39.2 40.3 90.2 55.2 136.5l.7 2.3c15.8 49.1 30.2 93.1 49.7 125.2C563 402.4 582.6 416 608 416c17.7 0 32 14.3 32 32s-14.3 32-32 32c-56.7 0-93.7-34.4-118.6-75.4c-23.8-39.2-40.3-90.2-55.2-136.5l-.7-2.3c-15.8-49.1-30.2-93.1-49.7-125.2C365 109.6 345.4 96 320 96s-45 13.6-63.8 44.6zM158.1 391.4c-2.4 4.5-4.9 8.9-7.5 13.2C125.7 445.6 88.7 480 32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32c25.4 0 45-13.6 63.8-44.6c11-18.2 20.4-40.1 29.3-64.6c9.2 27.9 19.8 57.4 32.9 84.7zm225.8-20c11-18.2 20.4-40.1 29.3-64.6c9.2 27.9 19.8 57.4 32.9 84.7c-2.4 4.5-4.9 8.9-7.5 13.2C413.7 445.6 376.7 480 320 480s-93.7-34.4-118.6-75.4c-23.8-39.2-40.3-90.2-55.2-136.5l0 0-.7-2.3c-15.8-49.1-30.2-93.1-49.7-125.2C77 109.6 57.4 96 32 96C14.3 96 0 81.7 0 64S14.3 32 32 32c56.7 0 93.7 34.4 118.6 75.4c23.8 39.2 40.3 90.2 55.2 136.5l.7 2.3c15.8 49.1 30.2 93.1 49.7 125.2C275 402.4 294.6 416 320 416s45-13.6 63.8-44.6zM544.2 140.6c-11 18.2-20.4 40.1-29.3 64.6c-9.2-27.9-19.8-57.5-32.9-84.7c2.4-4.5 4.9-8.9 7.5-13.2C514.3 66.4 551.3 32 608 32c17.7 0 32 14.3 32 32s-14.3 32-32 32c-25.4 0-45 13.6-63.8 44.6z"/></svg>
                            </button>
                        </div>
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
import { ref, computed } from 'vue'
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

const eqcontrol = defineModel<boolean>('eqcontrol')

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

    try {
        localStorage.setItem('equalizerSettings', JSON.stringify(resetValue));
    } catch (e) {
    }
};

const fastset = (pretype:string) => {
    const equconfig: Record<string, EqualizerBand[]> = {
        low: [
            { text: "31", feq: 31, value: 22 },
            { text: "62", feq: 62, value: 21 },
            { text: "125", feq: 125, value: 19 },
            { text: "250", feq: 250, value: 12 },
            { text: "500", feq: 500, value: 2 },
            { text: "1k", feq: 1000, value: 4 },
            { text: "2k", feq: 2000, value: 5 },
            { text: "4k", feq: 4000, value: 8 },
            { text: "8k", feq: 8000, value: 7 },
            { text: "16k", feq: 16000, value: 5 }
        ],
        standard: [
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
        ],
    }

    const presetValue = equvolume.value.map((item, i) => ({
        ...item,
        value: equconfig[pretype]?.[i]?.value !== undefined ? equconfig[pretype][i].value : 12
    }));

    emit('update:modelValue', presetValue);
    emit('change', presetValue);

    try {
        localStorage.setItem('equalizerSettings', JSON.stringify(presetValue));
    } catch (e) {
    }
}

const switcheqctrl = () => {
    const newValue = !eqcontrol.value
    eqcontrol.value = newValue
    try {
        localStorage.setItem('equalizerEnable', String(newValue));
    } catch (e) { }
}
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

            const eqenable = localStorage.getItem('equalizerEnable');

            if (eqenable === "true") {
                eqcontrol.value = true
            }
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
        padding: 1.25em;
        display: flex;
        box-sizing: border-box;
        justify-content: space-between;

        .ctrlbtns {
            height: 100%;
            width: 5.25em;
            padding: .5em;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;

            button {
                box-sizing: border-box;
                border-radius: .8em;
                border: none;
                margin: 0;
                padding: 1.1em;
                height: 4.25em;
                font-size: 1em;
                width: 100%;
                box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
                transition: background-color .6s, fill .6s, transform .3s, box-shadow .3s;
                fill: color-mix(in srgb, var(--lyntrix-color-high, #FFF), #000000 50%);
                background-color: color-mix(in srgb, var(--lyntrix-color-high, #FFF), #FFFFFF 75%);

                svg {
                    width: 100%;
                    height: 100%;
                }

                &.active {
                    fill: color-mix(in srgb, var(--lyntrix-color-high, #FFF), #074e78 80%);
                    box-shadow: 0px 0px 15px rgba(10, 122, 194, 0.5);
                    background-color: color-mix(in srgb, var(--lyntrix-color-high, #FFF), #ade1ff 80%);
                }

                &:active {
                    transform: scale(.925);
                }
            }
        }

        .equalizer-content {
            height: 100%;
            display: flex;
            box-sizing: border-box;

            .equ-rangeinput {
                height: 100%;
                width: 3.45em;
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
                        background-color: color-mix(in srgb, var(--lyntrix-color-high, #fff), #fff 75%);

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
                        writing-mode: vertical-lr;
                        direction: rtl;
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
        transition: width .3s, height .3s, background-color .3s, transform .3s;

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

            &:active {
                transform: scale(0.85);
            }
        }
    }
}

html.dark-mode .stacked-wrapper {
    .card {
        background-color: #a3e9ff22;

        .equalizer {
            .ctrlbtns button {
                fill: #78c6ff;
                background-color: #9ae8ff47;

                &.active {
                    fill: #3069f6;
                    background-color: #94bdffcf;
                }
            }

            .equalizer-content .equ-rangeinput .rginput .vlprogress {
                background-color: #a3e9ff55;

                .progress {
                    background-color: #a3e9ff;
                }
            }
        }
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
