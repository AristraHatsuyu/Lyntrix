<!-- AlbumCover.vue -->
<template>
  <div class="album-cover-container">
    <Transition
      :name="direction === 'prev' ? 'flip-prev' : 'flip-next'"
      mode="out-in"
      @before-leave="onBeforeLeave"
      @after-enter="onAfterEnter"
    >
      <div
        :key="cachedImageUrl"
        class="album-cover"
        :style="{ backgroundImage: cachedImageUrl ? `url('${cachedImageUrl}')` : 'none' }"
      >
        <div v-if="!cachedImageUrl" class="placeholder"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useArtworkCache } from '@/composables/audio/useArtworkCache';

interface Props {
  imageUrl?: string;
  direction?: 'next' | 'prev';
}
const props = withDefaults(defineProps<Props>(), { direction: 'next' });

const { ensure, retain, release } = useArtworkCache();

const isFlipping = ref(false);
const cachedImageUrl = ref<string>('');

let retainedUrl: string | undefined;

const swapImage = async (url?: string) => {
  // 释放上一张
  if (retainedUrl) release(retainedUrl);

  if (!url) {
    cachedImageUrl.value = '';
    retainedUrl = undefined;
    return;
  }
  // 从缓存获得稳定 URL，并保留引用
  const { displayUrl } = await ensure(url);
  cachedImageUrl.value = displayUrl;
  retainedUrl = url;
  retain(url);
};

watch(() => props.imageUrl, (nu) => { void swapImage(nu); }, { immediate: true });

const onBeforeLeave = () => (isFlipping.value = true);
const onAfterEnter = () => (isFlipping.value = false);

onMounted(() => {
  if (props.imageUrl) retain(props.imageUrl);
});
onBeforeUnmount(() => {
  if (retainedUrl) release(retainedUrl);
});
</script>

<style lang="scss">
.album-cover-container {
    position: relative;
    width: 100%;
    height: 100%;
    transition: perspective .6s, transform .5s;
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
    transition: border-radius .6s;
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

html.music-fullscr .content .matrix .widget {
    &[data-float-item=music] {
        .music-widget .picture {
            .album-cover-container {
                perspective: 150rem;
                transform: scale(.85);
            }

            &.isPlaying{
                .album-cover-container {
                    transform: none;
                }
            }
        }
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
    filter: blur(1rem);
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
    filter: blur(1rem);
}

.flip-prev-enter-to {
    transform: rotateY(0deg) scale(1);
    opacity: 1;
    filter: none;
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
    filter: blur(1rem);
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
    filter: blur(1rem);
}

.flip-next-enter-to {
    transform: rotateY(0deg) scale(1);
    opacity: 1;
    filter: none;
}
</style>
