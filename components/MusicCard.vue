<template>
    <div class="music-widget">
        <div class="picture">
            <AlbumCover :image-url="currentTrack?.image" :direction="albumCoverDirection" />
        </div>
        <div class="info" :class="{ 'involume': entervolume }">
            <div class="title">
                <TextFlip :duration="500"
                    :words="currentTrack?.title.replace(/ /g, '&nbsp;') || 'Not&nbsp;Playing'" />
            </div>
            <div class="subtitle">
                <TextFlip :duration="500" :words="currentTrack?.author.replace(/ /g, '&nbsp;') || '--'" />
            </div>
            <div class="volume">
                <div class="progresscon" @mousedown.stop @dblclick.stop data-pointer @mouseenter="entervolume = true"
                    @mouseleave="entervolume = false">
                    <div class="progress" :style="{ width: volume + '%' }"></div>
                    <input type="range" min="0" max="100" v-model="volume" @input="onVolumeInput" @change="setVolume" />
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
                <input type="range" min="0" max="100" v-model="progress" @input="onProgressInput"
                    @change="setProgress" />
            </div>
        </div>
        <div class="panel">
            <StackedPanel />
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    data: {
        title: string,
        author: string,
        file: string,
        image?: string
    }[];
}

const props = withDefaults(defineProps<Props>(), {
    data: () => []
});

// ============================================
// 缓存状态接口定义
// ============================================
interface CacheState {
    isLoaded: boolean;
    duration: number;
    bufferProgress: number;
    isComplete: boolean;
    lastBufferedEnd: number;
}

// ============================================
// 响应式状态
// ============================================
const isPlaying = ref(false);
const progress = ref<number>(0);
const volume = ref<number>(50);
const fadeVolume = ref<number>(1);
const bufferProgress = ref(0);
const isBufferComplete = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const currentTrackIndex = ref(0);
const isSeeking = ref(false);
const isAudioLoaded = ref(false);
const entervolume = ref(false)

const albumCoverDirection = ref<'next' | 'prev'>('next');

// ============================================
// 缓存管理系统
// ============================================
const cacheStates = new Map<string, CacheState>();
let isRestoringCache = false;
let bufferCheckInterval: ReturnType<typeof setInterval> | null = null;

// ============================================
// 计算属性：进度条是否可用
// ============================================

/**
 * 控制进度条是否可以交互
 * 条件：音频已加载 && 有有效的时长
 */
const isProgressBarEnabled = computed(() => {
    return isAudioLoaded.value && duration.value > 0;
});

/**
 * 当前时间显示（未加载时显示 --:--）
 */
const currentTimeDisplay = computed(() => {
    return formatTime(currentTime.value, !isProgressBarEnabled.value);
});

/**
 * 总时长显示（未加载时显示 --:--）
 */
const durationDisplay = computed(() => {
    return formatTime(duration.value, !isProgressBarEnabled.value);
});

// ============================================
// 音频对象和控制
// ============================================
let audioElement: HTMLAudioElement | null = null;
let fadeInterval: ReturnType<typeof setInterval> | null = null;
let pauseDelayTimer: ReturnType<typeof setTimeout> | null = null; // ⚠️ 新增

const currentTrack = computed(() => {
    if (props.data.length === 0) return null;
    return props.data[currentTrackIndex.value];
});

// 格式化时间
const formatTime = (seconds: number, shouldShowPlaceholder: boolean = false): string => {
    if (shouldShowPlaceholder) {
        return '--:--';
    }

    if (!isFinite(seconds) || isNaN(seconds)) return '--:--';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ============================================
// 缓存状态管理
// ============================================

/**
 * 匹配音频URL与歌曲数据
 */
const findTrackByAudioSrc = (audioSrc: string) => {
    if (!audioSrc) return null;

    let decodedSrc = '';
    try {
        decodedSrc = decodeURIComponent(audioSrc);
    } catch {
        decodedSrc = audioSrc;
    }

    const srcFileName = decodedSrc.split('/').pop() || '';

    return props.data.find(track => {
        if (audioSrc.includes(track.file) || decodedSrc.includes(track.file)) {
            return true;
        }

        const trackFileName = track.file.split('/').pop() || '';
        if (srcFileName === trackFileName) {
            return true;
        }

        const srcFileBase = srcFileName.split('.')[0];
        const trackFileBase = trackFileName.split('.')[0];
        if (srcFileBase && trackFileBase && srcFileBase === trackFileBase) {
            return true;
        }

        return false;
    });
};

/**
 * 从 audio.buffered 实时读取缓冲进度
 */
const getCurrentBufferState = (): { progress: number; bufferedEnd: number; isComplete: boolean } => {
    if (!audioElement || !audioElement.duration) {
        return { progress: 0, bufferedEnd: 0, isComplete: false };
    }

    try {
        if (audioElement.buffered.length > 0) {
            const bufferedEnd = audioElement.buffered.end(audioElement.buffered.length - 1);
            const audioDuration = audioElement.duration;
            const progress = (bufferedEnd / audioDuration) * 100;
            const isComplete = progress >= 99;

            return { progress, bufferedEnd, isComplete };
        }
    } catch (e) {
    }

    return { progress: 0, bufferedEnd: 0, isComplete: false };
};

/**
 * 保存指定歌曲的缓存状态
 */
const saveCacheState = () => {
    if (!audioElement || !audioElement.src) return;

    const audioSrc = audioElement.src;
    const trackData = findTrackByAudioSrc(audioSrc);

    if (!trackData) {
        return;
    }

    const fileUrl = trackData.file;
    const bufferState = getCurrentBufferState();
    const existingCache = cacheStates.get(fileUrl);

    if (existingCache?.isComplete) {
        return;
    }

    if (existingCache && bufferState.progress < existingCache.bufferProgress) {
        return;
    }

    const state: CacheState = {
        isLoaded: isAudioLoaded.value,
        duration: audioElement.duration || duration.value,
        bufferProgress: bufferState.progress,
        isComplete: bufferState.isComplete || (existingCache?.isComplete ?? false),
        lastBufferedEnd: bufferState.bufferedEnd
    };

    cacheStates.set(fileUrl, state);
};

/**
 * 恢复歌曲的缓存状态，并同步到UI
 */
const restoreCacheState = (fileUrl: string): boolean => {
    const cached = cacheStates.get(fileUrl);

    if (cached) {
        isRestoringCache = true;

        isAudioLoaded.value = cached.isLoaded;
        duration.value = cached.duration;
        bufferProgress.value = cached.bufferProgress;
        isBufferComplete.value = cached.isComplete;

        setTimeout(() => {
            isRestoringCache = false;
        }, 600);

        return true;
    } else {
        isRestoringCache = false;
        isAudioLoaded.value = false;
        duration.value = 0;
        bufferProgress.value = 0;
        isBufferComplete.value = false;

        return false;
    }
};

// ============================================
// 音量淡入淡出
// ============================================

/**
 * 音量淡入淡出（支持最大时长限制）
 * @param targetFadeVolume 目标淡入淡出系数 (0-1)
 * @param maxDuration 最大动画时长（毫秒），可选
 */
const fadeTo = (targetFadeVolume: number, maxDuration?: number): Promise<void> => {
    return new Promise((resolve) => {
        if (!audioElement) {
            resolve();
            return;
        }

        if (fadeInterval) {
            clearInterval(fadeInterval);
            fadeInterval = null;
        }

        const startFadeVolume = fadeVolume.value;
        const volumeChange = targetFadeVolume - startFadeVolume;

        if (Math.abs(volumeChange) < 0.01) {
            fadeVolume.value = targetFadeVolume;
            updateActualVolume();
            resolve();
            return;
        }

        const normalDuration = Math.abs(volumeChange) * 1000;

        const totalDuration = maxDuration !== undefined
            ? Math.min(normalDuration, maxDuration)
            : normalDuration;

        const steps = 50;
        const stepDuration = totalDuration / steps;
        const volumeStep = volumeChange / steps;

        let currentStep = 0;

        fadeInterval = setInterval(() => {
            if (!audioElement || currentStep >= steps) {
                if (fadeInterval) {
                    clearInterval(fadeInterval);
                    fadeInterval = null;
                }
                fadeVolume.value = targetFadeVolume;
                updateActualVolume();
                resolve();
                return;
            }

            currentStep++;
            const newFadeVolume = startFadeVolume + (volumeStep * currentStep);
            fadeVolume.value = Math.max(0, Math.min(1, newFadeVolume));
            updateActualVolume();
        }, stepDuration);
    });
};

// ============================================
// 缓冲进度管理
// ============================================

/**
 * 更新缓冲进度（只增不减策略）
 */
const updateBufferProgress = () => {
    if (isRestoringCache) return;

    if (!audioElement || !audioElement.duration) return;

    const bufferState = getCurrentBufferState();

    // 只增不减
    if (bufferState.progress >= bufferProgress.value) {
        bufferProgress.value = bufferState.progress;

        if (bufferState.isComplete && !isBufferComplete.value) {
            isBufferComplete.value = true;
            stopBufferCheck();
        }
    }
};

/**
 * 开始定期检查缓冲进度
 */
const startBufferCheck = () => {
    if (bufferCheckInterval) return;

    bufferCheckInterval = setInterval(() => {
        updateBufferProgress();
        saveCacheState();
    }, 500);
};

/**
 * 停止检查缓冲进度
 */
const stopBufferCheck = () => {
    if (bufferCheckInterval) {
        clearInterval(bufferCheckInterval);
        bufferCheckInterval = null;
    }
};

// ============================================
// 预加载策略管理
// ============================================

const setPreloadStrategy = (strategy: 'none' | 'metadata' | 'auto') => {
    if (!audioElement) return;
    audioElement.preload = strategy;
};

// ============================================
// 音频初始化
// ============================================

/**
 * 初始化音频对象
 */
const initAudio = () => {
    if (!currentTrack.value) return;

    const fileUrl = currentTrack.value.file;
    const hasCachedState = restoreCacheState(fileUrl);

    if (audioElement && audioElement.src && audioElement.src.includes(fileUrl)) {
        return;
    }

    if (audioElement) {
        if (audioElement.src) {
            saveCacheState();
        }

        audioElement.pause();
        audioElement.src = '';
        audioElement = null;
    }

    stopBufferCheck();
    audioElement = new Audio();
    fadeVolume.value = 0;
    updateActualVolume();
    audioElement.preload = 'none';

    // ========================================
    // 事件监听器
    // ========================================

    audioElement.addEventListener('timeupdate', () => {
        if (!audioElement || isSeeking.value) return;
        currentTime.value = audioElement.currentTime;
        if (duration.value > 0) {
            progress.value = (audioElement.currentTime / duration.value) * 100;
        }
    });

    audioElement.addEventListener('progress', updateBufferProgress);
    audioElement.addEventListener('loadeddata', updateBufferProgress);
    audioElement.addEventListener('canplay', updateBufferProgress);
    audioElement.addEventListener('canplaythrough', updateBufferProgress);

    audioElement.addEventListener('loadedmetadata', () => {
        if (!audioElement) return;

        if (duration.value === 0 || !hasCachedState) {
            duration.value = audioElement.duration;
        }

        isAudioLoaded.value = true;
        setTimeout(updateBufferProgress, 100);
    });

    audioElement.addEventListener('play', () => {
        setPreloadStrategy('auto');
        startBufferCheck();
    });

    audioElement.addEventListener('pause', () => {
        saveCacheState();
        setPreloadStrategy('metadata');
        stopBufferCheck();
    });

    audioElement.addEventListener('ended', () => {
        isPlaying.value = false;
        if (audioElement) audioElement.volume = 0;
        saveCacheState();
        stopBufferCheck();
        playNext(true);
    });

    audioElement.addEventListener('error', (e) => {
        if (audioElement && audioElement.error) {
            isPlaying.value = false;
            isAudioLoaded.value = false;
            stopBufferCheck();
        }
    });
};

// ============================================
// 音频加载
// ============================================

const loadAudio = async () => {
    if (!audioElement || !currentTrack.value) return;

    const fileUrl = currentTrack.value.file;

    if (isAudioLoaded.value && audioElement.src.includes(fileUrl) && audioElement.readyState >= 1) {
        return;
    }

    try {
        if (!audioElement.src || !audioElement.src.includes(fileUrl)) {
            audioElement.preload = 'metadata';
            audioElement.src = fileUrl;
        }

        if (audioElement.readyState >= 1) {
            isAudioLoaded.value = true;
            setTimeout(updateBufferProgress, 100);
            return;
        }

        await new Promise<void>((resolve, reject) => {
            if (!audioElement) {
                reject(new Error('Audio element not found'));
                return;
            }

            const onLoaded = () => {
                audioElement?.removeEventListener('loadedmetadata', onLoaded);
                audioElement?.removeEventListener('error', onError);
                resolve();
            };

            const onError = () => {
                audioElement?.removeEventListener('loadedmetadata', onLoaded);
                audioElement?.removeEventListener('error', onError);
                reject(new Error('Load failed'));
            };

            audioElement.addEventListener('loadedmetadata', onLoaded, { once: true });
            audioElement.addEventListener('error', onError, { once: true });

            if (audioElement.readyState >= 1) {
                onLoaded();
            }
        });

        isAudioLoaded.value = true;
        setTimeout(updateBufferProgress, 100);
    } catch (error) {
        console.error('[Audio] Load error:', error);
        throw error;
    }
};

// ============================================
// 播放控制
// ============================================

const togglePlay = async () => {
    if (!audioElement || !currentTrack.value) return;

    if (isPlaying.value) {
        isPlaying.value = false;

        const remainingTime = duration.value - currentTime.value;
        const normalFadeDuration = fadeVolume.value * 1000;

        // 500ms 冗余
        const safeFadeDuration = remainingTime > 0.5
            ? Math.min(normalFadeDuration, (remainingTime - 0.5) * 1000)
            : 0;

        await fadeTo(0, safeFadeDuration);

        if (!isPlaying.value && audioElement) {
            audioElement.pause();
        }
    } else {
        try {
            if (!isAudioLoaded.value) {
                await loadAudio();
            }
            if (audioElement.paused) {
                await audioElement.play();
            }
            isPlaying.value = true;
            await fadeTo(1);
        } catch (error) {
            console.error('[Player] Play failed:', error);
            isPlaying.value = false;
        }
    }
};

const playNext = async (autoPlay = false) => {
    if (props.data.length === 0) return;

    albumCoverDirection.value = 'next'; // ✅ 设置为下一首方向

    const shouldAutoPlay = autoPlay || !isPlaying.value;

    if (audioElement && audioElement.src) {
        saveCacheState();
    }

    currentTrackIndex.value = (currentTrackIndex.value + 1) % props.data.length;
    await loadAndPlay(shouldAutoPlay);
};

const playPrevious = async () => {
    if (props.data.length === 0) return;

    albumCoverDirection.value = 'prev'; // ✅ 设置为上一首方向

    const shouldAutoPlay = !isPlaying.value;

    if (audioElement && audioElement.src) {
        saveCacheState();
    }

    currentTrackIndex.value = currentTrackIndex.value === 0
        ? props.data.length - 1
        : currentTrackIndex.value - 1;
    await loadAndPlay(shouldAutoPlay);
};

/**
 * 加载并播放新音轨（防止闪烁版本）
 */
const loadAndPlay = async (shouldAutoPlay = false) => {
    if (!currentTrack.value) return;

    const wasPlaying = isPlaying.value;

    if (pauseDelayTimer) {
        clearTimeout(pauseDelayTimer);
        pauseDelayTimer = null;
    }

    if (audioElement) {
        if (fadeInterval) {
            clearInterval(fadeInterval);
            fadeInterval = null;
        }
        audioElement.volume = 0;
    }

    progress.value = 0;
    currentTime.value = 0;
    stopBufferCheck();
    initAudio();

    if (shouldAutoPlay || wasPlaying) {
        let loadingFailed = false;

        pauseDelayTimer = setTimeout(() => {
            if (!isPlaying.value && !loadingFailed) {
                isPlaying.value = false;
            }
            pauseDelayTimer = null;
        }, 300);

        try {
            await loadAudio();

            if (audioElement) {
                await audioElement.play();

                if (pauseDelayTimer) {
                    clearTimeout(pauseDelayTimer);
                    pauseDelayTimer = null;
                }

                isPlaying.value = true;
                fadeTo(1);
            }
        } catch (error) {
            loadingFailed = true;

            if (pauseDelayTimer) {
                clearTimeout(pauseDelayTimer);
                pauseDelayTimer = null;
            }

            console.error('[Player] Auto play failed:', error);
            isPlaying.value = false;
        }
    } else {
        isPlaying.value = false;
    }
};

// ============================================
// 音量控制系统
// ============================================

/**
 * 更新音频元素的实际音量
 * 实际音量 = 全局音量 × 淡入淡出系数
 */
const updateActualVolume = () => {
    if (!audioElement) return;

    const globalVolume = volume.value / 100;
    const actualVolume = globalVolume * fadeVolume.value;

    audioElement.volume = Math.max(0, Math.min(1, actualVolume));
};

/**
 * 音量条拖动中
 */
const onVolumeInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (!isNaN(value)) {
        volume.value = value;
        updateActualVolume();
    }
};

/**
 * 音量条释放（可选，用于保存设置等）
 */
const setVolume = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (!isNaN(value)) {
        volume.value = value;
        updateActualVolume();

        try {
            localStorage.setItem('musicPlayerVolume', value.toString());
        } catch (e) {
        }
    }
};

// ============================================
// 进度条控制
// ============================================

/**
 * 进度条拖动中
 */
const onProgressInput = (event: Event) => {
    if (!isProgressBarEnabled.value) {
        return;
    }

    isSeeking.value = true;

    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (!isNaN(value)) {
        progress.value = value;

        if (duration.value > 0) {
            currentTime.value = (value / 100) * duration.value;
        }
    }
};

/**
 * 设置播放进度
 */
const setProgress = async (event: Event) => {
    if (!isProgressBarEnabled.value) {
        isSeeking.value = false;
        return;
    }

    if (!audioElement || !duration.value) {
        isSeeking.value = false;
        return;
    }

    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (isNaN(value)) {
        console.error('[Player] Invalid progress value:', target.value);
        isSeeking.value = false;
        return;
    }

    progress.value = value;

    if (!isAudioLoaded.value) {
        try {
            await loadAudio();
        } catch (error) {
            console.error('[Player] Load failed for seeking:', error);
            isSeeking.value = false;
            return;
        }
    }

    const newTime = (value / 100) * duration.value;
    audioElement.currentTime = newTime;
    currentTime.value = newTime;

    isSeeking.value = false;
};

// ============================================
// 生命周期
// ============================================

watch(() => props.data, (newData) => {
    if (newData.length > 0 && currentTrackIndex.value >= newData.length) {
        currentTrackIndex.value = 0;
    }
    if (newData.length > 0) {
        initAudio();
    }
}, { immediate: true });

onMounted(() => {
    try {
        const savedVolume = localStorage.getItem('musicPlayerVolume');
        if (savedVolume !== null) {
            const volumeValue = parseFloat(savedVolume);
            if (!isNaN(volumeValue) && volumeValue >= 0 && volumeValue <= 100) {
                volume.value = volumeValue;
            }
        }
    } catch (e) {
    }

    if (props.data.length > 0) {
        initAudio();
    }
});

onUnmounted(() => {
    if (audioElement && audioElement.src) {
        saveCacheState();
    }

    if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
    }

    if (pauseDelayTimer) {
        clearTimeout(pauseDelayTimer);
        pauseDelayTimer = null;
    }

    stopBufferCheck();

    if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        audioElement = null;
    }
});
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
            filter: blur(5px);
            height: 3em;
            width: 12em;
            flex-direction: row-reverse;
            transition: opacity .6s, filter .6s, fill .6s;
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

                input[type="range"] {
                    -webkit-appearance: none;
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

                    input[type="range"] {
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

                &.right {
                    justify-content: flex-end;

                    .time {
                        transform: translateX(-18px);
                    }
                }

                .time {
                    width: 0;
                    margin-bottom: .1389em; // DEV
                    font-size: 1.8em;
                    filter: blur(5px);
                    opacity: 0;
                    pointer-events: none;
                    transition: .6s;

                    &.total {
                        text-align: right;
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
            filter: blur(5px);
            height: 1.25em;
            display: flex;
            align-items: center;
            position: absolute;
            transition: filter .6s, opacity .6s;

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
                    width: 25%;
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

            input[type="range"] {
                -webkit-appearance: none;
                appearance: none;
                margin: 0;
                opacity: 0;
                width: 100%;
                height: 100%;
                position: absolute;
            }

            input[type="range"]::-webkit-slider-runnable-track {
                height: .45rem;
            }

            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 0;
                height: 100%;
            }
        }
    }

    .panel {
        opacity: 0;
        filter: blur(15px);
        position: absolute;
        transition: opacity .6s, filter .6s, margin .6s, height .6s;
        margin-top: var(--square-size);
        top: 16.5em;
        width: 46em;
        height: var(--square-size);
        justify-content: space-between;
        display: flex;

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
                filter: none;
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
                    filter: none;
                    opacity: 1;
                }
            }

            .rangeinput {
                filter: none;
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
    transform: scale(0.6);
    filter: blur(8px);
}

.faded-enter-to,
.faded-leave-from {
    opacity: 1;
    transform: none;
    filter: blur(0);
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
    filter: blur(0);
}
</style>