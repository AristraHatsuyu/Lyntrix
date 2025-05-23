<template>
    <client-only>
        <NuxtPage />
        <ModeSwitch />
        <Cursor />
    </client-only>
</template>

<script setup lang="ts">
console.log(
  "%c Lyntrix %c v1.0 ",
  "background: #4A90E2; color: white; font-size: 16px; font-weight: bold; padding: 4px 10px 4px 10px; border-radius: 4px 0 0 4px;",
  "background: #50E3C2; color: black; font-size: 14px; font-weight: bold; padding: 4px 10px 4px 10px; border-radius: 0 4px 4px 0;"
);
useHead({
    title: 'Aristra | Matrix',
    meta: [
        { name: 'description', content: "aristra's matrix" },
        { name: 'keywords', content: 'aristra, home, matrix,' },
        { name: 'author', content: 'Aristra' },
        { name: 'og:title', content: "Aristra's Matrix" },
        { name: 'og:description', content: "aristra's matrix" },
        { name: 'og:url', content: 'https://aristra.top' },
        { name: 'twitter:title', content: "Aristra Matrix" },
        { name: 'twitter:description', content: "aristra's matrix" },
    ]
})
useSeoMeta({
    title: "Aristra | Matrix",
    ogTitle: "Aristra's Matrix",
    description: "aristra's matrix",
    ogDescription: "aristra's matrix",
})
</script>

<style>
@font-face {
    font-family: 'Zen Maru Gothic';
    src: url('/fonts/ZenMaruGothic.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}

html,
body {
    margin: 0;
    padding: 0;
    user-select: none;
    background-color: #1d1e1e;
    font-family: 'Zen Maru Gothic', sans-serif;
}

* {
    --scroll-shift: calc(-140vh * var(--scroll-y-percent) + 35vh);
    cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='8px' height='8px'><circle cx='4' cy='4' r='4' fill='white' opacity='.6' /></svg>") 4 4, auto;
}

a {
    text-decoration: inherit;
    -webkit-tap-highlight-color: transparent;
}

.page-enter-active,
.page-leave-active {
    transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}
</style>
