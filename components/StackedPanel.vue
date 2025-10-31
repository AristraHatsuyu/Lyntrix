<template>
    <div class="stacked-wrapper" @mousedown.stop @dblclick.stop>
        <div class="indicators bottom" :class="{ inlist: pageIndex === 1 }">
            <span v-for="(i, index) in Math.ceil(listTracks.length / 4)" :key="index"
                :class="{ active: listIndex === index }" class="indicator" @click="listSlideTo(index)"
                data-pointer></span>
        </div>
        <div class="indicators" :class="{ inlist: pageIndex === 1 }">
            <span v-for="(i, index) in 3" :key="index" :class="{ active: pageIndex === index }" class="indicator"
                @click="slideTo(index)" data-pointer></span>
        </div>

        <swiper :slidesPerView="1" :direction="'vertical'" :allowTouchMove="true" :speed="400" :effect="'creative'"
            :modules="[EffectCreative]" :creativeEffect="{
                prev: { translate: [0, '10%', -1], opacity: 0, scale: 0.95 },
                next: { translate: [0, '20%', 0], scale: 1, opacity: 0 }
            }" @swiper="onSwiper" @slideChange="onSlideChange" class="stacked-swiper">

            <swiper-slide class="stacked-slide">
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">Panel 1</h3>
                    </div>
                </div>
            </swiper-slide>

            <swiper-slide class="stacked-slide">
                <div class="card">
                    <div class="queue-card">
                        <div class="queue-left">
                            <button @click="$emit('cycle-mode')" class="modeswitch">
                                <Transition name="fadee">
                                    <svg v-if="props.mode === 'repeat-all'" xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 640">
                                        <path
                                            d="M534.6 182.6C547.1 170.1 547.1 149.8 534.6 137.3L470.6 73.3C461.4 64.1 447.7 61.4 435.7 66.4C423.7 71.4 416 83.1 416 96L416 128L256 128C150 128 64 214 64 320C64 337.7 78.3 352 96 352C113.7 352 128 337.7 128 320C128 249.3 185.3 192 256 192L416 192L416 224C416 236.9 423.8 248.6 435.8 253.6C447.8 258.6 461.5 255.8 470.7 246.7L534.7 182.7zM105.4 457.4C92.9 469.9 92.9 490.2 105.4 502.7L169.4 566.7C178.6 575.9 192.3 578.6 204.3 573.6C216.3 568.6 224 556.9 224 544L224 512L384 512C490 512 576 426 576 320C576 302.3 561.7 288 544 288C526.3 288 512 302.3 512 320C512 390.7 454.7 448 384 448L224 448L224 416C224 403.1 216.2 391.4 204.2 386.4C192.2 381.4 178.5 384.2 169.3 393.3L105.3 457.3z" />
                                    </svg>
                                    <svg v-else-if="props.mode === 'repeat-one'" style="padding: 1.25rem;"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path
                                            d="M264 320C277.3 320 288 309.3 288 296v-80c0-7.719-3.703-14.97-9.969-19.47C271.8 192 263.7 190.8 256.4 193.2l-24 8C219.8 205.4 213 219 217.2 231.6C220.6 241.7 229.1 248 240 248v48C240 309.3 250.8 320 264 320zM480 256c-17.67 0-32 14.31-32 32c0 52.94-43.06 96-96 96H192L192 344c0-9.469-5.578-18.06-14.23-21.94c-8.641-3.781-18.75-2.219-25.83 4.094l-80 72C66.89 402.7 64 409.2 64 416s2.891 13.28 7.938 17.84l80 72C156.4 509.9 162.2 512 168 512c3.312 0 6.615-.6875 9.756-2.062C186.4 506.1 192 497.5 192 488L192 448h160c88.22 0 160-71.78 160-160C512 270.3 497.7 256 480 256zM160 128h159.1L320 168c0 9.469 5.578 18.06 14.23 21.94C337.4 191.3 340.7 192 343.1 192c5.812 0 11.57-2.125 16.07-6.156l80-72C445.1 109.3 448 102.8 448 95.1s-2.891-13.28-7.938-17.84l-80-72C353-.1562 342.9-1.719 334.2 2.062C325.6 5.938 319.1 14.53 319.1 24L320 64H160C71.78 64 0 135.8 0 224c0 17.69 14.33 32 32 32s32-14.31 32-32C64 171.1 107.1 128 160 128z" />
                                    </svg>
                                    <svg v-else-if="props.mode === 'shuffle'" xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 640">
                                        <path
                                            d="M467.8 98.4C479.8 93.4 493.5 96.2 502.7 105.3L566.7 169.3C572.7 175.3 576.1 183.4 576.1 191.9C576.1 200.4 572.7 208.5 566.7 214.5L502.7 278.5C493.5 287.7 479.8 290.4 467.8 285.4C455.8 280.4 448 268.9 448 256L448 224L416 224C405.9 224 396.4 228.7 390.4 236.8L358 280L318 226.7L339.2 198.4C357.3 174.2 385.8 160 416 160L448 160L448 128C448 115.1 455.8 103.4 467.8 98.4zM218 360L258 413.3L236.8 441.6C218.7 465.8 190.2 480 160 480L96 480C78.3 480 64 465.7 64 448C64 430.3 78.3 416 96 416L160 416C170.1 416 179.6 411.3 185.6 403.2L218 360zM502.6 534.6C493.4 543.8 479.7 546.5 467.7 541.5C455.7 536.5 448 524.9 448 512L448 480L416 480C385.8 480 357.3 465.8 339.2 441.6L185.6 236.8C179.6 228.7 170.1 224 160 224L96 224C78.3 224 64 209.7 64 192C64 174.3 78.3 160 96 160L160 160C190.2 160 218.7 174.2 236.8 198.4L390.4 403.2C396.4 411.3 405.9 416 416 416L448 416L448 384C448 371.1 455.8 359.4 467.8 354.4C479.8 349.4 493.5 352.2 502.7 361.3L566.7 425.3C572.7 431.3 576.1 439.4 576.1 447.9C576.1 456.4 572.7 464.5 566.7 470.5L502.7 534.5z" />
                                    </svg>
                                </Transition>
                            </button>
                            <button @click="listprev" :disabled="listIndex === 0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                    <path
                                        d="M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z" />
                                </svg>
                            </button>
                            <button @click="listnext" :disabled="listIndex === Math.ceil(listTracks.length / 4) - 1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                    <path
                                        d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z" />
                                </svg>
                            </button>
                        </div>

                        <div class="queue-right">
                            <swiper class="vertical-swiper" :direction="'vertical'" :mousewheel="true"
                                :modules="[Mousewheel]" @swiper="onSwiperList" @slideChange="onListSlideChange"
                                :allowTouchMove="false">
                                <swiper-slide v-for="i in Math.ceil(listTracks.length / 4)" class="vertical-slide"
                                    :key="i">
                                    <ul class="grid grid-2col">
                                        <li v-for="(item, index) in listTracks.slice((i - 1) * 4, (i - 1) * 4 + 4)"
                                            :key="index" :class="{ active: item.__index === props.currentIndex }"
                                            @click="$emit('play-item', item.__index)"
                                            @dblclick="$emit('play-item', item.__index)">
                                            <CachedArtwork class="thumb" :src="item.image"
                                                :eager="i < eagerAboveTheFold || Math.abs(i - props.currentIndex) <= eagerAroundCurrent" />
                                            <div class="meta">
                                                <div class="title">{{ item.title }}</div>
                                                <div class="author">{{ item.author }}</div>
                                            </div>
                                        </li>
                                    </ul>
                                </swiper-slide>
                            </swiper>
                        </div>
                    </div>
                </div>
            </swiper-slide>

            <swiper-slide class="stacked-slide">
                <div class="card">
                    <div class="equalizer">
                        <div class="ctrlbtns">
                            <button :class="{ active: eqcontrol }" @click="switcheqctrl" data-pointer>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path
                                        d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z" />
                                </svg>
                            </button>
                            <button @click="resetEqualizer" style="padding: 1em;" data-pointer>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                    <path
                                        d="M534.6 182.6C547.1 170.1 547.1 149.8 534.6 137.3L470.6 73.3C461.4 64.1 447.7 61.4 435.7 66.4C423.7 71.4 416 83.1 416 96L416 128L256 128C150 128 64 214 64 320C64 337.7 78.3 352 96 352C113.7 352 128 337.7 128 320C128 249.3 185.3 192 256 192L416 192L416 224C416 236.9 423.8 248.6 435.8 253.6C447.8 258.6 461.5 255.8 470.7 246.7L534.7 182.7zM105.4 457.4C92.9 469.9 92.9 490.2 105.4 502.7L169.4 566.7C178.6 575.9 192.3 578.6 204.3 573.6C216.3 568.6 224 556.9 224 544L224 512L384 512C490 512 576 426 576 320C576 302.3 561.7 288 544 288C526.3 288 512 302.3 512 320C512 390.7 454.7 448 384 448L224 448L224 416C224 403.1 216.2 391.4 204.2 386.4C192.2 381.4 178.5 384.2 169.3 393.3L105.3 457.3z" />
                                </svg>
                            </button>
                            <button @click="fastset('low')" data-pointer>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                                    <path
                                        d="M256.2 140.6c-11 18.2-20.4 40.1-29.3 64.6c-9.2-27.9-19.8-57.4-32.9-84.7c2.4-4.5 4.9-8.9 7.5-13.2C226.3 66.4 263.3 32 320 32s93.7 34.4 118.6 75.4c23.8 39.2 40.3 90.2 55.2 136.5l.7 2.3c15.8 49.1 30.2 93.1 49.7 125.2C563 402.4 582.6 416 608 416c17.7 0 32 14.3 32 32s-14.3 32-32 32c-56.7 0-93.7-34.4-118.6-75.4c-23.8-39.2-40.3-90.2-55.2-136.5l-.7-2.3c-15.8-49.1-30.2-93.1-49.7-125.2C365 109.6 345.4 96 320 96s-45 13.6-63.8 44.6zM158.1 391.4c-2.4 4.5-4.9 8.9-7.5 13.2C125.7 445.6 88.7 480 32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32c25.4 0 45-13.6 63.8-44.6c11-18.2 20.4-40.1 29.3-64.6c9.2 27.9 19.8 57.4 32.9 84.7zm225.8-20c11-18.2 20.4-40.1 29.3-64.6c9.2 27.9 19.8 57.4 32.9 84.7c-2.4 4.5-4.9 8.9-7.5 13.2C413.7 445.6 376.7 480 320 480s-93.7-34.4-118.6-75.4c-23.8-39.2-40.3-90.2-55.2-136.5l0 0-.7-2.3c-15.8-49.1-30.2-93.1-49.7-125.2C77 109.6 57.4 96 32 96C14.3 96 0 81.7 0 64S14.3 32 32 32c56.7 0 93.7 34.4 118.6 75.4c23.8 39.2 40.3 90.2 55.2 136.5l.7 2.3c15.8 49.1 30.2 93.1 49.7 125.2C275 402.4 294.6 416 320 416s45-13.6 63.8-44.6zM544.2 140.6c-11 18.2-20.4 40.1-29.3 64.6c-9.2-27.9-19.8-57.5-32.9-84.7c2.4-4.5 4.9-8.9 7.5-13.2C514.3 66.4 551.3 32 608 32c17.7 0 32 14.3 32 32s-14.3 32-32 32c-25.4 0-45 13.6-63.8 44.6z" />
                                </svg>
                            </button>
                        </div>

                        <div class="equalizer-content">
                            <div v-for="(item, index) in equvolume" :key="index" class="equ-rangeinput">
                                <div class="vol-text">{{ valueToGain(item.value) }}</div>
                                <div class="rginput">
                                    <div class="vlprogress">
                                        <div class="progress" :style="{ height: (item.value / 24 * 100) + '%' }" />
                                    </div>
                                    <input type="range" min="0" max="24" step="1" v-model="item.value"
                                        @input="onEqualizerInput" />
                                </div>
                                <div class="feq-text">{{ item.text }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </swiper-slide>
        </swiper>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCreative, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-creative'

import { useArtworkCache } from '@/composables/audio/useArtworkCache'

// ========================
// 类型
// ========================
interface EqualizerBand { text: string; feq: number; value: number; }
interface TrackItem { title: string; author: string; file: string; image?: string; }

// ========================
// Props / Emits / v-model
// ========================
interface Props {
    modelValue?: EqualizerBand[];
    tracks?: TrackItem[];
    currentIndex?: number;
    mode?: 'repeat-all' | 'repeat-one' | 'shuffle';
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
    ],
    tracks: () => [],
    currentIndex: 0,
    mode: 'repeat-all'
});

const emit = defineEmits<{
    'update:modelValue': [value: EqualizerBand[]];
    'change': [value: EqualizerBand[]];
    // 播放列表
    'play-item': [index: number];
    'cycle-mode': [];
}>()

// ========================
// Swiper 控制
// ========================
let swiperInstance: any = null
let swiperListInstance: any = null
const pageIndex = ref<number>(0)
const listIndex = ref<number>(0)
const onSwiper = (swiper: any) => { swiperInstance = swiper }
const onSwiperList = (swiper: any) => { swiperListInstance = swiper }
const onSlideChange = (swiper: any) => { pageIndex.value = swiper.activeIndex }
const slideTo = (index: number) => { swiperInstance?.slideTo(index) }
const listSlideTo = (index: number) => { swiperListInstance?.slideTo(index) }
const listnext = () => { swiperListInstance.slideNext() }
const listprev = () => { swiperListInstance.slidePrev() }
const onListSlideChange = (swiper: any) => { listIndex.value = swiper.activeIndex }

// ========================
// 均衡器逻辑
// ========================
const equvolume = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
const valueToGain = (value: number) => value - 12

const onEqualizerInput = () => {
    const newValue = [...equvolume.value]
    emit('update:modelValue', newValue)
    emit('change', newValue)
    try { localStorage.setItem('equalizerSettings', JSON.stringify(newValue)) } catch { }
}
const resetEqualizer = () => {
    const resetValue = equvolume.value.map(item => ({ ...item, value: 12 }))
    emit('update:modelValue', resetValue)
    emit('change', resetValue)
    try { localStorage.setItem('equalizerSettings', JSON.stringify(resetValue)) } catch { }
}
const fastset = (pretype: string) => {
    const equconfig: Record<string, EqualizerBand[]> = {
        low: [
            { text: "31", feq: 31, value: 22 }, { text: "62", feq: 62, value: 21 },
            { text: "125", feq: 125, value: 19 }, { text: "250", feq: 250, value: 12 },
            { text: "500", feq: 500, value: 2 }, { text: "1k", feq: 1000, value: 4 },
            { text: "2k", feq: 2000, value: 5 }, { text: "4k", feq: 4000, value: 8 },
            { text: "8k", feq: 8000, value: 7 }, { text: "16k", feq: 16000, value: 5 }
        ],
        standard: [
            { text: "31", feq: 31, value: 12 }, { text: "62", feq: 62, value: 12 },
            { text: "125", feq: 125, value: 12 }, { text: "250", feq: 250, value: 12 },
            { text: "500", feq: 500, value: 12 }, { text: "1k", feq: 1000, value: 12 },
            { text: "2k", feq: 2000, value: 12 }, { text: "4k", feq: 4000, value: 12 },
            { text: "8k", feq: 8000, value: 12 }, { text: "16k", feq: 16000, value: 12 }
        ],
    }
    const presetValue = equvolume.value.map((item, i) => ({
        ...item,
        value: equconfig[pretype]?.[i]?.value ?? 12
    }))
    emit('update:modelValue', presetValue)
    emit('change', presetValue)
    try { localStorage.setItem('equalizerSettings', JSON.stringify(presetValue)) } catch { }
}
const switcheqctrl = () => {
    const newValue = !eqcontrol.value
    eqcontrol.value = newValue
    try { localStorage.setItem('equalizerEnable', String(newValue)) } catch { }
}

// ========================
// 播放列表：数据 + 图标
// ========================
const listTracks = computed(() =>
    (props.tracks ?? []).map((t, idx) => ({ ...t, __index: idx }))
)

// ========================
// 缩略图缓存 + 懒加载
// ========================
const eagerAboveTheFold = 8
const eagerAroundCurrent = 2
const artwork = useArtworkCache()

function primeAll(tracks: TrackItem[]) {
    artwork.primeFromPlaylist(tracks)
}
async function ensureNeighbors(center: number) {
    const n = props.tracks?.length ?? 0
    if (!n) return
    const span = Math.max(1, eagerAroundCurrent)
    for (let d = -span; d <= span; d++) {
        const j = (center + d + n) % n
        const src = props.tracks?.[j]?.image
        if (src) void artwork.ensure(src)
    }
}

onMounted(() => {
    try {
        const saved = localStorage.getItem('equalizerSettings')
        if (saved) {
            const parsed = JSON.parse(saved)
            const restoredValue = equvolume.value.map((item, i) => ({
                ...item,
                value: parsed[i]?.value !== undefined ? parsed[i].value : 12
            }))
            emit('update:modelValue', restoredValue)
            emit('change', restoredValue)
            const eqenable = localStorage.getItem('equalizerEnable')
            if (eqenable === 'true') eqcontrol.value = true
        }
    } catch { }

    if (props.tracks?.length) {
        primeAll(props.tracks)
        ensureNeighbors(props.currentIndex ?? 0)
    }
})

watch(() => props.tracks, (t) => { if (t?.length) primeAll(t) })
watch(() => props.currentIndex, (i) => { if (typeof i === 'number') ensureNeighbors(i) })
</script>

<style lang="scss">
$content-bg: color-mix(in srgb, var(--lyntrix-color-high, #FFF), #FFFFFF 75%);
$content-br: 0.8em;


.stacked-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 1.75em;

    &:has(> .indicators:hover)>.indicators.bottom {
        filter: blur(5px);
    }

    &:has(> .indicators.bottom:hover)>.indicators {
        filter: blur(5px);

        &.bottom {
            filter: none;
        }
    }
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
    z-index: 10;
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

    .queue-card {
        display: flex;
        height: 100%;
        width: 100%;
        padding: 0 1.25em;
        align-items: center;
        justify-content: space-between;
        transition: filter .3s, transform .3s;

        .queue-left {
            height: 100%;
            width: 5.25em;
            padding: 1.75em 0.5em;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;

            button {
                box-sizing: border-box;
                border-radius: $content-br;
                border: none;
                margin: 0;
                height: 4.25em;
                font-size: 1em;
                width: 100%;
                padding: 0;
                position: relative;
                box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
                transition: background-color 0.6s, opacity 0.3s, transform 0.3s, filter 0.3s, fill 0.3s;
                fill: color-mix(in srgb, var(--lyntrix-color-high, #FFF), #000000 50%);
                background-color: $content-bg;

                svg {
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    padding: .9em;
                    box-sizing: border-box;
                    position: absolute;
                }

                &:active {
                    transform: scale(.925);
                }

                &:disabled {
                    opacity: 0.5;
                    transform: none;
                }
            }
        }

        .queue-right {
            width: 82.5%;
            height: 100%;
            position: relative;

            .vertical-swiper {
                width: 100%;
                height: 100%;
                overflow: visible;
                position: relative;

                .vertical-slide {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    overflow: visible;
                    align-items: center;
                    justify-content: center;
                    transition: transform .3s;

                    .grid {
                        display: grid;
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        gap: 1em;

                        &.grid-2col {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }

                        li {
                            display: grid;
                            grid-template-columns: 56px 1fr;
                            gap: .5em;
                            align-items: center;
                            padding: 1em;
                            border-radius: $content-br;
                            background-color: $content-bg;
                            transition: background-color .3s, box-shadow .3s;
                            box-sizing: border-box;
                            cursor: pointer;

                            &.active {
                                box-shadow: 0px 0px 15px rgba(10, 122, 194, 0.5);
                                background-color: color-mix(in srgb, var(--lyntrix-color-high, #FFF), #ade1ff 80%);
                            }

                            .thumb {
                                width: 5.25em;
                                height: 5.25em;
                                overflow: hidden;
                                border-radius: .75em;
                                box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);

                                img {
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                    display: block;
                                }
                            }

                            .meta {
                                width: 8em;

                                .title {
                                    font-weight: 600;
                                    font-size: 1.3em;
                                    line-height: 1.2;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }

                                .author {
                                    opacity: .7;
                                    font-size: 1.15em;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    .equalizer {
        width: 100%;
        height: 100%;
        padding: 1.25em;
        display: flex;
        box-sizing: border-box;
        justify-content: space-between;
        transition: filter .3s, transform .3s;

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
                background-color: $content-bg;

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
    top: 6.5em;
    z-index: 100;
    padding: .8em .6em;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 1000px;
    flex-direction: column;
    box-sizing: border-box;
    transition: padding .3s, gap .3s, top .3s, opacity .3s, bottom .3s, filter .3s;

    &.bottom {
        top: auto;
        opacity: 0;
        bottom: 6.5em;
        filter: blur(10px);
    }

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
        top: 4.85em;

        &~.swiper .stacked-slide .queue-card,
        &~.swiper .stacked-slide .equalizer {
            filter: blur(5px);
            transform: scale(.925);
        }


        &.bottom~.swiper .stacked-slide.swiper-slide-active .queue-card,
        &.bottom~.swiper .stacked-slide.swiper-slide-active .equalizer {
            filter: none;
            transform: none;

            .queue-left .modeswitch {
                filter: blur(5px);
            }

            .queue-right .vertical-swiper .vertical-slide {
                transform: scale(.925);
            }
        }

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

    &.inlist {
        top: 1.75em;

        &.bottom {
            top: auto;
            opacity: 1;
            bottom: 1.75em;
            filter: none;
        }
    }
}

html.dark-mode .stacked-wrapper {
    .card {
        background-color: #a3e9ff22;

        .queue-card {
            .queue-left button {
                fill: #78c6ff;
                background-color: #9ae8ff47;
            }

            .queue-right .vertical-swiper .vertical-slide .grid li {
                background-color: #9ae8ff47;

                &.active {
                    background-color: #658dced1;
                }
            }
        }

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
