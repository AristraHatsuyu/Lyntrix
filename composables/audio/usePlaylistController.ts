import { computed, ref } from 'vue';
import type { TrackItem } from './audioTypes';

export type PlayMode = 'repeat-all' | 'repeat-one' | 'shuffle';

export const usePlaylistController = (player: any) => {
    const mode = ref<PlayMode>('repeat-all');

    const queue = computed<TrackItem[]>(() => player.playlist.value ?? []);
    const currentIndex = computed<number>(() => player.currentTrackIndex.value ?? 0);

    const setMode = (m: PlayMode) => { mode.value = m; };
    const cycleMode = () => {
        mode.value = mode.value === 'repeat-all' ? 'repeat-one'
            : mode.value === 'repeat-one' ? 'shuffle'
                : 'repeat-all';
    };

    const playAt = async (index: number) => {
        const len = queue.value.length;
        if (len === 0) return;
        const clamped = Math.max(0, Math.min(index, len - 1));
        player.currentTrackIndex.value = clamped;
        await player.loadAndPlay(true);
    };

    // —— 顺序索引（列表循环用）——
    const seqNext = (i: number, len: number) => (i + 1) % len;
    const seqPrev = (i: number, len: number) => (i - 1 + len) % len;

    // —— 随机索引（不与当前相同）——
    const randOther = (i: number, len: number) => {
        if (len <= 1) return i;
        let r = i;
        while (r === i) r = Math.floor(Math.random() * len);
        return r;
    };

    // ===== 自动结束时用的“下一首”规则 =====
    // repeat-one -> 重播自身；shuffle -> 随机；repeat-all -> 顺序下一首
    const endedNextIndex = (): number => {
        const len = queue.value.length;
        const i = currentIndex.value;
        if (!len) return 0;
        if (mode.value === 'repeat-one') return i;
        if (mode.value === 'shuffle') return randOther(i, len);
        return seqNext(i, len);
    };

    // ===== 用户触发（按钮/媒体键）用的上一/下一首 =====
    const nextIndexManual = (): number => {
        const len = queue.value.length;
        const i = currentIndex.value;
        if (!len) return 0;
        if (mode.value === 'shuffle') return randOther(i, len);
        return seqNext(i, len);
    };

    const prevIndexManual = (): number => {
        const len = queue.value.length;
        const i = currentIndex.value;
        if (!len) return 0;
        if (mode.value === 'shuffle') return randOther(i, len);
        return seqPrev(i, len);
    };

    const next = async () => { await playAt(nextIndexManual()); };
    const prev = async () => { await playAt(prevIndexManual()); };
    const onEnded = async () => { await playAt(endedNextIndex()); };
    const removeAt = (index: number) => {
        const list = [...queue.value];
        if (index < 0 || index >= list.length) return;
        const playingFile = player.currentTrack.value?.file;
        const removed = list.splice(index, 1);

        if (index < player.currentTrackIndex.value) {
            player.currentTrackIndex.value = Math.max(0, player.currentTrackIndex.value - 1);
        }
        player.setPlaylist(list);

        if (removed[0]?.file === playingFile && list.length) {
            const nextIdx = Math.min(index, list.length - 1);
            player.currentTrackIndex.value = nextIdx;
            player.loadAndPlay(true);
        }
    };

    const clearQueue = () => {
        player.setPlaylist([]);
        if (player.isPlaying.value) player.togglePlay();
    };

    const moveItem = (from: number, to: number) => {
        const list = [...queue.value];
        if (from === to) return;
        if (from < 0 || to < 0 || from >= list.length || to >= list.length) return;
        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        const playingFile = player.currentTrack.value?.file;
        player.setPlaylist(list);
        const newIndex = list.findIndex(t => t.file === playingFile);
        if (newIndex !== -1) player.currentTrackIndex.value = newIndex;
    };

    return {
        queue, currentIndex, mode,
        
        setMode, cycleMode,
        playAt, next, prev, onEnded,
        removeAt, clearQueue, moveItem,
    };
};
