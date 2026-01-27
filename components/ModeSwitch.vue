<template>
    <div class="switch" @click="changeTheme" data-pointer>
        <Transition name="fadeo">
            <svg v-if="thememode == 'light'" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                width="38" height="38">
                <path
                    d="M520.8576 896.1024A393.5232 393.5232 0 0 1 392.192 130.816a49.664 49.664 0 0 1 53.9648 14.5408 51.1488 51.1488 0 0 1 6.7584 57.088 268.3904 268.3904 0 0 0-30.3104 124.7744 271.5136 271.5136 0 0 0 398.592 240.384 50.944 50.944 0 0 1 57.1392 6.0416 49.5616 49.5616 0 0 1 15.2064 53.76 392.6016 392.6016 0 0 1-372.736 268.6976zM358.2464 231.936a315.7504 315.7504 0 1 0 434.688 430.592 349.4912 349.4912 0 0 1-434.688-430.592z">
                </path>
            </svg>
            <svg v-else viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
                <path
                    d="M915.2 476.16h-43.968c-24.704 0-44.736 16-44.736 35.84s20.032 35.904 44.736 35.904H915.2c24.768 0 44.8-16.064 44.8-35.904s-20.032-35.84-44.8-35.84zM512 265.6c-136.704 0-246.464 109.824-246.464 246.4 0 136.704 109.76 246.464 246.464 246.464S758.4 648.704 758.4 512c0-136.576-109.696-246.4-246.4-246.4z m0 425.6c-99.008 0-179.2-80.128-179.2-179.2 0-98.944 80.192-179.2 179.2-179.2S691.2 413.056 691.2 512c0 99.072-80.192 179.2-179.2 179.2zM197.44 512c0-19.84-19.136-35.84-43.904-35.84H108.8c-24.768 0-44.8 16-44.8 35.84s20.032 35.904 44.8 35.904h44.736c24.768 0 43.904-16.064 43.904-35.904zM512 198.464c19.776 0 35.84-20.032 35.84-44.8v-44.8C547.84 84.032 531.84 64 512 64s-35.904 20.032-35.904 44.8v44.8c0 24.768 16.128 44.864 35.904 44.864z m0 627.136c-19.776 0-35.904 20.032-35.904 44.8v44.736C476.096 940.032 492.16 960 512 960s35.84-20.032 35.84-44.8v-44.736c0-24.768-16.064-44.864-35.84-44.864z m329.92-592.832c17.472-17.536 20.288-43.072 6.4-57.024-14.016-14.016-39.488-11.2-57.024 6.336-4.736 4.864-26.496 26.496-31.36 31.36-17.472 17.472-20.288 43.008-6.336 57.024 13.952 14.016 39.488 11.2 57.024-6.336 4.8-4.864 26.496-26.56 31.296-31.36zM213.376 759.936c-4.864 4.8-26.56 26.624-31.36 31.36-17.472 17.472-20.288 42.944-6.4 56.96 14.016 13.952 39.552 11.2 57.024-6.336 4.8-4.736 26.56-26.496 31.36-31.36 17.472-17.472 20.288-43.008 6.336-56.96-14.016-13.952-39.552-11.072-56.96 6.336z m19.328-577.92c-17.536-17.536-43.008-20.352-57.024-6.336-14.08 14.016-11.136 39.488 6.336 57.024 4.864 4.864 26.496 26.56 31.36 31.424 17.536 17.408 43.008 20.288 56.96 6.336 14.016-14.016 11.264-39.488-6.336-57.024-4.736-4.864-26.496-26.56-31.296-31.424z m527.168 628.608c4.864 4.864 26.624 26.624 31.36 31.424 17.536 17.408 43.072 20.224 57.088 6.336 13.952-14.016 11.072-39.552-6.4-57.024-4.864-4.8-26.56-26.496-31.36-31.36-17.472-17.408-43.072-20.288-57.024-6.336-13.952 14.016-11.008 39.488 6.336 56.96z">
                </path>
            </svg>
        </Transition>
    </div>
</template>

<script setup lang="ts">
const thememode = ref('light');

const changeTheme = (event: MouseEvent) => {
    const mode = thememode.value == 'light' ? 'dark' : 'light';

    let transition = document.startViewTransition(() => {
        thememode.value = mode;
        if (mode === 'dark') {
            document.documentElement.classList.add("dark-mode");
        } else {
            document.documentElement.classList.remove("dark-mode");
        }
    });

    transition.ready.then(() => {
        const x = event.clientX;
        const y = event.clientY;

        const radius = Math.sqrt(
            Math.max(x, window.innerWidth - x) ** 2 +
            Math.max(y, window.innerHeight - y) ** 2
        );

        document.documentElement.animate({
            clipPath: [
                `circle(0 at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
            ],
        },
            {
                duration: 500,
                pseudoElement: "::view-transition-new(root)",
            });
    });
};
</script>

<style>
.switch {
    position: fixed;
    right: 20px;
    top: 20px;
    display: block;
    width: min(10vw, 38px);
    height: min(10vw, 38px);
    fill: color-mix(in srgb, var(--lyntrix-color, #fff), #fff 30%);
    transition: opacity .3s ease, fill .5s;
    opacity: .5;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    transform-origin: right top;
    transform: scale(clamp(0.75, calc(1.025 - calc(var(--scroll-y-percent) * 0.5)), 1));
    z-index: 10;
}

html.dark-mode .switch {
    fill: #64beffd5;
}

html.music-fullscr .switch {
    opacity: 0;
    pointer-events: none;
}

.switch>svg {
    height: 100%;
    width: 100%;
    position: absolute;
}

::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
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