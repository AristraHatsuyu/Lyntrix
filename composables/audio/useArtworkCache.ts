// /composables/media/useArtworkCache.ts

import type { TrackItem } from '@/composables/audio/audioTypes';

type State = 'ready' | 'loading' | 'error';

type BlobEntry = {
    blob: Blob;
    objectUrl: string;
    lastAccess: number;
    refCount: number;
};

type DecodeEntry = {
    bitmap?: ImageBitmap;
    img?: HTMLImageElement;
    lastAccess: number;
};

const CONFIG = {
    CACHE_NAME: 'album-art-v1',
    CONCURRENCY: 3,
    MAX_BLOBS: 64,
    MAX_DECODED: 48,
    PREFETCH_RADIUS: 3,
    USE_IMAGE_BITMAP: true
};

const blobCache = new Map<string, BlobEntry>();
const decodedCache = new Map<string, DecodeEntry>();
const pending = new Map<string, Promise<string>>();
let currentQueue = 0;
const queue: Array<() => void> = [];
let cacheAvailable = false;
let cacheOpened: Cache | null = null;
const now = () => Date.now();
const canUseWindow = typeof window !== 'undefined' && typeof document !== 'undefined';

async function ensureCache() {
    if (!canUseWindow) return;
    if (!('caches' in window)) return;
    if (cacheOpened) return;
    try {
        cacheOpened = await caches.open(CONFIG.CACHE_NAME);
        cacheAvailable = true;
    } catch {
        cacheAvailable = false;
    }
}

function lruCull<T extends { lastAccess: number }>(map: Map<string, T>, max: number, onDelete?: (k: string, v: T) => void) {
    if (map.size <= max) return;
    const items = [...map.entries()]
        .filter(([_, v]) => (v as any).refCount === undefined || (v as any).refCount <= 0)
        .sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    const toDelete = Math.max(0, items.length - max);
    for (let i = 0; i < toDelete; i++) {
        const [k, v] = items[i];
        if (onDelete) onDelete(k, v);
        map.delete(k);
    }
}

async function fetchBlobThroughCache(url: string): Promise<Blob> {
    if (!canUseWindow) throw new Error('No window');
    await ensureCache();

    if (cacheAvailable && cacheOpened) {
        try {
            const hit = await cacheOpened.match(url, { ignoreVary: true, ignoreSearch: false });
            if (hit && hit.ok) {
                const blob = await hit.blob();
                return blob;
            }
        } catch { }
    }

    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const blob = await res.blob();

    if (cacheAvailable && cacheOpened) {
        try {
            const resp = new Response(blob, { headers: { 'Content-Type': blob.type || 'image/*' } });
            await cacheOpened.put(url, resp);
        } catch { }
    }
    return blob;
}

async function createStableObjectUrl(url: string): Promise<string> {
    const existed = blobCache.get(url);
    if (existed) {
        existed.lastAccess = now();
        return existed.objectUrl;
    }
    const p = pending.get(url);
    if (p) return p;

    const task = (async () => {
        try {
            const blob = await fetchBlobThroughCache(url);
            const objectUrl = URL.createObjectURL(blob);
            blobCache.set(url, { blob, objectUrl, lastAccess: now(), refCount: 0 });
            lruCull(blobCache, CONFIG.MAX_BLOBS, (k, v) => {
                try { URL.revokeObjectURL(v.objectUrl); } catch { }
            });
            return objectUrl;
        } finally {
            pending.delete(url);
        }
    })();
    pending.set(url, task);
    return task;
}

async function decodeWarmUp(url: string, objectUrl: string) {
    const d = decodedCache.get(url);
    if (d) {
        d.lastAccess = now();
        return;
    }
    try {
        if (CONFIG.USE_IMAGE_BITMAP && 'createImageBitmap' in window) {
            const res = await fetch(objectUrl);
            const blob = await res.blob();
            const bitmap = await createImageBitmap(blob);
            decodedCache.set(url, { bitmap, lastAccess: now() });
        } else {
            const img = new Image();
            img.decoding = 'async';
            img.src = objectUrl;
            await img.decode().catch(() => { });
            decodedCache.set(url, { img, lastAccess: now() });
        }
        lruCull(decodedCache, CONFIG.MAX_DECODED);
    } catch { }
}

function withConcurrency<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const run = async () => {
            currentQueue++;
            try {
                const res = await fn();
                resolve(res);
            } catch (e) {
                reject(e);
            } finally {
                currentQueue--;
                if (queue.length) {
                    const next = queue.shift()!;
                    next();
                }
            }
        };
        if (currentQueue < CONFIG.CONCURRENCY) run();
        else queue.push(run);
    });
}

export function useArtworkCache() {
    async function ensure(url?: string): Promise<{ displayUrl: string; state: State }> {
        if (!url) return { displayUrl: '', state: 'error' };
        if (!canUseWindow) return { displayUrl: url, state: 'ready' };

        const e = blobCache.get(url);
        if (e) {
            e.lastAccess = now();
            decodeWarmUp(url, e.objectUrl);
            return { displayUrl: e.objectUrl, state: 'ready' };
        }

        try {
            const obj = await withConcurrency(() => createStableObjectUrl(url));
            decodeWarmUp(url, obj);
            return { displayUrl: obj, state: 'ready' };
        } catch {
            return { displayUrl: url, state: 'ready' };
        }
    }

    function retain(url?: string) {
        if (!url) return;
        const e = blobCache.get(url);
        if (e) e.refCount++;
    }
    function release(url?: string) {
        if (!url) return;
        const e = blobCache.get(url);
        if (e) {
            e.refCount = Math.max(0, e.refCount - 1);
        }
    }

    async function prefetch(urls: (string | undefined)[], concurrency = CONFIG.CONCURRENCY) {
        const list = Array.from(new Set(urls.filter(Boolean) as string[]));
        if (!list.length) return;
        const prev = CONFIG.CONCURRENCY;
        CONFIG.CONCURRENCY = concurrency;

        try {
            await Promise.all(list.map(u => withConcurrency(async () => {
                const { displayUrl } = await ensure(u);
                void displayUrl;
            })));
        } finally {
            CONFIG.CONCURRENCY = prev;
        }
    }

    function primeFromPlaylist(tracks: TrackItem[]) {
        const urls = tracks.map(t => t.image).filter(Boolean) as string[];
        prefetch(urls, 3);
    }

    function prefetchAround(tracks: TrackItem[], centerIndex: number, radius = CONFIG.PREFETCH_RADIUS) {
        if (!tracks.length) return;
        const urls: string[] = [];
        const len = tracks.length;
        for (let d = -radius; d <= radius; d++) {
            const i = (centerIndex + d + len) % len;
            if (tracks[i]?.image) urls.push(tracks[i].image!);
        }
        prefetch(urls, 3);
    }

    function setLimits(limits: Partial<typeof CONFIG>) {
        Object.assign(CONFIG, limits);
    }

    return {
        ensure,
        retain,
        release,
        prefetch,
        primeFromPlaylist,
        prefetchAround,
        setLimits,
    };
}
