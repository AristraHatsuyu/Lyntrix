<template>
    <Transition name="fadeo">
        <div class="next-icon" v-if="scrollYPercent < 0.02">
            <div class="next-icon-inner" @click="scrollToVh(0.225)">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em"
                    width="1em" xmlns="http://www.w3.org/2000/svg" data-pointer>
                    <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="48"
                        d="M112 184l144 144 144-144"></path>
                </svg>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { useScrollYPercent } from '@/composables/scroll'
const { scrollYPercent } = useScrollYPercent()
function scrollToVh(vh: number, duration = 600) {
    const target = window.innerHeight * vh
    const start = window.scrollY
    const distance = target - start
    const startTime = performance.now()

    function easeOutQuart(t: number): number {
        return 1 - Math.pow(1 - t, 6)
    }

    function step(currentTime: number) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutQuart(progress)
        const scrollTo = start + distance * eased
        window.scrollTo(0, scrollTo)

        if (progress < 1) {
            requestAnimationFrame(step)
        }
    }

    requestAnimationFrame(step)
}
</script>

<style>
.next-icon {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
}

.next-icon .next-icon-inner {
    font-size: min(60px, 12vw);
    width: 1em;
    height: 1.5em;
    padding-left: .25em;
    padding-right: .25em;
    cursor: pointer;
    color: color-mix(in srgb, var(--lyntrix-color, #fff), #fff 30%);
    opacity: .55;
    transition: color .5s;
}

html.dark-mode .next-icon .next-icon-inner {
    color: #64beffd5;
}

.fadeo-enter-active,
.fadeo-leave-active {
    transition: opacity 0.3s linear;
}

.fadeo-enter-from,
.fadeo-leave-to {
    opacity: 0;
}
</style>