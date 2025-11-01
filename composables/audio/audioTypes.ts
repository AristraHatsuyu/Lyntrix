export interface TrackItem {
    title: string;
    author: string;
    file: string;
    image?: string;
    lyrics?: string;
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
    value: number;
}
