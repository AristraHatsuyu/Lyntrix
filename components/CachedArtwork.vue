<template>
    <div v-bind="$attrs" :style="displayUrl ? { backgroundImage: `url('${displayUrl}')` } : undefined"
        class="cached-artwork">
        <slot v-if="!displayUrl" name="placeholder">
            <div class="artwork-placeholder"></div>
        </slot>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useArtworkCache } from '@/composables/audio/useArtworkCache'

interface Props {
    src?: string
    eager?: boolean
    retainWhileMounted?: boolean
    threshold?: number | number[]
    rootMargin?: string
}
const props = withDefaults(defineProps<Props>(), {
    eager: false,
    retainWhileMounted: true,
    threshold: 0.1,
    rootMargin: '200px',
})

const { ensure, retain, release } = useArtworkCache()
const displayUrl = ref<string>('')

let io: IntersectionObserver | null = null
let observedEl: HTMLElement | null = null
let retainedSrc: string | undefined
let visible = false

async function doLoad(src?: string) {
    if (!src) {
        displayUrl.value = ''
        return
    }
    const { displayUrl: d } = await ensure(src)
    displayUrl.value = d
    if (props.retainWhileMounted) {
        if (retainedSrc && retainedSrc !== src) release(retainedSrc)
        retainedSrc = src
        retain(src)
    }
}

function observe(el: HTMLElement | null, src?: string) {
    if (!el) return
    observedEl = el
    if (io) io.disconnect()
    if (props.eager) {
        visible = true
        void doLoad(src)
        return
    }
    io = new IntersectionObserver(
        (entries) => {
            const e = entries[0]
            if (!e) return
            if (e.isIntersecting && !visible) {
                visible = true
                void doLoad(src)
                io && io.disconnect()
            }
        },
        { threshold: Array.isArray(props.threshold) ? props.threshold : [props.threshold], rootMargin: props.rootMargin }
    )
    io.observe(el)
}

watch(
    () => props.src,
    (nu) => {
        displayUrl.value = ''
        visible = !!props.eager
        if (visible) void doLoad(nu)
    }
)

onMounted(() => {
    const el = (document.currentScript as any)?.ownerDocument ? null : null
    const root = (getCurrentInstance()?.vnode?.el as HTMLElement) || null
    observe(root, props.src)
    if (props.eager) void doLoad(props.src)
})

onBeforeUnmount(() => {
    if (io) io.disconnect()
    if (retainedSrc) release(retainedSrc)
})
</script>

<style scoped>
.cached-artwork {
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
}

.artwork-placeholder {
    width: 100%;
    height: 100%;
    opacity: .12;
}
</style>
