// /composables/audio/useAudioPlayer.ts
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { TrackItem, EqualizerBand } from './audioTypes';
import { formatTime } from './audioUtils';
import { useAudioBufferCache } from './useAudioBufferCache';
import { useAudioEqualizer } from './useAudioEqualizer';

/** =========================
 * 可调参数（集中管理）
 * ========================= */
const CFG = {
  // 音量淡入淡出
  FADE_STEPS: 50,
  FADE_MS_PER_DELTA: 1000,      // 1.0 的音量差按 1000ms 计算
  SAFE_END_GAP_S: 0.5,          // 结尾处至少保留的静音缓冲，避免突兀截断

  // 播放切歌保护/占位
  PLAY_GUARD_MS: 1000,          // 切歌时 UI 的“正在尝试播放”保护时间
  PAUSE_DELAY_MS: 300,          // 自动播放失败时的 UI 回退延迟

  // 媒体会话（系统媒体键）
  MEDIASESSION_ENABLED: true,
  MEDIASESSION_DEFAULT_SEEK_OFFSET: 10, // seekback/seekforward 的默认秒数
  MEDIASESSION_ARTWORK_SIZE: '512x512'
};

export const useAudioPlayer = (initialList: TrackItem[] = []) => {
  const playlist = ref<TrackItem[]>(initialList);
  const currentTrackIndex = ref(0);

  // 播放状态
  const _isPlaying = ref(false);
  const playGuardActive = ref(false);
  let playGuardTimer: ReturnType<typeof setTimeout> | null = null;

  // 媒体
  const isAudioLoaded = ref(false);
  const duration = ref(0);
  const currentTime = ref(0);
  const progress = ref(0);
  const volume = ref(50);
  const fadeVolume = ref(1);
  const isSeeking = ref(false);

  // EQ 开关 & 最近一次配置
  const eqEnabled = ref(true);
  const latestEQSettings = ref<EqualizerBand[] | null>(null);

  // DOM/计时器
  let audioElement: HTMLAudioElement | null = null;
  let fadeInterval: ReturnType<typeof setInterval> | null = null;
  let pauseDelayTimer: ReturnType<typeof setTimeout> | null = null;

  // 缓存管理
  const {
    bufferProgress,
    isBufferComplete,
    restoreCacheState,
    saveCacheState,
    updateBufferProgress,
    startBufferCheck,
    stopBufferCheck,
  } = useAudioBufferCache();

  // EQ 管理
  const {
    isEqualizerInitialized,
    initEqualizer,
    connectAudioToEqualizer,   // → EQ 链
    connectBypass,             // → 直连
    applyEqualizerSettings,
    destroyEqualizer,
    ensureAudioContextRunning, // → resume() 支持
  } = useAudioEqualizer();

  // 计算/展示
  const currentTrack = computed(() => playlist.value.length ? playlist.value[currentTrackIndex.value] : null);
  const isPlaying = computed(() => _isPlaying.value || playGuardActive.value);
  const isProgressBarEnabled = computed(() => isAudioLoaded.value && duration.value > 0);
  const currentTimeDisplay = computed(() => formatTime(currentTime.value, !isProgressBarEnabled.value));
  const durationDisplay = computed(() => formatTime(duration.value, !isProgressBarEnabled.value));

  /** =========================
   * 媒体会话（系统媒体键）
   * ========================= */
  const updateMediaSessionMetadata = () => {
    if (!CFG.MEDIASESSION_ENABLED || !('mediaSession' in navigator) || !currentTrack.value) return;
    const t = currentTrack.value;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title,
      artist: t.author,
      album: '',
      artwork: t.image ? [{ src: t.image, sizes: CFG.MEDIASESSION_ARTWORK_SIZE, type: 'image/png' }] : []
    });
  };

  const updateMediaSessionPlayback = () => {
    if (!CFG.MEDIASESSION_ENABLED || !('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying.value ? 'playing' : 'paused';
  };

  const updateMediaSessionPosition = () => {
    if (!CFG.MEDIASESSION_ENABLED || !('mediaSession' in navigator)) return;
    if (typeof navigator.mediaSession.setPositionState !== 'function') return;
    navigator.mediaSession.setPositionState({
      duration: Number.isFinite(duration.value) ? duration.value : 0,
      playbackRate: 1,
      position: Number.isFinite(currentTime.value) ? currentTime.value : 0
    });
  };

  const bindMediaSessionActions = () => {
    if (!CFG.MEDIASESSION_ENABLED || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;

    ms.setActionHandler?.('play', async () => { if (!isPlaying.value) await togglePlay(); });
    ms.setActionHandler?.('pause', async () => { if (isPlaying.value) await togglePlay(); });

    // 关键：上一/下一首
    ms.setActionHandler?.('previoustrack', async () => { await playPrevious(); });
    ms.setActionHandler?.('nexttrack', async () => { await playNext(); });

    ms.setActionHandler?.('seekbackward', (details) => {
      const sec = details?.seekOffset ?? CFG.MEDIASESSION_DEFAULT_SEEK_OFFSET;
      if (audioElement) audioElement.currentTime = Math.max(0, audioElement.currentTime - sec);
      updateMediaSessionPosition();
    });
    ms.setActionHandler?.('seekforward', (details) => {
      const sec = details?.seekOffset ?? CFG.MEDIASESSION_DEFAULT_SEEK_OFFSET;
      if (audioElement) audioElement.currentTime = Math.min(duration.value || 0, audioElement.currentTime + sec);
      updateMediaSessionPosition();
    });
    ms.setActionHandler?.('seekto', (details) => {
      if (!audioElement || details?.seekTime == null) return;
      audioElement.currentTime = details.seekTime;
      updateMediaSessionPosition();
    });
  };

  /** =========================
   * 播放器基础
   * ========================= */
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
      const normal = Math.abs(delta) * CFG.FADE_MS_PER_DELTA;
      const total = maxDuration !== undefined ? Math.min(normal, maxDuration) : normal;
      const steps = CFG.FADE_STEPS;
      const stepDur = total / steps;
      const step = delta / steps;
      let i = 0;
      fadeInterval = setInterval(() => {
        if (!audioElement || i >= steps) {
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

  const initAudio = () => {
    const track = currentTrack.value;
    if (!track) return;

    const fileUrl = track.file;
    const hasCached = restoreCacheState(fileUrl, duration, isAudioLoaded);

    if (audioElement && audioElement.src && audioElement.src.includes(fileUrl)) return;

    if (audioElement) {
      if (audioElement.src) {
        saveCacheState(audioElement, audioElement.src, isAudioLoaded.value, duration.value);
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

    // EQ 路由
    if (isEqualizerInitialized.value) {
      if (eqEnabled.value) connectAudioToEqualizer(audioElement);
      else connectBypass(audioElement);
    }

    // 事件
    audioElement.addEventListener('timeupdate', () => {
      if (!audioElement || isSeeking.value) return;
      currentTime.value = audioElement.currentTime;
      if (duration.value > 0) {
        progress.value = (audioElement.currentTime / duration.value) * 100;
      }
      updateMediaSessionPosition();
    });

    const refresh = () => updateBufferProgress(audioElement);
    audioElement.addEventListener('progress', refresh);
    audioElement.addEventListener('loadeddata', refresh);
    audioElement.addEventListener('canplay', refresh);
    audioElement.addEventListener('canplaythrough', refresh);

    audioElement.addEventListener('loadedmetadata', () => {
      if (!audioElement) return;
      if (duration.value === 0 || !hasCached) duration.value = audioElement.duration;
      isAudioLoaded.value = true;
      setTimeout(refresh, 100);
      updateMediaSessionPosition();
      updateMediaSessionMetadata();
    });

    audioElement.addEventListener('play', async () => {
      if (!_isPlaying.value) {
        if (!audioElement || !currentTrack.value) return;
        try {
          if (!isAudioLoaded.value) await loadAudio();
          if (audioElement.paused) await audioElement.play();
          _isPlaying.value = true;
          if (playGuardActive.value) {
            playGuardActive.value = false;
            if (playGuardTimer) { clearTimeout(playGuardTimer); playGuardTimer = null; }
          }
          await fadeTo(1);
        } catch (e) {
          console.error('[Player] play error', e);
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
      updateMediaSessionPlayback();
    });

    audioElement.addEventListener('pause', async () => {
      if (_isPlaying.value) {
        _isPlaying.value = false;
        await fadeTo(0, 0);
        if (!_isPlaying.value && audioElement) audioElement.pause();
      }
      const url = currentTrack.value?.file;
      if (audioElement && url) saveCacheState(audioElement, url, isAudioLoaded.value, duration.value);
      setPreloadStrategy('metadata');
      stopBufferCheck();
      updateMediaSessionPlayback();
    });

    audioElement.addEventListener('ended', () => {
      _isPlaying.value = false;
      if (audioElement) audioElement.volume = 0;
      const url = currentTrack.value?.file;
      if (audioElement && url) saveCacheState(audioElement, url, isAudioLoaded.value, duration.value);
      stopBufferCheck();
      updateMediaSessionPlayback();
      playNext(); // 自动下一首
    });

    audioElement.addEventListener('error', () => {
      _isPlaying.value = false;
      isAudioLoaded.value = false;
      stopBufferCheck();
      updateMediaSessionPlayback();
    });
  };

  const loadAudio = async () => {
    // 初始化 EQ，并根据开关接好路由
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

    // EQ 就绪后立即应用最近一次配置
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
      _isPlaying.value = false;
      const remaining = duration.value - currentTime.value;
      const normalFade = fadeVolume.value * CFG.FADE_MS_PER_DELTA;
      const safeFade = remaining > CFG.SAFE_END_GAP_S ? Math.min(normalFade, (remaining - CFG.SAFE_END_GAP_S) * 1000) : 0;
      await fadeTo(0, safeFade);
      if (!_isPlaying.value && audioElement) audioElement.pause();
      updateMediaSessionPlayback();
    } else {
      try {
        await ensureAudioContextRunning(); // 重要：移动端/首次交互
        if (!isAudioLoaded.value) await loadAudio();
        if (audioElement.paused) await audioElement.play();
        _isPlaying.value = true;
        if (playGuardActive.value) {
          playGuardActive.value = false;
          if (playGuardTimer) { clearTimeout(playGuardTimer); playGuardTimer = null; }
        }
        await fadeTo(1);
        updateMediaSessionPlayback();
      } catch (e) {
        console.error('[Player] Play failed', e);
        _isPlaying.value = false;
      }
    }
  };

  const loadAndPlay = async (autoPlay = true) => {
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

    // UI 保护期
    playGuardActive.value = true;
    if (playGuardTimer) { clearTimeout(playGuardTimer); }
    playGuardTimer = setTimeout(() => {
      playGuardActive.value = false;
      playGuardTimer = null;
    }, CFG.PLAY_GUARD_MS);

    let loadingFailed = false;
    pauseDelayTimer = setTimeout(() => {
      if (!_isPlaying.value && !loadingFailed) {
        _isPlaying.value = false;
      }
      pauseDelayTimer = null;
    }, CFG.PAUSE_DELAY_MS);

    try {
      await ensureAudioContextRunning();
      await loadAudio();
      if (audioElement) {
        await audioElement.play();
        if (pauseDelayTimer) { clearTimeout(pauseDelayTimer); pauseDelayTimer = null; }
        _isPlaying.value = true;
        if (playGuardActive.value) {
          playGuardActive.value = false;
          if (playGuardTimer) { clearTimeout(playGuardTimer); playGuardTimer = null; }
        }
        fadeTo(1);
        updateMediaSessionPlayback();
      }
    } catch (e) {
      loadingFailed = true;
      if (pauseDelayTimer) { clearTimeout(pauseDelayTimer); pauseDelayTimer = null; }
      console.error('[Player] auto play failed', e);
      _isPlaying.value = false;
      updateMediaSessionPlayback();
    }
  };

  const playNext = async () => {
    if (!playlist.value.length) return;
    if (audioElement && audioElement.src) {
      const url = currentTrack.value?.file;
      if (url) saveCacheState(audioElement, url, isAudioLoaded.value, duration.value);
    }
    currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.value.length;
    updateMediaSessionMetadata();
    await loadAndPlay(true);
  };

  const playPrevious = async () => {
    if (!playlist.value.length) return;
    if (audioElement && audioElement.src) {
      const url = currentTrack.value?.file;
      if (url) saveCacheState(audioElement, url, isAudioLoaded.value, duration.value);
    }
    currentTrackIndex.value =
      currentTrackIndex.value === 0 ? playlist.value.length - 1 : currentTrackIndex.value - 1;
    updateMediaSessionMetadata();
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
      try { await loadAudio(); } catch (e) {
        console.error('[Player] load for seek failed', e);
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

  /** 生命周期 */
  onMounted(() => {
    try {
      const saved = localStorage.getItem('musicPlayerVolume');
      if (saved !== null) {
        const v = parseFloat(saved);
        if (!isNaN(v) && v >= 0 && v <= 100) volume.value = v;
      }
    } catch { }

    if (playlist.value.length > 0) initAudio();

    // MediaSession
    bindMediaSessionActions();
    updateMediaSessionMetadata();
    updateMediaSessionPlayback();
    updateMediaSessionPosition();
  });

  onUnmounted(async () => {
    if (audioElement && audioElement.src) {
      const url = currentTrack.value?.file;
      if (url) saveCacheState(audioElement, url, isAudioLoaded.value, duration.value);
    }
    if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null; }
    if (pauseDelayTimer) { clearTimeout(pauseDelayTimer); pauseDelayTimer = null; }
    if (playGuardTimer) { clearTimeout(playGuardTimer); playGuardTimer = null; }
    stopBufferCheck();
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      audioElement = null;
    }
    await destroyEqualizer();

    // 可选：解绑 MediaSession（不是必须）
    try {
      if ('mediaSession' in navigator) {
        const ms = navigator.mediaSession;
        ['play','pause','previoustrack','nexttrack','seekbackward','seekforward','seekto']
          .forEach(a => ms.setActionHandler?.(a as any, null));
      }
    } catch {}
  });

  watch(playlist, (newList) => {
    if (newList.length > 0 && currentTrackIndex.value >= newList.length) currentTrackIndex.value = 0;
  });

  watch(currentTrackIndex, () => {
    updateMediaSessionMetadata();
  });

  return {
    // state
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

    // ops
    setPlaylist,
    togglePlay,
    playNext,
    playPrevious,
    onProgressInput,
    setProgressValue,
    onVolumeChange,
    loadAndPlay,
    applyEQ,
    setEQEnabled
  };
};
