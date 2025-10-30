// 类型集中放这里，避免循环依赖
export interface TrackItem {
    title: string;
    author: string;
    file: string;
    image?: string;
}

export interface CacheState {
    isLoaded: boolean;
    duration: number;
    bufferProgress: number;
    isComplete: boolean;
    lastBufferedEnd: number;
}

export interface EqualizerBand {
    text: string;
    feq: number;
    /** UI 值（0~24，对应 -12dB ~ +12dB） */
    value: number;
}
