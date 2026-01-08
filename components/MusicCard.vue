<template>
    <div class="music-widget" :class="{ 'lytrics': currentTrack?.lyrics }">
        <div class="picture" :class="{ isPlaying }">
            <AlbumCover :image-url="currentTrack?.image" :direction="albumCoverDirection" />
        </div>
        <div class="info" :class="{ 'involume': entervolume }">
            <div class="title">
                <TextFlip :duration="500" :words="currentTrack?.title.replace(/ /g, '&nbsp;') || 'Not&nbsp;Playing'" />
            </div>
            <div class="subtitle">
                <TextFlip :duration="500" :words="currentTrack?.author.replace(/ /g, '&nbsp;') || '--'" />
            </div>
            <div class="volume">
                <div class="progresscon" @mousedown.stop @dblclick.stop data-pointer @mouseenter="entervolume = true"
                    @mouseleave="entervolume = false">
                    <div class="progress" :style="{ width: volume + '%' }"></div>
                    <input type="range" min="0" max="100" v-model="volume" @input="onVolumeInput" />
                    <div class="icon">
                        <Transition name="fadee">
                            <svg v-if="volume === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                <path
                                    d="M301.2 34.85c-11.5-5.188-25.02-3.122-34.44 5.253L131.8 160H48c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9c5.984 5.312 13.58 8.094 21.26 8.094c4.438 0 8.972-.9375 13.17-2.844c11.5-5.156 18.82-16.56 18.82-29.16V64C319.1 51.41 312.7 40 301.2 34.85zM513.9 255.1l47.03-47.03c9.375-9.375 9.375-24.56 0-33.94s-24.56-9.375-33.94 0L480 222.1L432.1 175c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94l47.03 47.03l-47.03 47.03c-9.375 9.375-9.375 24.56 0 33.94c9.373 9.373 24.56 9.381 33.94 0L480 289.9l47.03 47.03c9.373 9.373 24.56 9.381 33.94 0c9.375-9.375 9.375-24.56 0-33.94L513.9 255.1z" />
                            </svg>
                            <svg v-else-if="volume <= 30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <path
                                    d="M412.6 181.9c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.37 3.375 33.78C393.5 228.4 400 241.8 400 256c0 14.19-6.5 27.62-17.81 36.87c-10.28 8.406-11.78 23.53-3.375 33.78c4.719 5.812 11.62 8.812 18.56 8.812c5.344 0 10.75-1.781 15.19-5.406C435.1 311.6 448 284.7 448 256S435.1 200.4 412.6 181.9zM301.2 34.84c-11.5-5.187-25.01-3.116-34.43 5.259L131.8 160H48c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C272.7 477.2 280.3 480 288 480c4.438 0 8.959-.9313 13.16-2.837C312.7 472 320 460.6 320 448V64C320 51.41 312.7 39.1 301.2 34.84z" />
                            </svg>
                            <svg v-else-if="volume <= 75" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                <path
                                    d="M444.6 181.9c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.37 3.375 33.78C425.5 228.4 432 241.8 432 256c0 14.19-6.5 27.62-17.81 36.87c-10.28 8.406-11.78 23.53-3.375 33.78c4.719 5.812 11.62 8.812 18.56 8.812c5.344 0 10.75-1.781 15.19-5.406C467.1 311.6 480 284.7 480 256S467.1 200.4 444.6 181.9zM505.1 108c-10.22-8.344-25.34-6.906-33.78 3.344c-8.406 10.25-6.906 25.37 3.344 33.78C508.6 172.9 528 213.3 528 256s-19.44 83.09-53.31 110.9c-10.25 8.406-11.75 23.53-3.344 33.78c4.75 5.781 11.62 8.781 18.56 8.781c5.375 0 10.75-1.781 15.22-5.437C550.2 367.1 576 313.1 576 256S550.2 144.9 505.1 108zM333.2 34.84c-11.5-5.187-25.01-3.116-34.43 5.259L163.8 160H80c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C304.7 477.2 312.3 480 320 480c4.438 0 8.959-.9313 13.16-2.837C344.7 472 352 460.6 352 448V64C352 51.41 344.7 39.1 333.2 34.84z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                                <path
                                    d="M412.6 182c-10.28-8.334-25.41-6.867-33.75 3.402c-8.406 10.24-6.906 25.35 3.375 33.74C393.5 228.4 400 241.8 400 255.1c0 14.17-6.5 27.59-17.81 36.83c-10.28 8.396-11.78 23.5-3.375 33.74c4.719 5.806 11.62 8.802 18.56 8.802c5.344 0 10.75-1.779 15.19-5.399C435.1 311.5 448 284.6 448 255.1S435.1 200.4 412.6 182zM473.1 108.2c-10.22-8.334-25.34-6.898-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C476.6 172.1 496 213.3 496 255.1s-19.44 82.1-53.31 110.7c-10.25 8.396-11.75 23.5-3.344 33.74c4.75 5.775 11.62 8.771 18.56 8.771c5.375 0 10.75-1.779 15.22-5.431C518.2 366.9 544 313 544 255.1S518.2 145 473.1 108.2zM534.4 33.4c-10.22-8.334-25.34-6.867-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C559.9 116.3 592 183.9 592 255.1s-32.09 139.7-88.06 185.5c-10.25 8.396-11.75 23.5-3.344 33.74C505.3 481 512.2 484 519.2 484c5.375 0 10.75-1.779 15.22-5.431C601.5 423.6 640 342.5 640 255.1S601.5 88.34 534.4 33.4zM301.2 34.98c-11.5-5.181-25.01-3.076-34.43 5.29L131.8 160.1H48c-26.51 0-48 21.48-48 47.96v95.92c0 26.48 21.49 47.96 48 47.96h83.84l134.9 119.8C272.7 477 280.3 479.8 288 479.8c4.438 0 8.959-.9314 13.16-2.835C312.7 471.8 320 460.4 320 447.9V64.12C320 51.55 312.7 40.13 301.2 34.98z" />
                            </svg>
                        </Transition>
                    </div>
                </div>
            </div>
        </div>
        <div class="controls">
            <div class="ctrlbtns">
                <div class="ctrlitem left">
                    <div class="time current">{{ currentTimeDisplay }}</div>
                    <button class="prev" @click="playPrevious" @mousedown.stop @dblclick.stop data-pointer>
                        <font-awesome icon="backward" />
                    </button>
                </div>
                <button class="play" @click="togglePlay" @mousedown.stop @dblclick.stop data-pointer>
                    <Transition name="faded">
                        <font-awesome v-if="isPlaying" icon="pause" />
                        <font-awesome v-else icon="play" />
                    </Transition>
                </button>
                <div class="ctrlitem right">
                    <button class="next" @click="() => playNext()" @mousedown.stop @dblclick.stop data-pointer>
                        <font-awesome icon="forward" />
                    </button>
                    <div class="time total">{{ durationDisplay }}</div>
                </div>
            </div>
            <div class="rangeinput" :class="{ 'disable': !isProgressBarEnabled }" @mousedown.stop @dblclick.stop
                data-pointer>
                <div class="ctrlprogress">
                    <div class="progress load" :class="{ done: isBufferComplete }"
                        :style="{ width: bufferProgress + '%' }" />
                    <div class="progress" :style="{ width: progress + '%' }" />
                </div>
                <input type="range" min="0" max="100" step="0.1" v-model="progress" @input="onProgressInput"
                    @change="setProgress" />
            </div>
        </div>
        <div class="panel">
            <StackedPanel v-model="equalizerSettings" v-model:eqcontrol="equalizerEnabled"
                :tracks="playlist.queue.value" :current-index="playlist.currentIndex.value" :mode="playlist.mode.value"
                :current-time="player.currentTime.value" :is-playing="player.isPlaying.value"
                @change="onEqualizerChanged" @play-item="handlePlayItem" @cycle-mode="handleCycleMode"
                @seek-to="handleSeekFromLyrics" />
        </div>
        <div class="exitfullscr" @click="exitfullscr">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M393.4 41.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L269.3 256 438.6 425.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 301.3 54.6 470.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L178.7 256 9.4 86.6C-3.1 74.1-3.1 53.9 9.4 41.4s32.8-12.5 45.3 0L224 210.7 393.4 41.4z"/></svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { TrackItem, EqualizerBand } from '@/composables/audio/audioTypes';
import { useAudioPlayer } from '@/composables/audio/useAudioPlayer';
import { usePlaylistController } from '@/composables/audio/usePlaylistController';

interface Props { data: TrackItem[] }
const props = withDefaults(defineProps<Props>(), { data: () => [] });

const player = useAudioPlayer(props.data);
const playlist = usePlaylistController(player);
const albumCoverDirection = ref<'next' | 'prev'>('next');
const entervolume = ref(false);

// ===== 均衡器 v-model =====
const equalizerSettings = ref<EqualizerBand[]>([
    { text: '31', feq: 31, value: 12 },
    { text: '62', feq: 62, value: 12 },
    { text: '125', feq: 125, value: 12 },
    { text: '250', feq: 250, value: 12 },
    { text: '500', feq: 500, value: 12 },
    { text: '1k', feq: 1000, value: 12 },
    { text: '2k', feq: 2000, value: 12 },
    { text: '4k', feq: 4000, value: 12 },
    { text: '8k', feq: 8000, value: 12 },
    { text: '16k', feq: 16000, value: 12 }
]);

const equalizerEnabled = ref(false);
watch(equalizerEnabled, (v) => player.setEQEnabled(v), { immediate: true });
defineExpose({ equalizerEnabled });

// ===== 状态桥接 =====
const currentTrack = computed(() => player.currentTrack.value);
const isPlaying = computed(() => player.isPlaying.value);
const isProgressBarEnabled = computed(() => player.isProgressBarEnabled.value);
const currentTimeDisplay = computed(() => player.currentTimeDisplay.value);
const durationDisplay = computed(() => player.durationDisplay.value);
const bufferProgress = computed(() => player.bufferProgress.value);
const isBufferComplete = computed(() => player.isBufferComplete.value);

const volume = computed<number>({
    get: () => player.volume.value,
    set: (val: number) => { player.onVolumeChange(val); }
});

const progress = computed<number>({
    get: () => player.progress.value,
    set: (val: number) => { player.onProgressInput(val); }
});

const onVolumeInput = (e: Event) => {
    const val = Number((e.target as HTMLInputElement).value);
    if (!Number.isNaN(val)) player.onVolumeChange(val);
};

const onProgressInput = (e: Event) => {
    const val = Number((e.target as HTMLInputElement).value);
    if (!Number.isNaN(val)) player.onProgressInput(val);
};

const setProgress = (e: Event) => {
    const val = Number((e.target as HTMLInputElement).value);
    if (!Number.isNaN(val)) player.setProgressValue(val);
};

const togglePlay = () => { player.togglePlay(); };
const playNext = async () => {
    albumCoverDirection.value = 'next';
    await playlist.next();
};
const playPrevious = async () => {
    albumCoverDirection.value = 'prev';
    await playlist.prev();
};

const onEqualizerChanged = (newSettings: EqualizerBand[]) => {
    equalizerSettings.value = newSettings;
    player.applyEQ(equalizerSettings.value);
};

const handlePlayItem = (index: number) => playlist.playAt(index);
const handleCycleMode = () => playlist.cycleMode();

const handleSeekFromLyrics = (sec: number) => {
    const dur = player.duration.value || 0;
    if (dur <= 0) return;
    const pct = Math.max(0, Math.min(100, (sec / dur) * 100));
    player.setProgressValue(pct);
};

const exitfullscr = () => {
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('music-fullscr');
};

player.setNavigator({
    next: () => playlist.next(),
    prev: () => playlist.prev(),
    ended: () => playlist.onEnded(),
});

onMounted(() => {
    player.applyEQ(equalizerSettings.value);
});

watch(() => props.data, (val) => { player.setPlaylist(val); });
</script>

<style lang="scss">
.music-widget {
    transition: padding .6s, transform .6s;

    .picture {
        height: calc(var(--square-size) * 0.75);
        width: calc(var(--square-size) * 0.75);
        transition: width .6s, height .6s;
    }

    .info {
        width: 100%;
        position: relative;
        height: calc(var(--square-size) * .5);
        transition: transform 0.6s, width 0.6s, height 0.6s;

        .title {
            white-space: nowrap;
            text-overflow: ellipsis;
            transition: font-size .6s, line-height .6s, padding .6s, margin .6s;
            font-size: calc(var(--square-size) * 0.24);
            line-height: calc(var(--square-size) * 0.26);
            padding: calc(var(--square-size) * 0.24);
            margin-left: calc(var(--square-size) * -0.24);
            margin-top: calc(var(--square-size) * -0.24);
            padding-right: 0;
            mask-image: linear-gradient(90deg, #000 80%, transparent 100%);
        }

        .subtitle {
            white-space: nowrap;
            text-overflow: ellipsis;
            transition: font-size .6s, line-height .6s, padding .6s, margin .6s;
            font-size: calc(var(--square-size) * 0.2);
            line-height: calc(var(--square-size) * 0.22);
            padding: calc(var(--square-size) * 0.24);
            margin-top: calc(var(--square-size) * -0.48);
            margin-left: calc(var(--square-size) * -0.24);
            padding-right: 0;
            mask-image: linear-gradient(90deg, #000 80%, transparent 100%);
            opacity: 0.6;
        }

        .volume {
            opacity: 0;
            display: flex;
            position: absolute;
            height: 3em;
            width: 12em;
            flex-direction: row-reverse;
            transition: opacity .6s, fill .6s;
            transform: translate(19em, -8em);
            fill: color-mix(in srgb, var(--lyntrix-color-high, #000), #000 60%);

            .progresscon {
                height: 100%;
                transition: background-color .3s, width .3s;
                overflow: hidden;
                width: 3em;
                border-radius: 1em;

                .progress {
                    pointer-events: none;
                    height: 100%;
                    opacity: 0;
                    filter: blur(10px);
                    width: 0;
                    transition: background-color .3s, opacity .3s, width .3s, filter .3s;
                    background-color: color-mix(in srgb, var(--lyntrix-color, #000), #000 30%);
                }

                input[type=range] {
                    appearance: none;
                    margin: 0;
                    opacity: 0;
                    top: 0;
                    width: 3em;
                    height: 100%;
                    font-size: 1em;
                    transition: width .3s;
                    position: absolute;
                }

                .icon {
                    position: absolute;
                    top: 0;
                    right: 0;
                    height: 100%;
                    pointer-events: none;
                    width: 3.2em;

                    svg {
                        height: 100%;
                        width: 100%;
                        position: absolute;
                        padding: 0.5em;
                        padding-right: 0;
                        box-sizing: border-box;
                        transition: .3s;
                    }
                }

                &:hover {
                    width: 100%;
                    background-color: color-mix(in srgb, color-mix(in srgb, var(--lyntrix-color-high, #FFF), #FFF 20%), #000 15%);

                    .progress {
                        filter: none;
                        opacity: 1;
                    }

                    input[type=range] {
                        width: 100%;
                    }

                    .icon svg {
                        padding: 0.65em;
                    }
                }

                &:active {
                    .progress {
                        transition: background-color .3s, opacity .3s, width .1s;
                    }
                }
            }
        }
    }

    .controls {
        height: calc(var(--square-size) * 0.4);
        width: 100%;
        position: relative;
        white-space: nowrap;
        transition: width .6s, height .6s, transform .6s;

        .ctrlbtns {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 100%;
            width: 100%;
            transition: color .6s;
            color: color-mix(in srgb, var(--lyntrix-color-high, #000), #000 60%);

            .ctrlitem {
                gap: 0;
                height: 75%;
                width: 35%;
                display: flex;
                align-items: center;
                transition: .6s;

                .time {
                    width: 0;
                    margin-bottom: .14em;
                    font-size: 1.8em;
                    opacity: 0;
                    pointer-events: none;
                    transition: width .3s, transform .3s, opacity .6s;

                    &.total {
                        text-align: right;
                    }
                }

                &.right {
                    justify-content: flex-end;

                    .time {
                        transform: translateX(-18px);
                    }
                }
            }

            button {
                height: 100%;
                border: none;
                background: none;
                padding: 0;
                color: unset;
                display: flex;
                transition: .3s;

                &:active {
                    transform: scale(0.8);
                    opacity: 0.6;
                }

                &.play {
                    height: 100%;
                    width: calc(var(--square-size) * 0.4);
                    position: relative;

                    svg {
                        position: absolute;
                        top: 0;
                        left: 0;
                    }
                }

                svg {
                    width: 100%;
                    height: 100%;
                }
            }
        }


        .rangeinput {
            top: 130%;
            width: 100%;
            opacity: 0;
            height: 1.25em;
            display: flex;
            align-items: center;
            position: absolute;
            transition: opacity .6s;

            .ctrlprogress {
                width: 100%;
                height: 65%;
                transition: background-color .6s, height .3s;
                border-radius: 100px;
                overflow: hidden;
                position: relative;
                pointer-events: none;
                background-color: color-mix(in srgb, color-mix(in srgb, var(--lyntrix-color-high, #FFF), #FFF 20%), #000 15%);

                .progress {
                    height: 100%;
                    width: 0%;
                    position: absolute;
                    border-radius: 100px;
                    transition: background-color .6s, width .25s ease, opacity .3s;
                    background-color: color-mix(in srgb, var(--lyntrix-color-high, #000), #000 50%);

                    &.load {
                        background-color: color-mix(in srgb, var(--lyntrix-color-high, #000), #000 20%);
                    }

                    &.done {
                        opacity: 0;
                    }
                }
            }

            &:active {
                .ctrlprogress {
                    height: 100%;
                    transition: background-color .6s, height .5s .1s;

                    .progress {
                        transition: background-color 6s, width 0.1s ease, opacity .3s;
                    }
                }
            }

            &.disable {
                pointer-events: none;
            }

            input[type=range] {
                appearance: none;
                margin: 0;
                opacity: 0;
                width: 100%;
                height: 100%;
                position: absolute;
            }
        }
    }

    .panel {
        opacity: 0;
        position: absolute;
        transition: opacity .6s, margin .6s, height .6s;
        margin-top: var(--square-size);
        top: 16.5em;
        width: 46em;
        height: var(--square-size);
        justify-content: space-between;
        display: flex;

    }

    .exitfullscr {
        position: absolute;
        top: 2.4rem;
        left: 2.4rem;
        width: 5rem;
        height: 5rem;
        border-radius: 1rem;
        background-color: #ffffff33;
        opacity: 0;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color .3s;

        &:hover {
            background-color: #FFFFFF55;
        }

        svg {
            width: 2.5rem;
            height: 2.5rem;
            fill: #fff;
        }
    }
}

.content.infocus {
    .widget[data-float-item] .music-widget {
        padding: 2em;

        .picture {
            height: 12.5em;
            width: 12.5em;
        }

        .info {
            width: 28.5em;
            height: 6.5em;
            transform: translate(14.5em, -18.25em);

            &.involume {
                width: 18em;
                transition: transform 0.6s, width 0.3s;
            }

            .title {
                font-size: 2.4em;
                line-height: 1.25em;
                padding: 1.25em;
                padding-right: 0;
                margin-left: -1.25em;
                margin-top: -1.25em;
            }

            .subtitle {
                font-size: 2em;
                line-height: 1.2em;
                margin-top: -2.75em;
                margin-left: -1.5em;
                padding: 1.5em;
                padding-right: 0;
            }

            .volume {
                opacity: 1;
            }
        }

        .controls {
            width: 31em;
            height: 3.5em;
            transform: translate(14.5em, -23.25em);

            .ctrlitem {
                gap: 30%;

                .time {
                    width: 40%;
                    transform: none;
                    opacity: 1;
                }
            }

            button {
                &.play {
                    width: 3em;
                }
            }

            .rangeinput {
                opacity: 1;
            }
        }

        .panel {
            margin-top: 0;
            opacity: 1;
            filter: none;
            height: 19em;
        }
    }
}

html.music-fullscr .content .matrix .widget {
    &[data-float-item=music] {
        .music-widget {
            padding: 0 calc(50vw - 65rem);
            color: #FFFFFF;
            font-size: 1.35rem;
            transition: .3s;

            .picture {
                transition: margin .3s, height .3s, width .3s;
                margin-left: 40rem;
                margin-top: 12.5rem;
                height: 50rem;
                width: 50rem;
            }

            .info {
                transition: .3s;
                transform: translate(40rem, -10rem);
                width: 50rem;

                &.involume {
                    width: 34rem;
                    transition: transform 0.6s, width 0.3s;
                }

                .volume {
                    transform: translate(34rem, -10rem);
                    fill: #ffffffcc;

                    .progresscon:hover {
                        background-color: #ffffff55;

                        .progress {
                            background-color: #ffffff80;
                        }
                    }
                }
            }

            .controls {
                transition: .3s;
                transform: translate(40rem, -20rem);
                width: 50rem;

                .ctrlbtns {
                    color: #FFFFFF;

                    .ctrlitem {
                        opacity: .8;
                    }
                }

                .rangeinput .ctrlprogress {
                    background-color: #ffffff30;

                    .progress {
                        background-color: #ffffff80;

                        &.load {
                            background-color: #ffffff3a;
                        }
                    }
                }
            }

            .panel {
                transition: .3s;
                margin-left: 27.5rem;
                top: 0;
                width: 70rem;
                height: 100vh;
                opacity: 0;
                font-size: 1.8rem;
                pointer-events: none;
            }

            .exitfullscr {
                opacity: 1;
                pointer-events: auto;
            }

            &.lytrics {
                padding: 0 max(calc(50vw - 65rem), 10rem);

                .picture {
                    margin-left: 0;
                }

                .info {
                    transform: translate(0, -10rem);
                }

                .controls {
                    transform: translate(0, -20rem);
                }

                .panel {
                    pointer-events: auto;
                    margin-left: 60rem;
                    opacity: 1;
                }
            }
        }
    }
}

html.dark-mode {
    .music-widget {
        .info {
            .volume {
                fill: #78c6ff;

                .progresscon:hover {
                    background-color: #a3e9ff55;

                    .progress {
                        background-color: #a3e9ff60;
                    }
                }
            }
        }

        .controls {
            .ctrlbtns {
                color: #78c6ff;
            }

            .ctrlprogress {
                background-color: #a3e9ff55;

                .progress {
                    background-color: #a3e9ff;

                    &.load {
                        background-color: #a3e9ff58;
                    }
                }
            }
        }
    }

    .content.infocus {
        .widget[data-float-item] .music-widget {
            transform: translate(-0.3em, -0.3em);

            .info {
                transform: translate(14.532em, -17.95em);
            }

            .controls {
                transform: translate(14.532em, -22.682em);
            }
        }
    }
}

.faded-enter-active,
.faded-leave-active {
    transition: filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
}

.faded-enter-from,
.faded-leave-to {
    opacity: 0;
    transform: scale(0.8);
    filter: blur(8px);
}

.faded-enter-to,
.faded-leave-from {
    opacity: 1;
    transform: none;
    filter: none;
}

.fadee-enter-active,
.fadee-leave-active {
    transition: filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
}

.fadee-enter-from,
.fadee-leave-to {
    opacity: 0;
    transform: scale(0.8);
    filter: blur(3px);
}

.fadee-enter-to,
.fadee-leave-from {
    opacity: 1;
    transform: none;
    filter: none;
}
</style>