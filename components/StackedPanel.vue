<template>
    <div class="stacked-wrapper" @mousedown.stop @dblclick.stop>
        <div v-if="Math.ceil(listTracks.length / 4) > 1" class="indicators bottom"
            :class="{ inlist: pageIndex === 1, totop: Math.ceil(listTracks.length / 4) > 1 }">
            <span v-for="(i, index) in Math.ceil(listTracks.length / 4)" :key="index"
                :class="{ active: listIndex === index }" class="indicator" @click="listSlideTo(index)"
                data-pointer></span>
        </div>
        <div class="indicators" :class="{ inlist: pageIndex === 1, totop: Math.ceil(listTracks.length / 4) > 1 }">
            <span v-for="(i, index) in (props.tracks[props.currentIndex].lyrics ? 3 : 2)" :key="index"
                :class="{ active: props.tracks[props.currentIndex].lyrics ? pageIndex === index : pageIndex === index + 1 }"
                class="indicator" @click="slideTo(index)" data-pointer></span>
        </div>

        <swiper :slidesPerView="1" :direction="'vertical'" :allowTouchMove="true" :effect="'creative'"
            :modules="[EffectCreative]" :creativeEffect="{
                prev: { translate: [0, '10%', -1], opacity: 0, scale: 0.95 },
                next: { translate: [0, '20%', 0], scale: 1, opacity: 0 }
            }" @swiper="onSwiper" @slideChange="onSlideChange" class="stacked-swiper">
            <swiper-slide class="stacked-slide">
                <div class="card">
                    <div class="lyrics-card">
                        <swiper class="lyrics-swiper" :class="{ change: inswitchlr }" :direction="'vertical'"
                            :mousewheel="true" :modules="[Mousewheel]" :speed="750" :slidesPerView="'auto'"
                            :freeMode="{ enabled: true, sticky: true }" :observeParents="true"
                            :observeSlideChildren="true" :roundLengths="true" :watchSlidesProgress="true"
                            @swiper="onLyricsSwiper">
                            <template v-if="hasLyrics">
                                <swiper-slide class="lyrics-slide first"
                                    :class="{ show: firstwait && activeLines[0].t > props.currentTime + 1 && activeLines[0].t > 5, playing: isPlaying }">
                                    <div class="lyrics-empty">
                                        <div class="dot-group">
                                            <span class="dot"
                                                :class="{ current: activeLines[0].t / 4 < props.currentTime }"
                                                :style="{ transitionDuration: `${Math.round(activeLines[0].t * 1000 / 4)}ms` }"></span>
                                            <span class="dot"
                                                :class="{ current: activeLines[0].t * 2 / 4 < props.currentTime }"
                                                :style="{ transitionDuration: `${Math.round(activeLines[0].t * 1000 / 4)}ms` }"></span>
                                            <span class="dot"
                                                :class="{ current: activeLines[0].t * 3 / 4 < props.currentTime }"
                                                :style="{ transitionDuration: `${Math.round(activeLines[0].t * 1000 / 4)}ms` }"></span>
                                        </div>
                                    </div>
                                </swiper-slide>
                                <swiper-slide v-for="(line, idx) in activeLines" :key="idx" class="lyrics-slide"
                                    @click.stop="line.main != '' ? onClickLyric(idx, line.t) : ''" :class="{
                                        active: idx === activeLineIndex,
                                        next: idx === activeLineIndex + 1,
                                        prev: idx === activeLineIndex - 1,
                                        inline: activeLines[0].t > 5 ? activeLines[0].t < props.currentTime + 1 : true,
                                        empty: line.main == '',
                                        playing: isPlaying,
                                        right: isLineRight(line)
                                    }" data-pointer>
                                    <div class="lyrics-content" v-if="line.main != ''">
                                        <div v-if="line.spans?.length" class="lyrics-text wordprog">
                                            <div v-for="(wg, wi) in line.spans" :key="wi">
                                                <span v-if="!wg.fx?.highlight" class="wg" :class="wordClass(wg)"
                                                    :style="wordStyle(wg)">{{ wg.tx }}</span>
                                                <span v-else v-for="(item, index) in wg.tx" class="wg fx" :key="index"
                                                    :class="wordClass(wg)" :style="wordfxStyle(wg, index)">
                                                    {{ item }}
                                                </span>
                                            </div>
                                        </div>
                                        <div v-else class="lyrics-text">{{ wrapDisplay(line.main) }}</div>
                                    </div>
                                    <div class="lyrics-empty" v-else>
                                        <div class="dot-group">
                                            <span class="dot"
                                                :class="{ current: line.t + (activeLines[idx + 1].t - line.t) / 4 < props.currentTime }"
                                                :style="{ transitionDuration: `${Math.round(line.t + (activeLines[idx + 1].t - line.t) * 1000 / 4)}ms` }"></span>
                                            <span class="dot"
                                                :class="{ current: line.t + (activeLines[idx + 1].t - line.t) * 2 / 4 < props.currentTime }"
                                                :style="{ transitionDuration: `${Math.round(line.t + (activeLines[idx + 1].t - line.t) * 1000 / 4)}ms` }"></span>
                                            <span class="dot"
                                                :class="{ current: line.t + (activeLines[idx + 1].t - line.t) * 3 / 4 < props.currentTime }"
                                                :style="{ transitionDuration: `${Math.round(line.t + (activeLines[idx + 1].t - line.t) * 1000 / 4)}ms` }"></span>
                                        </div>
                                    </div>
                                </swiper-slide>
                                <swiper-slide style="height: 12.5em;">
                                </swiper-slide>
                            </template>
                            <template v-else>
                                <swiper-slide class="lyrics-slide">
                                </swiper-slide>
                            </template>
                        </swiper>
                    </div>
                </div>
            </swiper-slide>

            <swiper-slide class="stacked-slide">
                <div class="card">
                    <div class="queue-card">
                        <div class="queue-left">
                            <button @click="$emit('cycle-mode')" class="modeswitch" data-pointer>
                                <Transition name="fadee">
                                    <svg v-if="props.mode === 'repeat-all'" xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 640">
                                        <path
                                            d="M534.6 182.6C547.1 170.1 547.1 149.8 534.6 137.3L470.6 73.3C461.4 64.1 447.7 61.4 435.7 66.4C423.7 71.4 416 83.1 416 96L416 128L256 128C150 128 64 214 64 320C64 337.7 78.3 352 96 352C113.7 352 128 337.7 128 320C128 249.3 185.3 192 256 192L416 192L416 224C416 236.9 423.8 248.6 435.8 253.6C447.8 258.6 461.5 255.8 470.7 246.7L534.7 182.7zM105.4 457.4C92.9 469.9 92.9 490.2 105.4 502.7L169.4 566.7C178.6 575.9 192.3 578.6 204.3 573.6C216.3 568.6 224 556.9 224 544L224 512L384 512C490 512 576 426 576 320C576 302.3 561.7 288 544 288C526.3 288 512 302.3 512 320C512 390.7 454.7 448 384 448L224 448L224 416C224 403.1 216.2 391.4 204.2 386.4C192.2 381.4 178.5 384.2 169.3 393.3L105.3 457.3z" />
                                    </svg>
                                    <svg v-else-if="props.mode === 'repeat-one'" style="padding: 1.45rem;"
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
                            <button @click="listprev" :disabled="listIndex === 0" :data-pointer="listIndex !== 0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                    <path
                                        d="M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z" />
                                </svg>
                            </button>
                            <button @click="listnext" :disabled="listIndex === Math.ceil(listTracks.length / 4) - 1"
                                :data-pointer="listIndex !== Math.ceil(listTracks.length / 4) - 1">
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
                                    <ul class="grid"
                                        :class="{ 'grid-2col': listTracks.slice((i - 1) * 4, (i - 1) * 4 + 4).length > 1 }">
                                        <li v-for="(item, index) in listTracks.slice((i - 1) * 4, (i - 1) * 4 + 4)"
                                            :key="index" :class="{ active: item.__index === props.currentIndex }"
                                            @click="$emit('play-item', item.__index)"
                                            @dblclick="$emit('play-item', item.__index)" data-pointer>
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
                                        d="M129.9 292.5C143.2 199.5 223.3 128 320 128C373 128 421 149.5 455.8 184.2C456 184.4 456.2 184.6 456.4 184.8L464 192L416.1 192C398.4 192 384.1 206.3 384.1 224C384.1 241.7 398.4 256 416.1 256L544.1 256C561.8 256 576.1 241.7 576.1 224L576.1 96C576.1 78.3 561.8 64 544.1 64C526.4 64 512.1 78.3 512.1 96L512.1 149.4L500.8 138.7C454.5 92.6 390.5 64 320 64C191 64 84.3 159.4 66.6 283.5C64.1 301 76.2 317.2 93.7 319.7C111.2 322.2 127.4 310 129.9 292.6zM573.4 356.5C575.9 339 563.7 322.8 546.3 320.3C528.9 317.8 512.6 330 510.1 347.4C496.8 440.4 416.7 511.9 320 511.9C267 511.9 219 490.4 184.2 455.7C184 455.5 183.8 455.3 183.6 455.1L176 447.9L223.9 447.9C241.6 447.9 255.9 433.6 255.9 415.9C255.9 398.2 241.6 383.9 223.9 383.9L96 384C87.5 384 79.3 387.4 73.3 393.5C67.3 399.6 63.9 407.7 64 416.3L65 543.3C65.1 561 79.6 575.2 97.3 575C115 574.8 129.2 560.4 129 542.7L128.6 491.2L139.3 501.3C185.6 547.4 249.5 576 320 576C449 576 555.7 480.6 573.4 356.5z" />
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
                                        @input="onEqualizerInput"
                                        @wheel.prevent="item.value = Math.min(24, Math.max(0, Math.round(item.value + ($event.deltaY < 0 ? -1 : 1) * ($event.shiftKey ? 10 : 1) * 0.56)))" />
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCreative, Mousewheel } from 'swiper/modules'
import { useArtworkCache } from '@/composables/audio/useArtworkCache'
import 'swiper/css/effect-creative'
import 'swiper/css'

/* =======================
 * Types
 * ======================= */
interface EqualizerBand { text: string; feq: number; value: number; }
interface TrackItem { title: string; author: string; file: string; image?: string; lyrics?: string }

/** Support Lyntrics */
type WordSpan = {
    b: number;              // Begin Seconds
    e: number;              // End Seconds
    tx: string;             // Display Text
    fx?: {
        highlight?: boolean;          // text-shadow opacity [0..1]
        dir?: 'to right' | 'to left';
    }
}
type LyricLine = { t: number; raw: string; main: string; spans?: WordSpan[]; e?: number, ag?: string; }
type ParsedLyrics = { meta: { ti?: string; ar?: string; al?: string; by?: string; offset?: number; agMap?: Record<string, string> }, lines: LyricLine[] }

/** Lyntrics **/
type Lyntrics = {
    v: number
    lg?: string
    dur?: number
    gr?: 'w' | 'l' | 'n' | string
    ofs?: number
    ag?: unknown
    sec?: any[]   // section: [type, begin, end, agentId?, lines[]], line: [key, begin, end, text, spans?]
}

/* =======================
 * Props / Emits / v-model
 * ======================= */
interface Props {
    modelValue?: EqualizerBand[];
    tracks?: TrackItem[];
    currentIndex?: number;
    mode?: 'repeat-all' | 'repeat-one' | 'shuffle';
    currentTime?: number;
    isPlaying?: boolean;
    playbackRate?: number;
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
    mode: 'repeat-all',
    currentTime: 0,
    isPlaying: false,
    playbackRate: 1
})

const emit = defineEmits<{
    'update:modelValue': [value: EqualizerBand[]];
    'change': [value: EqualizerBand[]];
    'play-item': [index: number];
    'cycle-mode': [];
    'seek-to': [timeSec: number];
}>()

/* =======================
 * Swiper
 * ======================= */
let swiperInstance: any = null
let swiperListInstance: any = null
const pageIndex = ref(0)
const listIndex = ref(0)
const firstwait = ref(false)
const inswitchlr = ref(true)
const onSwiper = (swiper: any) => { swiperInstance = swiper }
const onSwiperList = (swiper: any) => { swiperListInstance = swiper }
const onSlideChange = (swiper: any) => { pageIndex.value = swiper.activeIndex }
const slideTo = (index: number) => { props.tracks[props.currentIndex].lyrics ? swiperInstance?.slideTo(index) : swiperInstance?.slideTo(index + 1) }
const listSlideTo = (index: number) => { swiperListInstance?.slideTo(index) }
const listnext = () => { swiperListInstance?.slideNext() }
const listprev = () => { swiperListInstance?.slidePrev() }
const onListSlideChange = (swiper: any) => { listIndex.value = swiper.activeIndex }

/* =======================
 * Equalizer
 * ======================= */
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

/* =======================
 * Playlist
 * ======================= */
const listTracks = computed(() =>
    (props.tracks ?? []).map((t, idx) => ({ ...t, __index: idx }))
)
const eagerAboveTheFold = 8
const eagerAroundCurrent = 2
const artwork = useArtworkCache()
function primeAll(tracks: TrackItem[]) { artwork.primeFromPlaylist(tracks) }
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

/* =======================
 * Lyrics Cache & Parsers
 * ======================= */
const lyricsCache: Map<string, Promise<ParsedLyrics>> = new Map();

/** LRC 解析（原样） */
function parseLRC(raw: string): ParsedLyrics {
    const text = raw.replace(/\ufeff/g, '').replace(/\r\n/g, '\n').trim()
    const meta: ParsedLyrics['meta'] = {}
    const lines: LyricLine[] = []
    const metaRe = /^\[(ti|ar|al|by|offset):\s*(.*?)\s*\]$/i
    const timeRe = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g

    for (const line of text.split('\n')) {
        const m = line.match(metaRe)
        if (m) {
            const k = m[1].toLowerCase()
            const v = m[2]
            if (k === 'offset') meta.offset = Number(v) || 0
            else (meta as any)[k] = v
            continue
        }
        let match: RegExpExecArray | null
        const stamps: number[] = []
        timeRe.lastIndex = 0
        while ((match = timeRe.exec(line)) !== null) {
            const mm = Number(match[1]) || 0
            const ss = Number(match[2]) || 0
            const ms = Number(match[3] || 0)
            const t = mm * 60 + ss + ms / 1000
            stamps.push(t)
        }
        const pure = line.replace(timeRe, '').trim()
        if (!stamps.length && pure) continue
        for (const t of stamps) lines.push({ t, raw: pure, main: pure })
    }
    const off = (meta.offset || 0) / 1000
    lines.forEach(l => { l.t = Math.max(0, l.t + off) })
    lines.sort((a, b) => a.t - b.t)
    return { meta, lines }
}

const WAIT_GAP_SEC = 8

function patchWaitDots(lines: LyricLine[]): LyricLine[] {
    if (!lines?.length) return lines
    const out: LyricLine[] = []
    for (let i = 0; i < lines.length; i++) {
        const cur = lines[i]
        out.push(cur)
        if (i < lines.length - 1) {
            const next = lines[i + 1]
            if (typeof cur.e === 'number' && Number.isFinite(cur.e)) {
                const gap = next.t - cur.e
                if (gap > WAIT_GAP_SEC) {
                    out.push({ t: cur.e, raw: '', main: '' })
                }
            }
        }
    }
    return out
}

/** Lyntrics -> Line */
function lyntricsToLines(lyn: Lyntrics): LyricLine[] {
    const out: LyricLine[] = []
    const sections = lyn?.sec ?? []
    for (const sec of sections) {
        const agentId = (Array.isArray(sec) && typeof sec[3] === 'string') ? (sec[3] as string) : null
        const lines = Array.isArray(sec) ? (sec[4] || []) : []
        for (const L of lines) {
            const begin = Number(L?.[1])
            const end = Number(L?.[2])
            const text = String(L?.[3] ?? '')
            const spansRaw = L?.[4] ?? []
            const spans: WordSpan[] = []

            if (Array.isArray(spansRaw)) {
                for (const s of spansRaw) {
                    if (Array.isArray(s)) {
                        const tx = String(s[0] ?? '')
                        const b = Number(s[1]); const e = Number(s[2])
                        const m = s[3] || {}
                        const fx = (m && typeof m === 'object')
                            ? { highlight: m[0], dir: m[1] }
                            : undefined
                        if (Number.isFinite(b) && Number.isFinite(e) && tx !== '') spans.push({ b, e, tx, fx })
                    } else if (s && typeof s === 'object') {
                        const tx = String(s.tx ?? '')
                        const b = Number(s.b); const e = Number(s.e)
                        const fx = s.fx
                        if (Number.isFinite(b) && Number.isFinite(e) && tx !== '') spans.push({ b, e, tx, fx })
                    }
                }
            }

            if (Number.isFinite(begin) && text) {
                const main = text || (spans.length ? spans.map(x => x.tx).join('') : '')
                const line: LyricLine = { t: begin, raw: text, main, spans: spans.length ? spans : undefined }
                if (Number.isFinite(end)) line.e = end
                if (agentId) line.ag = agentId
                out.push(line)
            }
        }
    }
    out.sort((a, b) => a.t - b.t)
    return out
}

function parseLyntricsObject(obj: any): ParsedLyrics {
    try {
        const agPairs = Array.isArray(obj?.ag) ? (obj.ag as any[]) : []
        const agMap: Record<string, string> = {}
        for (const pair of agPairs) {
            if (Array.isArray(pair) && typeof pair[0] === 'string' && typeof pair[1] === 'string') {
                agMap[pair[0]] = pair[1]
            }
        }

        const lines = lyntricsToLines(obj as Lyntrics)

        return { meta: { agMap }, lines }
    } catch {
        return { meta: {}, lines: [] }
    }
}

const agentPosMap = computed<Record<string, string>>(
    () => ((lyrics.value?.meta as any)?.agMap ?? {})
)

const isLineRight = (line: LyricLine) => {
    const ag = line.ag
    if (!ag) return false
    const pos = agentPosMap.value[ag]
    return pos === 'o'
}

/** AutoLoad（.lyntrics.json / .lrc） */
async function ensureLyrics(url: string): Promise<ParsedLyrics> {
    if (!url) return { meta: {}, lines: [] }
    const cached = lyricsCache.get(url)
    if (cached) return cached

    const isJsonLike = /\.lyntrics\.json(\?.*)?$/.test(url)

    const p = (async () => {
        try {
            const res = await fetch(url, { cache: 'force-cache' })
            const ct = (res.headers.get('content-type') || '').toLowerCase()
            if (ct.includes('application/json') || isJsonLike) {
                const obj = await res.json()
                return parseLyntricsObject(obj)
            } else {
                const text = await res.text()
                try { return parseLyntricsObject(JSON.parse(text)) } catch { return parseLRC(text) }
            }
        } catch {
            try {
                const res2 = await fetch(url, { cache: 'no-cache' })
                const ct2 = (res2.headers.get('content-type') || '').toLowerCase()
                if (ct2.includes('application/json') || isJsonLike) {
                    const obj2 = await res2.json()
                    return parseLyntricsObject(obj2)
                } else {
                    const text2 = await res2.text()
                    try { return parseLyntricsObject(JSON.parse(text2)) } catch { return parseLRC(text2) }
                }
            } catch {
                return { meta: {}, lines: [] }
            }
        }
    })()

    lyricsCache.set(url, p)
    return p
}

async function prefetchLyricsAround(center: number, span = 1) {
    const n = props.tracks?.length ?? 0
    if (!n) return
    for (let d = -span; d <= span; d++) {
        const j = (center + d + n) % n
        const url = props.tracks?.[j]?.lyrics
        if (url) void await ensureLyrics(url)
    }
}

/* =======================
 * Lyrics Status + rAF
 * ======================= */
const currentTrack = computed(() => props.tracks?.[props.currentIndex ?? 0])
const activeLyricsUrl = computed(() => currentTrack.value?.lyrics || '')
const lyrics = ref<ParsedLyrics | null>(null)
const activeLines = computed<LyricLine[]>(() => lyrics.value?.lines ?? [])
const hasLyrics = computed(() => activeLines.value.length > 0)

let lySwiper: any = null
const onLyricsSwiper = (sw: any) => { lySwiper = sw }
const autoFollow = ref(true)
const activeLineIndex = ref(0)

const softNow = ref(0)
let rafId: number | null = null
let anchorMediaTime = 0
let anchorTs = 0

const FADE_COAST_MS = 1100
let coastUntilTs = 0
let lastMotion = false

function syncAnchor(from?: number) {
    anchorMediaTime = (typeof from === 'number') ? from : (Number(props.currentTime) || 0)
    anchorTs = performance.now()
    softNow.value = anchorMediaTime
}

function startTicker() {
    if (rafId != null) return
    anchorTs = performance.now()
    const tick = (ts: number) => {
        const inCoast = ts < coastUntilTs
        const motion = (props.isPlaying === true) || inCoast
        const rate = props.playbackRate ?? 1

        if (motion !== lastMotion) {
            anchorMediaTime = softNow.value
            anchorTs = ts
            lastMotion = motion
        }

        const dt = (ts - anchorTs) / 1000
        softNow.value = anchorMediaTime + (motion ? dt * rate : 0)

        rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
}

function stopTicker(update = true) {
    if (rafId != null) cancelAnimationFrame(rafId)
    rafId = null
    if (update) softNow.value = anchorMediaTime
}

function binarySearch(lines: LyricLine[], t: number, delay: number = 0): number {
    let lo = 0, hi = lines.length - 1, ans = 0
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (lines[mid].t <= t-delay) { ans = mid; lo = mid + 1 }
        else hi = mid - 1
    }
    return ans
}

const FOLLOW_MIN_INTERVAL_MS = 200
let lastFollowTs = 0
function followToIndex(idx: number, force = false) {
    if (!lySwiper) return
    function checkallowupdate() {
        const allZero =
            Array.from(document.querySelectorAll<HTMLElement>('.lyrics-slide.empty'))
                .every(el => el.offsetHeight === 0);
        const firstZero = document.querySelector<HTMLElement>('.lyrics-slide.first')?.offsetHeight === 0

        return allZero && firstZero && activeLineIndex.value !== 0
    }
    if (checkallowupdate()) lySwiper?.update()
    const now = performance.now()
    if (!force && (now - lastFollowTs) < FOLLOW_MIN_INTERVAL_MS) return
    lastFollowTs = now
    const clamped = Math.max(0, Math.min(idx + 1, activeLines.value.length))
    lySwiper.slideTo(clamped, 750)
}

function onClickLyric(idx: number, t: number) {
    activeLineIndex.value = idx
    followToIndex(idx, true)
    emit('seek-to', t)
}

function toggleAutoFollow() {
    autoFollow.value = !autoFollow.value
    if (autoFollow.value && hasLyrics.value) followToIndex(activeLineIndex.value, true)
}

function jumpLyric(delta: number) {
    if (!hasLyrics.value) return
    const next = Math.max(0, Math.min(activeLines.value.length - 1, activeLineIndex.value + delta))
    activeLineIndex.value = next
    followToIndex(next, true)
    emit('seek-to', activeLines.value[next]?.t ?? 0)
}

function wrapDisplay(s: string, L = 29): string {
    const isFW = (c: string) => /[^\x00-\x7F]/.test(c);
    const width = (c: string) => (c === ' ' ? 1 : isFW(c) ? 2 : 1);
    const isPunc = (c: string) => /[,.!?;:'"、。，？！；：“”‘’【】（）《》〈〉—…・・ー»»»»〉〉〉〉」』】]/.test(c);
    const leadPuncCount = (arr: string[], i: number) => {
        let k = 0, n = arr.length;
        while (i < n && k < 3 && isPunc(arr[i])) k++;
        return k;
    };
    const wsum = (arr: string[]) => arr.reduce((n, c) => n + width(c), 0);

    const chars = Array.from(s);
    let lines: string[] = [];
    let line: string[] = [];
    let curW = 0;
    let spaceIdx = -1;
    let i = 0;

    while (i < chars.length) {
        const ch = chars[i];

        if (ch === '\n') {
            lines.push(line.join(''));
            line = []; curW = 0; spaceIdx = -1; i++; continue;
        }

        const ww = width(ch);
        if (curW + ww <= L) {
            if (ch === ' ') spaceIdx = line.length;
            line.push(ch); curW += ww; i++; continue;
        }

        const canSoft = spaceIdx >= 0 && wsum(line.slice(0, spaceIdx)) >= 3;
        const k = leadPuncCount(chars, i);

        if (canSoft) {
            const move = Math.min(k, spaceIdx);
            const left = line.slice(0, spaceIdx - move);
            const right = [...line.slice(spaceIdx + 1)];
            const carry = line.slice(spaceIdx - move, spaceIdx);
            lines.push(left.join(''));
            line = [...carry, ...right];
            curW = wsum(line);
            spaceIdx = line.lastIndexOf(' ');
            continue;
        } else {
            const move = Math.min(k, line.length);
            const left = line.slice(0, line.length - move);
            const carry = line.slice(line.length - move);
            lines.push(left.join(''));
            line = [...carry];
            curW = wsum(line);
            spaceIdx = line.lastIndexOf(' ');
            continue;
        }
    }

    lines.push(line.join(''));
    return lines.join('\n');
}

const nowT = computed(() => softNow.value)

function spanProgress(s: WordSpan, t: number): number {
    if (!Number.isFinite(s.b) || !Number.isFinite(s.e)) return 0
    if (t <= s.b) return 0
    if (t >= s.e) return 1
    const dur = Math.max(1e-4, s.e - s.b)
    return (t - s.b) / dur
}
function charProgress(s: WordSpan, i: number, t: number): number {
    if (!Number.isFinite(s.b) || !Number.isFinite(s.e)) return 0
    const n = t - s.b
    const dur = Math.max(1e-4, s.e - s.b)
    const charDur = dur / (s.tx.length || 1)
    const charStart = i * charDur
    const charEnd = charStart + charDur
    if (t <= s.b + charStart) return 0
    if (t >= s.b + charEnd) return 1
    return (n - charStart) / charDur
}
function wordClass(s: WordSpan) {
    const t = nowT.value
    return t < s.b ? `future` : (t > s.e ? `past` : `current`)
}
function wordStyle(s: WordSpan) {
    const p = spanProgress(s, nowT.value);

    const before = p <= 0;
    const after = p >= 1;

    const gp = before ? '-20%' : after ? '100%' : `${(p * 120 - 20).toFixed(6)}%`;
    const t = before ? 0 : after ? 1 : p;
    const easeT = 0.5 * (1 - Math.cos(Math.PI * t));
    const ty = before ? 0 : after ? -1.5 : -easeT * 1.5;

    const out: Record<string, string> = {
        '--gradient-progress': gp,
        '--gradient-direction': s.fx?.dir ?? 'to right',
        transform: `matrix(1, 0, 0, 1, 0, ${ty.toFixed(6)})`,
    };
    return out;
}
function wordfxStyle(s: WordSpan, i: number) {
    const p = charProgress(s, i, nowT.value);
    const before = p <= 0;
    const after = p >= 1;
    const gp = before ? '-20%' : after ? '100%' : `${(p * 120 - 20).toFixed(6)}%`;

    const P = spanProgress(s, nowT.value);
    const nChars = Math.max(1, s.tx.length || 1);
    const phaseDur = 1 / 3;
    const delta = nChars > 1 ? phaseDur / (nChars - 1) : 0;

    const startF = i * delta;
    const endF = startF + phaseDur;
    const startB = endF;
    const endB = startB + phaseDur;

    const ease = (x: number) => 0.5 * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, x))));
    let E = 0;
    if (P > startF && P < endF) {
        const u = (P - startF) / phaseDur;
        E = ease(u);
    } else if (P >= endF && P < endB) {
        const u = (P - endF) / phaseDur;
        E = 1 - ease(u);
    } else {
        E = 0;
    }

    const dur = Math.max(1e-4, s.e - s.b);

    const t = before ? 0 : after ? 1 : p;
    const easeT = 0.5 * (1 - Math.cos(Math.PI * t));
    const tyn = before ? 0 : after ? -1.5 : -easeT * 1.5;

    const ty = dur > 2 ? tyn - E : tyn;
    const ts = (0.25 + 0.25 * E).toFixed(6) + 'em';
    const op = (0.75 * E).toFixed(6);

    const sxy = dur > 2 ? 1 + 0.125 * E : 1;

    return {
        '--gradient-progress': gp,
        '--gradient-direction': s.fx?.dir ?? 'to right',
        '--text-shadow-blur-radius': ts,
        '--text-shadow-opacity': op,
        transform: `matrix(${sxy.toFixed(10)}, 0, 0, ${sxy.toFixed(10)}, 0, ${ty.toFixed(10)})`,
    } as Record<string, string>;
}

onMounted(async () => {
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

    slideTo(0)
    syncAnchor(Number(props.currentTime) || 0)
    startTicker()

    if (props.tracks?.length) {
        primeAll(props.tracks)
        ensureNeighbors(props.currentIndex ?? 0)
        await prefetchLyricsAround(props.currentIndex ?? 0, 1)
        inswitchlr.value = false;
    }
})

onUnmounted(() => {
    stopTicker(false)
})

watch(activeLyricsUrl, async (url) => {
    if (!url) {
        lyrics.value = null
        activeLineIndex.value = 0
        autoFollow.value = true
        lySwiper?.slideTo(0, 0)
        return
    }
    const parsed = await ensureLyrics(url)
    const patched = { ...parsed, lines: patchWaitDots(parsed.lines) }
    firstwait.value = false
    setTimeout(() => {
        lyrics.value = patched
    }, 500);
    activeLineIndex.value = 0
    autoFollow.value = true
    await nextTick()
    lySwiper?.update()
    lySwiper?.slideTo(0, 0)
    setTimeout(() => {
        firstwait.value = true
    }, 500);
})

watch(() => props.currentTime, (t) => {
    const newT = Number(t) || 0
    const drift = Math.abs(newT - softNow.value)
    const now = performance.now()
    const inCoast = now < coastUntilTs

    const THRESH = inCoast ? 0.25 : 0.12
    if (drift > THRESH) {
        syncAnchor(newT)
    }
})

watch(() => props.isPlaying, (p) => {
    if (p) {
        coastUntilTs = 0
        syncAnchor(Number(props.currentTime) || softNow.value)
        startTicker()
    } else {
        coastUntilTs = performance.now() + FADE_COAST_MS
        syncAnchor(Number(props.currentTime) || softNow.value)
        startTicker()
    }
})

watch(softNow, (t) => {
    if (!hasLyrics.value) return
    const idx = binarySearch(activeLines.value, t, -0.3)
    if (idx !== activeLineIndex.value) {
        activeLineIndex.value = idx
        if (autoFollow.value) followToIndex(idx)
    }
})

const cacheidx = ref()

watch(() => props.currentIndex, (idx) => {
    if (typeof idx === 'number') {
        inswitchlr.value = true
        const Ttime = Date.now()
        cacheidx.value = Ttime
        setTimeout(async () => {
            ensureNeighbors(idx)
            await prefetchLyricsAround(idx, 1)
            if (Ttime === cacheidx.value) inswitchlr.value = false
        }, 500);
        if (pageIndex.value != 2) {
            slideTo(0)
            setTimeout((idxs = idx) => {
                listSlideTo(Math.ceil((idxs + 1) / 4) - 1)
            }, 300)
        }
    }
})

defineExpose({ toggleAutoFollow, jumpLyric })
</script>

<style lang="scss">
$content-br: 0.8em;
$content-bg: color-mix(in srgb, var(--lyntrix-color-high, #FFF), #FFFFFF 75%);

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
        filter: blur(.5em);
    }

    &:has(> .indicators.bottom:hover)>.indicators {
        filter: blur(.5em);

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

    .lyrics-card {
        display: flex;
        height: 100%;
        width: 100%;
        padding: 0 1.25em;
        position: relative;
        box-sizing: border-box;
        align-items: center;
        justify-content: space-between;
        transition: filter .3s, transform .3s;

        .lyrics-swiper {
            width: 100%;
            height: 100%;
            margin-top: 6.75em;
            overflow: visible;
            position: relative;
            transition: filter .5s, opacity .5s;

            .lyrics-slide {
                width: 100%;
                height: auto !important;
                min-height: 5.5em;
                display: flex;
                overflow: visible;
                align-items: center;
                justify-content: flex-start;
                transition: height .75s;

                .lyrics-content {
                    padding: 0.5em 1.2em;
                    width: 100%;
                    margin: .5em 0;
                    border-radius: 1em;
                    box-sizing: border-box;
                    transition: background-color .3s, transform .3s;

                    .lyrics-text {
                        opacity: .6;
                        font-size: 2.6em;
                        filter: blur(.1em);
                        transform: scale(.9);
                        transform-origin: left;
                        transition: transform .75s, filter .75s, opacity .75s;
                        white-space: pre-line;
                        word-break: normal;

                        &.wordprog {
                            display: inline-flex;
                            flex-wrap: wrap;
                            gap: .02em;
                            white-space: pre-wrap;

                            .wg {
                                --gradient-progress: -20%;
                                --gradient-direction: to right;

                                background-image: linear-gradient(var(--gradient-direction),
                                        #000000e8 var(--gradient-progress),
                                        #00000060 calc(var(--gradient-progress) + 20%));
                                background-clip: text;
                                -webkit-text-fill-color: transparent;
                                -webkit-background-clip: text;
                                display: inline-block;
                                will-change: transform;
                                transition: .1s;

                                &.fx {
                                    --text-shadow-blur-radius: 0px;
                                    --text-shadow-opacity: 0;

                                    text-shadow: 0 0 var(--text-shadow-blur-radius) rgba(0, 0, 0, var(--text-shadow-opacity));
                                }

                                &.past {
                                    --gradient-progress: 100%;
                                    transform: matrix(1, 0, 0, 1, 0, -1);
                                }

                                &.future {
                                    --gradient-progress: -20%;
                                    transform: matrix(1, 0, 0, 1, 0, 0);
                                }
                            }
                        }
                    }
                }

                .lyrics-empty {
                    opacity: 0;
                    filter: blur(1em);
                    transform: scale(0.25);
                    transition: transform .75s, opacity .75s, filter .75s;


                    .dot-group {
                        gap: .75em;
                        display: flex;
                        animation: 5s ease 0s infinite normal none running heartbeat;
                        animation-play-state: paused;

                        .dot {
                            height: 1.25em;
                            width: 1.25em;
                            opacity: .25;
                            border-radius: 50%;
                            transition: opacity .3s linear, background-color .6s;
                            background-color: color-mix(in srgb, var(--lyntrix-color-high, #000), #000 60%);

                            &.current {
                                opacity: 1;
                            }
                        }
                    }
                }

                &.empty {
                    min-height: 0;
                    height: 0 !important;
                    padding-left: 1.2em;
                }

                &.right .lyrics-content {
                    text-align: right;

                    .lyrics-text {
                        transform-origin: right;
                        justify-content: flex-end;
                    }
                }

                &.next {
                    &.inline .lyrics-content .lyrics-text {
                        will-change: transform, opacity, filter;
                        filter: blur(.05em);
                    }

                    .lyrics-content .lyrics-text {
                        opacity: .85;
                    }

                    &.empty {
                        .lyrics-empty {
                            will-change: transform, opacity, filter;
                        }
                    }
                }

                &.active {
                    .lyrics-content .lyrics-text {
                        will-change: transform, opacity, filter;
                        filter: blur(.05em);
                    }

                    &.inline .lyrics-content .lyrics-text {
                        will-change: transform, opacity, filter;
                        transform: none;
                        filter: none;
                        opacity: 1;
                    }
                }

                &.active.empty {
                    height: 5.5em !important;

                    .lyrics-empty {
                        transition: transform 1.5s, opacity 1.5s, filter 1.5s;
                        will-change: transform, opacity, filter;
                        transform: none;
                        filter: none;
                        opacity: 1;
                    }
                }

                &:hover {
                    .lyrics-content {
                        background-color: #00000011;
                    }
                }

                &:active {
                    .lyrics-content {
                        transform: scale(.975);
                        background-color: #00000022;
                    }
                }

                &.first {
                    min-height: 0;
                    height: 0 !important;
                    padding-left: 1.2em;

                    &.show {
                        height: 5.5em !important;

                        .lyrics-empty {
                            transition: transform 1.5s, opacity 1.5s, filter 1.5s;
                            will-change: transform, opacity, filter;
                            transform: none;
                            filter: none;
                            opacity: 1;
                        }
                    }

                    &.playing .lyrics-empty .dot-group {
                        animation-play-state: running;
                    }
                }

                &.playing.prev,
                &.playing.active {
                    .lyrics-empty .dot-group {
                        animation-play-state: running;
                    }
                }
            }

            &:hover {
                .lyrics-slide .lyrics-content .lyrics-text {
                    filter: none !important;
                }
            }

            &.change {
                filter: blur(.5em);
                opacity: 0;
            }

            @keyframes heartbeat {
                0% {
                    transform: scale(.85);
                }

                50% {
                    transform: scale(1.15);
                }

                100% {
                    transform: scale(.85);
                }
            }
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
                            grid-template-columns: 5.5em 1fr;
                            gap: .5em;
                            align-items: center;
                            padding: 1em;
                            border-radius: $content-br;
                            background-color: $content-bg;
                            transition: background-color .3s, box-shadow .3s;
                            box-sizing: border-box;

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
        filter: blur(1em);
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

        &~.swiper .stacked-slide .lyrics-card,
        &~.swiper .stacked-slide .queue-card,
        &~.swiper .stacked-slide .equalizer {
            filter: blur(.5em);
            transform: scale(.95);
        }


        &.bottom~.swiper .stacked-slide.swiper-slide-active .lyrics-card,
        &.bottom~.swiper .stacked-slide.swiper-slide-active .queue-card,
        &.bottom~.swiper .stacked-slide.swiper-slide-active .equalizer {
            filter: none;
            transform: none;

            .queue-left .modeswitch {
                filter: blur(.5em);
            }

            .queue-right .vertical-swiper .vertical-slide {
                transform: scale(.95);
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

    &.inlist.totop {
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
        background-color: #a3e9ff18;

        .lyrics-card .lyrics-swiper .lyrics-slide .lyrics-content .lyrics-text.wordprog .wg {
            background-image: linear-gradient(var(--gradient-direction), #78c6ff var(--gradient-progress), #78c6ff52 calc(var(--gradient-progress) + 20%));
            text-shadow: 0 0 var(--text-shadow-blur-radius) rgba(120, 198, 255, var(--text-shadow-opacity));
        }

        .queue-card {
            .queue-left button {
                fill: #78c6ff;
                background-color: #9ae8ff47;
            }

            .queue-right .vertical-swiper .vertical-slide .grid li {
                background-color: #9ae8ff26;

                &.active {
                    background-color: #3a9bff59;
                }

                .meta {
                    color: #b2dfff;
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