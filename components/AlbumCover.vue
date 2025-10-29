<template>
    <div class="album-cover-container">
        <Transition :name="direction === 'prev' ? 'flip-prev' : 'flip-next'" mode="out-in" @before-leave="onBeforeLeave"
            @after-enter="onAfterEnter">
            <div :key="cachedImageUrl" class="album-cover"
                :style="{ backgroundImage: cachedImageUrl ? `url('${cachedImageUrl}')` : 'none' }">
                <div v-if="!cachedImageUrl" class="placeholder"></div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
interface Props {
    imageUrl?: string;
    direction?: 'next' | 'prev';
}

const props = withDefaults(defineProps<Props>(), {
    direction: 'next',
});

const isFlipping = ref(false);

const cachedImageUrl = ref<string>('');
const imageCache = new Set<string>();

const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve) => {
        if (!url) {
            resolve();
            return;
        }

        if (imageCache.has(url)) {
            resolve();
            return;
        }

        const img = new Image();
        img.onload = () => {
            imageCache.add(url);
            resolve();
        };

        img.onerror = () => {
            resolve();
        };

        img.src = url;
    });
};

watch(() => props.imageUrl, async (newUrl) => {
    if (!newUrl) {
        cachedImageUrl.value = '';
        return;
    }
    await preloadImage(newUrl);
    cachedImageUrl.value = newUrl;
}, { immediate: true });

const onBeforeLeave = () => (isFlipping.value = true);
const onAfterEnter = () => (isFlipping.value = false);
</script>

<style lang="scss">
.album-cover-container {
    position: relative;
    width: 100%;
    height: 100%;
    perspective: calc(var(--square-size) * 1.25);
}

.album-cover {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    backface-visibility: hidden;
    background-color: rgba(0, 0, 0, 0.2);
    transform-style: preserve-3d;
    border-radius: calc(var(--square-size) * 0.18);
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
}

.placeholder {
    width: 100%;
    height: 100%;
}

.content.infocus .widget[data-float-item] .music-widget .picture .album-cover-container {
    perspective: 32em;

    .album-cover {
        border-radius: 1.75em;
    }
}

html.dark-mode .music-widget .picture .album-cover {
    background-color: #78c6ff80;
}

$duration: .3s;
$durationl: .5s;
$delay: .1s;
$ease-out-back: cubic-bezier(0.34, 1.36, 0.64, 1);
$ease-outs: cubic-bezier(0.4, 0, 0.2, 1);

.flip-prev-leave-active {
    transition:
        transform $duration $delay $ease-outs,
        filter $duration $delay ease,
        opacity $duration $delay ease;
    transform-origin: center center;
}

.flip-prev-leave-to {
    transform: rotateY(-90deg) scale(0.85);
    opacity: 0;
    filter: blur(5px);
}

.flip-prev-enter-active {
    transition:
        transform $durationl $ease-out-back,
        opacity $durationl ease,
        filter $durationl ease;
    transform-origin: center center;
}

.flip-prev-enter-from {
    transform: rotateY(90deg) scale(0.85);
    opacity: 0.35;
    filter: blur(5px);
}

.flip-prev-enter-to {
    transform: rotateY(0deg) scale(1);
    opacity: 1;
    filter: blur(0);
}

.flip-next-leave-active {
    transition:
        transform $duration $delay $ease-outs,
        filter $duration $delay ease,
        opacity $duration $delay ease;
    transform-origin: center center;
}

.flip-next-leave-to {
    transform: rotateY(90deg) scale(0.85);
    opacity: 0;
    filter: blur(5px);
}

.flip-next-enter-active {
    transition:
        transform $durationl $ease-out-back,
        opacity $durationl ease,
        filter $durationl ease;
    transform-origin: center center;
}

.flip-next-enter-from {
    transform: rotateY(-90deg) scale(0.85);
    opacity: 0.35;
    filter: blur(5px);
}

.flip-next-enter-to {
    transform: rotateY(0deg) scale(1);
    opacity: 1;
    filter: blur(0);
}
</style>
