import { ref } from 'vue';
import type { CacheState } from './audioTypes';

const MAX_CACHE_ITEMS = 30;
// 组件之间可复用的缓存（等同你原来组件级的 Map，但现在抽出去）
const cacheStates = new Map<string, CacheState>();

export const useAudioBufferCache = () => {
    const bufferProgress = ref(0);
    const isBufferComplete = ref(false);
    const isRestoringCache = ref(false);
    let bufferCheckInterval: ReturnType<typeof setInterval> | null = null;

    const getCurrentBufferState = (audio: HTMLAudioElement | null) => {
        if (!audio || !audio.duration) return { progress: 0, bufferedEnd: 0, isComplete: false };
        try {
            if (audio.buffered.length > 0) {
                const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
                const progress = (bufferedEnd / audio.duration) * 100;
                return { progress, bufferedEnd, isComplete: progress >= 99 };
            }
        } catch { /* ignore */ }
        return { progress: 0, bufferedEnd: 0, isComplete: false };
    };

    const setCacheState = (fileUrl: string, state: CacheState) => {
        if (cacheStates.size >= MAX_CACHE_ITEMS && !cacheStates.has(fileUrl)) {
            const firstKey = cacheStates.keys().next().value;
            if (firstKey) cacheStates.delete(firstKey);
        }
        cacheStates.set(fileUrl, state);
    };

    const saveCacheState = (
        audio: HTMLAudioElement | null,
        fileUrl: string,
        isAudioLoaded: boolean,
        duration: number
    ) => {
        if (!audio) return;
        const bufferState = getCurrentBufferState(audio);
        const existing = cacheStates.get(fileUrl);

        if (existing?.isComplete) return;
        if (existing && bufferState.progress < existing.bufferProgress) return;

        const state: CacheState = {
            isLoaded: isAudioLoaded,
            duration: audio.duration || duration,
            bufferProgress: bufferState.progress,
            isComplete: bufferState.isComplete || existing?.isComplete === true,
            lastBufferedEnd: bufferState.bufferedEnd
        };
        setCacheState(fileUrl, state);
    };

    const restoreCacheState = (
        fileUrl: string,
        targetDurationRef: { value: number },
        targetIsLoadedRef: { value: boolean }
    ) => {
        const cached = cacheStates.get(fileUrl);
        if (cached) {
            isRestoringCache.value = true;
            targetIsLoadedRef.value = cached.isLoaded;
            targetDurationRef.value = cached.duration;
            bufferProgress.value = cached.bufferProgress;
            isBufferComplete.value = cached.isComplete;
            setTimeout(() => { isRestoringCache.value = false; }, 600);
            return true;
        }
        // 无缓存，重置 UI
        isRestoringCache.value = false;
        targetIsLoadedRef.value = false;
        targetDurationRef.value = 0;
        bufferProgress.value = 0;
        isBufferComplete.value = false;
        return false;
    };

    const updateBufferProgress = (audio: HTMLAudioElement | null) => {
        if (isRestoringCache.value) return;
        if (!audio || !audio.duration) return;
        const s = getCurrentBufferState(audio);
        if (s.progress >= bufferProgress.value) {
            bufferProgress.value = s.progress;
            if (s.isComplete && !isBufferComplete.value) {
                isBufferComplete.value = true;
                stopBufferCheck();
            }
        }
    };

    const startBufferCheck = (
        audio: () => HTMLAudioElement | null,
        fileUrl: () => string | null,
        isAudioLoaded: () => boolean,
        duration: () => number
    ) => {
        if (bufferCheckInterval) return;
        bufferCheckInterval = setInterval(() => {
            const el = audio();
            updateBufferProgress(el);
            const url = fileUrl();
            if (el && url) saveCacheState(el, url, isAudioLoaded(), duration());
        }, 500);
    };

    const stopBufferCheck = () => {
        if (bufferCheckInterval) {
            clearInterval(bufferCheckInterval);
            bufferCheckInterval = null;
        }
    };

    return {
        bufferProgress,
        isBufferComplete,
        isRestoringCache,
        restoreCacheState,
        saveCacheState,
        updateBufferProgress,
        startBufferCheck,
        stopBufferCheck,
    };
};
