// /composables/audio/useAudioPlayer.ts

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { TrackItem, EqualizerBand } from './audioTypes';
import { formatTime } from './audioUtils';
import { useAudioBufferCache } from './useAudioBufferCache';
import { useAudioEqualizer } from './useAudioEqualizer';
import { useArtworkCache } from './useArtworkCache';

// =====================
// 可调参数
// =====================
const FADE_STEPS = 50;               // 淡入/淡出分段
const PLAY_GUARD_MS = 1000;          // 播放保护期
const AUTOPLAY_WAIT_MS = 300;        // 自动播放的最短等待
const MIN_SAFE_REMAINING_S = 0.5;    // 手动暂停时的“安全剩余时长”
const UI_TRANSITION_GRACE_MS = 1200; // 切歌过渡的 UI 保持时间
const ENDING_EPS_S = 0.5;            // 曲末渐出容差

type NavigatorHook = {
    next?: () => Promise<void> | void;
    prev?: () => Promise<void> | void;
    ended?: () => Promise<void> | void;
};

const artwork = useArtworkCache();

export const useAudioPlayer = (initialList: TrackItem[] = []) => {
    const playlist = ref<TrackItem[]>(initialList);
    const currentTrackIndex = ref(0);
    const _isPlaying = ref(false);
    const playGuardActive = ref(false);
    let playGuardTimer: ReturnType<typeof setTimeout> | null = null;
    const transitioning = ref(false);
    let transitionTimer: ReturnType<typeof setTimeout> | null = null;
    let pauseDueToSwitch = false;
    let manualPauseRequested = false;
    let audioElement: HTMLAudioElement | null = null;
    let fadeInterval: ReturnType<typeof setInterval> | null = null;
    let pauseDelayTimer: ReturnType<typeof setTimeout> | null = null;
    const isAudioLoaded = ref(false);
    const duration = ref(0);
    const currentTime = ref(0);
    const progress = ref(0);
    const volume = ref(50);
    const fadeVolume = ref(1);
    const isSeeking = ref(false);
    const eqEnabled = ref(true);
    const latestEQSettings = ref<EqualizerBand[] | null>(null);
    const navigatorHook = ref<NavigatorHook | null>(null);

    const {
        bufferProgress,
        isBufferComplete,
        restoreCacheState,
        saveCacheState,
        updateBufferProgress,
        startBufferCheck,
        stopBufferCheck,
    } = useAudioBufferCache();

    const {
        isEqualizerInitialized,
        initEqualizer,
        connectAudioToEqualizer,
        connectBypass,
        applyEqualizerSettings,
        destroyEqualizer
    } = useAudioEqualizer();

    const currentTrack = computed(() =>
        playlist.value.length ? playlist.value[currentTrackIndex.value] : null
    );

    const isPlaying = computed(() => _isPlaying.value || playGuardActive.value || transitioning.value);
    const isProgressBarEnabled = computed(() => isAudioLoaded.value && duration.value > 0);
    const currentTimeDisplay = computed(() => formatTime(currentTime.value, !isProgressBarEnabled.value));
    const durationDisplay = computed(() => formatTime(duration.value, !isProgressBarEnabled.value));

    const clearPlayGuard = () => {
        playGuardActive.value = false;
        if (playGuardTimer) { clearTimeout(playGuardTimer); playGuardTimer = null; }
    };

    const beginTransitionHold = (ms = UI_TRANSITION_GRACE_MS) => {
        transitioning.value = true;
        if (transitionTimer) clearTimeout(transitionTimer);
        transitionTimer = setTimeout(() => {
            transitioning.value = false;
            transitionTimer = null;
        }, ms);
    };
    const endTransitionHold = () => {
        transitioning.value = false;
        if (transitionTimer) { clearTimeout(transitionTimer); transitionTimer = null; }
    };

    // =====================
    // 音量 & 淡入淡出
    // =====================
    const updateActualVolume = () => {
        if (!audioElement) return;
        const globalVolume = volume.value / 100;
        const actual = globalVolume * fadeVolume.value;
        audioElement.volume = Math.max(0, Math.min(1, actual));
    };

    const fadeTo = (target: number, maxDuration?: number) =>
        new Promise<void>((resolve) => {
            if (!audioElement) return resolve();
            if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null; }
            const start = fadeVolume.value;
            const delta = target - start;
            if (Math.abs(delta) < 0.01) {
                fadeVolume.value = target;
                updateActualVolume();
                return resolve();
            }
            const normal = Math.abs(delta) * 1000;
            const total = maxDuration !== undefined ? Math.min(normal, maxDuration) : normal;
            const stepDur = total / FADE_STEPS;
            const step = delta / FADE_STEPS;
            let i = 0;
            fadeInterval = setInterval(() => {
                if (!audioElement || i >= FADE_STEPS) {
                    if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null; }
                    fadeVolume.value = target;
                    updateActualVolume();
                    return resolve();
                }
                i++;
                const v = start + step * i;
                fadeVolume.value = Math.max(0, Math.min(1, v));
                updateActualVolume();
            }, stepDur);
        });

    const setPreloadStrategy = (s: 'none' | 'metadata' | 'auto') => { if (audioElement) audioElement.preload = s; };

    // =====================
    // Media Session 辅助
    // =====================
    const hasMediaSession = () => typeof navigator !== 'undefined' && 'mediaSession' in navigator;

    const updateMediaSessionMetadata = () => {
        if (!hasMediaSession()) return;
        const track = currentTrack.value;
        try {
            navigator.mediaSession.metadata = track
                ? new MediaMetadata({
                    title: track.title,
                    artist: track.author,
                    artwork: track.image ? [{ src: track.image, sizes: '512x512', type: 'image/png' }] : []
                })
                : null;
        } catch { }
    };

    const updateMediaSessionPosition = () => {
        if (!hasMediaSession() || !audioElement) return;
        const d = Number.isFinite(audioElement.duration) ? audioElement.duration : duration.value;
        const pos = Number.isFinite(audioElement.currentTime) ? audioElement.currentTime : currentTime.value;
        if (!(Number.isFinite(d) && d > 0)) return;
        const clamped = Math.max(0, Math.min(pos, d));
        try {
            navigator.mediaSession.setPositionState({
                duration: d,
                position: clamped,
                playbackRate: audioElement.playbackRate || 1
            });
        } catch { }
    };

    const installMediaSessionHandlers = () => {
        if (!hasMediaSession()) return;

        try {
            navigator.mediaSession.setActionHandler('play', async () => {
                if (!audioElement) return;
                if (audioElement.paused) await togglePlay();
            });
        } catch { }
        try {
            navigator.mediaSession.setActionHandler('pause', async () => {
                if (!audioElement) return;
                if (!_isPlaying.value) return;
                await togglePlay();
            });
        } catch { }

        try {
            navigator.mediaSession.setActionHandler('previoustrack', async () => {
                if (navigatorHook.value?.prev) await navigatorHook.value.prev();
                else await playPrevious();
            });
        } catch { }
        try {
            navigator.mediaSession.setActionHandler('nexttrack', async () => {
                if (navigatorHook.value?.next) await navigatorHook.value.next();
                else await playNext();
            });
        } catch { }

        try {
            navigator.mediaSession.setActionHandler('seekto', async (e: any) => {
                if (!audioElement || !e?.seekTime) return;
                const d = Number.isFinite(audioElement.duration) ? audioElement.duration : duration.value;
                if (!(Number.isFinite(d) && d > 0)) return;
                const target = Math.max(0, Math.min(e.seekTime, d));
                audioElement.currentTime = target;
                currentTime.value = target;
                updateMediaSessionPosition();
            });
        } catch { }
    };

    // =====================
    // 音频初始化
    // =====================
    const initAudio = () => {
        const track = currentTrack.value;
        if (!track) return;

        const fileUrl = track.file;
        const hasCached = restoreCacheState(fileUrl, duration, isAudioLoaded);

        if (audioElement && audioElement.src && audioElement.src.includes(fileUrl)) return;

        if (audioElement) {
            if (audioElement.src) {
                try { saveCacheState(audioElement, audioElement.src, isAudioLoaded.value, duration.value); } catch { }
            }
            pauseDueToSwitch = true;
            try { audioElement.pause(); } catch { }
            try { audioElement.src = ''; } catch { }
            audioElement = null;
        }

        stopBufferCheck();
        audioElement = new Audio();
        fadeVolume.value = 0;
        updateActualVolume();
        audioElement.preload = 'none';

        if (isEqualizerInitialized.value) {
            if (eqEnabled.value) connectAudioToEqualizer(audioElement);
            else connectBypass(audioElement);
        }

        audioElement.addEventListener('timeupdate', () => {
            if (!audioElement || isSeeking.value) return;
            currentTime.value = audioElement.currentTime;
            if (duration.value > 0) {
                progress.value = (audioElement.currentTime / duration.value) * 100;
            }
            updateMediaSessionPosition();
        });

        const refresh = () => {
            updateBufferProgress(audioElement);
            updateMediaSessionPosition();
        };
        audioElement.addEventListener('progress', refresh);
        audioElement.addEventListener('loadeddata', refresh);
        audioElement.addEventListener('canplay', refresh);
        audioElement.addEventListener('canplaythrough', refresh);

        audioElement.addEventListener('loadedmetadata', () => {
            if (!audioElement) return;
            if (duration.value === 0 || !hasCached) duration.value = audioElement.duration;
            isAudioLoaded.value = true;
            setTimeout(refresh, 100);
            updateMediaSessionMetadata();
            updateMediaSessionPosition();
        });

        audioElement.addEventListener('play', async () => {
            if (!_isPlaying.value) {
                if (!audioElement || !currentTrack.value) return;
                try {
                    if (!isAudioLoaded.value) await loadAudio();
                    if (audioElement.paused) await audioElement.play();
                    _isPlaying.value = true;
                    playGuardActive.value = false;
                    if (playGuardTimer) { clearTimeout(playGuardTimer); playGuardTimer = null; }
                    await fadeTo(1);
                } catch {
                    _isPlaying.value = false;
                }
            }
            setPreloadStrategy('auto');
            startBufferCheck(
                () => audioElement,
                () => currentTrack.value?.file ?? null,
                () => isAudioLoaded.value,
                () => duration.value
            );
            endTransitionHold();
            pauseDueToSwitch = false;

            updateMediaSessionMetadata();
            updateMediaSessionPosition();
        });

        audioElement.addEventListener('pause', async () => {
            const ae = audioElement;
            const d = ae && Number.isFinite(ae.duration) ? ae.duration : duration.value;
            const t = ae && Number.isFinite(ae.currentTime) ? ae.currentTime : currentTime.value;
            const isEndingSoon =
                Number.isFinite(d) && Number.isFinite(t) && d > 0 && (d - t) <= ENDING_EPS_S;

            if (!manualPauseRequested && isEndingSoon) {
                pauseDueToSwitch = true;
                beginTransitionHold();
                const url = currentTrack.value?.file;
                if (ae && url) saveCacheState(ae, url, isAudioLoaded.value, duration.value);
                setPreloadStrategy('metadata');
                stopBufferCheck();
                updateMediaSessionPosition();
                return;
            }

            if (manualPauseRequested) {
                manualPauseRequested = false;
                _isPlaying.value = false;
                await fadeTo(0, 0);
                if (ae) ae.pause();
                const url = currentTrack.value?.file;
                if (ae && url) saveCacheState(ae, url, isAudioLoaded.value, duration.value);
                setPreloadStrategy('metadata');
                stopBufferCheck();
                updateMediaSessionPosition();
                return;
            }

            if (pauseDueToSwitch || transitioning.value) {
                const url = currentTrack.value?.file;
                if (ae && url) saveCacheState(ae, url, isAudioLoaded.value, duration.value);
                setPreloadStrategy('metadata');
                stopBufferCheck();
                updateMediaSessionPosition();
                return;
            }

            _isPlaying.value = false;
            await fadeTo(0, 0);
            const url = currentTrack.value?.file;
            if (ae && url) saveCacheState(ae, url, isAudioLoaded.value, duration.value);
            setPreloadStrategy('metadata');
            stopBufferCheck();
            updateMediaSessionPosition();
        });

        audioElement.addEventListener('ended', async () => {
            beginTransitionHold();
            pauseDueToSwitch = true;

            _isPlaying.value = false;
            if (audioElement) audioElement.volume = 0;
            const url = currentTrack.value?.file;
            if (audioElement && url) saveCacheState(audioElement, url, isAudioLoaded.value, duration.value);
            stopBufferCheck();

            if (navigatorHook.value?.ended) {
                await navigatorHook.value.ended();
            } else if (navigatorHook.value?.next) {
                await navigatorHook.value.next();
            } else {
                await playNext();
            }

            updateMediaSessionPosition();
        });

        audioElement.addEventListener('error', () => {
            _isPlaying.value = false;
            isAudioLoaded.value = false;
            stopBufferCheck();
        });
    };

    // =====================
    // 加载 & 播放
    // =====================
    const loadAudio = async () => {
        if (!isEqualizerInitialized.value) {
            const ok = initEqualizer();
            if (ok && audioElement) {
                if (eqEnabled.value) connectAudioToEqualizer(audioElement);
                else connectBypass(audioElement);
            }
        } else if (audioElement) {
            if (eqEnabled.value) connectAudioToEqualizer(audioElement);
            else connectBypass(audioElement);
        }

        if (eqEnabled.value && isEqualizerInitialized.value && latestEQSettings.value) {
            applyEqualizerSettings(latestEQSettings.value);
        }

        if (!audioElement || !currentTrack.value) return;
        const fileUrl = currentTrack.value.file;

        if (isAudioLoaded.value && audioElement.src.includes(fileUrl) && audioElement.readyState >= 1) {
            return;
        }

        if (!audioElement.src || !audioElement.src.includes(fileUrl)) {
            audioElement.preload = 'metadata';
            audioElement.src = fileUrl;
        }

        if (audioElement.readyState >= 1) {
            isAudioLoaded.value = true;
            setTimeout(() => updateBufferProgress(audioElement), 100);
            updateMediaSessionMetadata();
            updateMediaSessionPosition();
            return;
        }

        await new Promise<void>((resolve, reject) => {
            if (!audioElement) return reject(new Error('no audio element'));
            const onLoaded = () => {
                audioElement?.removeEventListener('loadedmetadata', onLoaded);
                audioElement?.removeEventListener('error', onError);
                resolve();
            };
            const onError = () => {
                audioElement?.removeEventListener('loadedmetadata', onLoaded);
                audioElement?.removeEventListener('error', onError);
                reject(new Error('load fail'));
            };
            audioElement.addEventListener('loadedmetadata', onLoaded, { once: true });
            audioElement.addEventListener('error', onError, { once: true });
            if (audioElement.readyState >= 1) onLoaded();
        });

        isAudioLoaded.value = true;
        setTimeout(() => updateBufferProgress(audioElement), 100);
        updateMediaSessionMetadata();
        updateMediaSessionPosition();
    };

    const togglePlay = async () => {
        if (!audioElement || !currentTrack.value) return;

        if (_isPlaying.value) {
            clearPlayGuard();
            _isPlaying.value = false;
            const remaining = duration.value - currentTime.value;
            const normalFade = fadeVolume.value * 1000;
            const safeFade = remaining > MIN_SAFE_REMAINING_S
                ? Math.min(normalFade, (remaining - MIN_SAFE_REMAINING_S) * 1000)
                : 0;
            await fadeTo(0, safeFade);
            if (!_isPlaying.value && audioElement) {
                manualPauseRequested = true;
                audioElement.pause();
            }
        } else {
            try {
                if (!isAudioLoaded.value) await loadAudio();
                if (audioElement.paused) await audioElement.play();
                _isPlaying.value = true;
                playGuardActive.value = false;
                if (playGuardTimer) { clearTimeout(playGuardTimer); playGuardTimer = null; }
                await fadeTo(1);
            } catch {
                _isPlaying.value = false;
            }
        }
        updateMediaSessionPosition();
    };

    const loadAndPlay = async (autoPlay = true) => {
        beginTransitionHold();
        if (!currentTrack.value) return;

        if (pauseDelayTimer) { clearTimeout(pauseDelayTimer); pauseDelayTimer = null; }
        if (audioElement) {
            if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null; }
            audioElement.volume = 0;
        }
        progress.value = 0;
        currentTime.value = 0;
        stopBufferCheck();
        initAudio();

        if (!autoPlay) { _isPlaying.value = false; return; }

        playGuardActive.value = true;
        if (playGuardTimer) { clearTimeout(playGuardTimer); }
        playGuardTimer = setTimeout(() => {
            playGuardActive.value = false;
            playGuardTimer = null;
        }, PLAY_GUARD_MS);

        let loadingFailed = false;
        pauseDelayTimer = setTimeout(() => {
            if (!_isPlaying.value && !loadingFailed) {
                _isPlaying.value = false;
            }
            pauseDelayTimer = null;
        }, AUTOPLAY_WAIT_MS);

        try {
            await loadAudio();
            if (audioElement) {
                await audioElement.play();
                if (pauseDelayTimer) { clearTimeout(pauseDelayTimer); pauseDelayTimer = null; }
                _isPlaying.value = true;
                playGuardActive.value = false;
                if (playGuardTimer) { clearTimeout(playGuardTimer); playGuardTimer = null; }
                fadeTo(1);
            }
        } catch {
            loadingFailed = true;
            if (pauseDelayTimer) { clearTimeout(pauseDelayTimer); pauseDelayTimer = null; }
            _isPlaying.value = false;
        }

        updateMediaSessionMetadata();
        updateMediaSessionPosition();
    };

    const playNext = async () => {
        beginTransitionHold();
        if (!playlist.value.length) return;
        if (audioElement && audioElement.src) {
            const url = currentTrack.value?.file;
            if (url) saveCacheState(audioElement, url, isAudioLoaded.value, duration.value);
        }
        pauseDueToSwitch = true;
        currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.value.length;
        await loadAndPlay(true);
    };

    const playPrevious = async () => {
        beginTransitionHold();
        if (!playlist.value.length) return;
        if (audioElement && audioElement.src) {
            const url = currentTrack.value?.file;
            if (url) saveCacheState(audioElement, url, isAudioLoaded.value, duration.value);
        }
        pauseDueToSwitch = true;
        currentTrackIndex.value =
            currentTrackIndex.value === 0 ? playlist.value.length - 1 : currentTrackIndex.value - 1;
        await loadAndPlay(true);
    };

    const onProgressInput = (val: number) => {
        if (!isProgressBarEnabled.value) return;
        isSeeking.value = true;
        progress.value = val;
        if (duration.value > 0) currentTime.value = (val / 100) * duration.value;
    };

    const setProgressValue = async (val: number) => {
        if (!isProgressBarEnabled.value) { isSeeking.value = false; return; }
        if (!audioElement || !duration.value) { isSeeking.value = false; return; }

        progress.value = val;
        if (!isAudioLoaded.value) {
            try { await loadAudio(); } catch {
                isSeeking.value = false;
                return;
            }
        }
        const newTime = (val / 100) * duration.value;
        audioElement.currentTime = newTime;
        currentTime.value = newTime;
        isSeeking.value = false;
        updateMediaSessionPosition();
    };

    const onVolumeChange = (val: number) => {
        volume.value = val;
        updateActualVolume();
        try { localStorage.setItem('musicPlayerVolume', val.toString()); } catch { }
    };

    const setPlaylist = (list: TrackItem[]) => {
        playlist.value = list;
        if (list.length > 0 && currentTrackIndex.value >= list.length) currentTrackIndex.value = 0;
        if (list.length > 0) initAudio();

        artwork.primeFromPlaylist(list);
        artwork.prefetchAround(list, currentTrackIndex.value, 3);
    };

    const applyEQ = (bands: EqualizerBand[]) => {
        latestEQSettings.value = bands;
        if (eqEnabled.value && isEqualizerInitialized.value) {
            applyEqualizerSettings(bands);
        }
    };

    const setEQEnabled = (on: boolean) => {
        eqEnabled.value = on;
        if (!audioElement) return;
        if (!isEqualizerInitialized.value) return;
        if (on) {
            connectAudioToEqualizer(audioElement);
            if (latestEQSettings.value) applyEqualizerSettings(latestEQSettings.value);
        } else {
            connectBypass(audioElement);
        }
    };

    const setNavigator = (hook: NavigatorHook | null) => {
        navigatorHook.value = hook;
        installMediaSessionHandlers();
    };

    onMounted(() => {
        try {
            const saved = localStorage.getItem('musicPlayerVolume');
            if (saved !== null) {
                const v = parseFloat(saved);
                if (!isNaN(v) && v >= 0 && v <= 100) volume.value = v;
            }
        } catch { }
        if (playlist.value.length > 0) initAudio();
        installMediaSessionHandlers();
        updateMediaSessionMetadata();
    });

    onUnmounted(async () => {
        if (audioElement && audioElement.src) {
            const url = currentTrack.value?.file;
            if (url) saveCacheState(audioElement, url, isAudioLoaded.value, duration.value);
        }
        if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null; }
        if (pauseDelayTimer) { clearTimeout(pauseDelayTimer); pauseDelayTimer = null; }
        if (playGuardTimer) { clearTimeout(playGuardTimer); playGuardTimer = null; }
        if (transitionTimer) { clearTimeout(transitionTimer); transitionTimer = null; }

        stopBufferCheck();
        if (audioElement) {
            try { audioElement.pause(); } catch { }
            try { audioElement.src = ''; } catch { }
            audioElement = null;
        }
        await destroyEqualizer();
    });

    watch(currentTrack, () => {
        updateMediaSessionMetadata();
        updateMediaSessionPosition();
    });

    watch(playlist, (newList) => {
        if (newList.length > 0 && currentTrackIndex.value >= newList.length) currentTrackIndex.value = 0;
    });

    watch(currentTrackIndex, (idx) => {
        if (playlist.value.length) artwork.prefetchAround(playlist.value, idx, 3);
    });

    return {
        playlist,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        isAudioLoaded,
        duration,
        currentTime,
        progress,
        volume,
        bufferProgress,
        isBufferComplete,
        isProgressBarEnabled,
        currentTimeDisplay,
        durationDisplay,
        eqEnabled,

        setPlaylist,
        togglePlay,
        playNext,
        playPrevious,
        onProgressInput,
        setProgressValue,
        onVolumeChange,
        loadAndPlay,
        applyEQ,
        setEQEnabled,
        setNavigator,
    };
};
