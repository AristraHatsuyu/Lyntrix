<template>
    <div class="footer">
        <div class="footer-inner">
            <div class="footer-text-mobile" @click="showabout = true" data-pointer>
                Lyntrix&nbsp;Design
            </div>
            <div class="bg-info">
                <div class="footer-text-web" @click="showabout = true" data-pointer>Lyntrix&nbsp;Design</div>
                <div class="footer-bgname">
                    <div class="footer-text-web">&nbsp;&nbsp;・&nbsp;&nbsp;</div>
                    Background
                    <a :href="props.url" target="_blank" rel="noreferrer" class="bg-name"
                        :class="{ 'bg-link': props.url }" data-pointer>
                        <TextFlip :words="props.title.replace(/ /g, '&nbsp;')" />
                    </a>
                </div>
            </div>
        </div>
        <Transition name="fadeb">
            <div v-if="showabout" class="about" @click="closeAbout">
                <BlurReveal :delay="0.2" :duration="0.75">
                    <Transition name="fadec">
                        <div v-if="showcontent">
                            <img @click.stop src="@/public/images/lyntrix.png" class="image" />
                            <a @click.stop class="link-button" draggable="false"
                                href="https://github.com/AristraHatsuyu/Lyntrix" target="_blank" data-pointer><svg
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                                    <path
                                        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
                                </svg>View In Github</a>
                        </div>
                    </Transition>
                </BlurReveal>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
interface Props {
    title?: string;
    url?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: "Lyntrix",
    url: "",
});

const showabout = ref(false)
const showcontent = ref(true)

function updateWidth() {
    var Size = 0;
    if (window.innerWidth <= 1300) {
        if (window.innerWidth > 1054) {
            Size = 83.75
        } else if (window.innerWidth > 880) {
            Size = ((window.innerWidth - 384) / 8)
        } else if (window.innerWidth > 528) {
            Size = 101.25
        } else {
            Size = Math.max(((window.innerWidth - 123) / 4), 50)
        }
    } else {
        Size = Math.min(((2 * window.innerWidth / 3 - 369.333) / 8), 69.166)
    }
    const styleSheet = document.styleSheets[0] // 获取第一个样式表
    const ruleIndex = Array.from(styleSheet.cssRules).findIndex(rule =>
        rule instanceof CSSStyleRule && rule.selectorText === '*'
    )
    if (ruleIndex !== -1) {
        const rule = styleSheet.cssRules[ruleIndex] as CSSStyleRule
        rule.style.setProperty('--square-size', Size.toString() + 'px')
    } else {
        styleSheet.insertRule(`* { --square-size: ${Size}px; }`, styleSheet.cssRules.length)
    }
}

function closeAbout() {
    showcontent.value = false
    setTimeout(() => {
        showabout.value = false
    }, 200);
    setTimeout(() => {
        showcontent.value = true
    }, 700);
}

onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
})
</script>

<style>
.footer {
    width: 100%;
    height: 15vh;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -35vh;
    user-select: none;
}

.footer .footer-inner {
    text-align: center;
    opacity: .65;
    color: color-mix(in srgb, var(--lyntrix-color, #fff), #fff 50%);
    transition: .5s ease;
    line-height: 2;
}

.footer .footer-inner .bg-info,
.footer .footer-inner .bg-info .footer-bgname {
    display: flex;
}

html.dark-mode .footer .footer-inner .bg-info .footer-bgname {
    display: none;
}

html.dark-mode .footer .footer-inner .bg-info {
    color: #64beff;
    filter: drop-shadow(#64beff 0px 0px 2px)
}

html.dark-mode .footer .footer-inner {
    opacity: .8;
}

.footer .footer-inner .bg-name {
    color: var(--lyntrix-color-high, #fff);
    transition: color .5s linear;
    margin-left: 12px;
}

.footer .footer-text-mobile {
    display: none;
}

@media (max-width: 512px) {
    .footer .footer-text-mobile {
        display: block;
    }

    .footer .footer-text-web {
        display: none;
    }
}

.about {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #00000022;
    backdrop-filter: blur(30px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.about .image {
    height: 60px;
    margin-bottom: 2rem;
    opacity: 0.8;
}

.about .link-button {
    display: flex;
    gap: .6rem;
    align-items: center;
    justify-content: center;
    fill: #fff;
    color: #fff;
    background-color: #ffffff1a;
    border-radius: 1rem;
    box-shadow: inset .5px .5px 1px #ffffff1a, inset -.5px -.5px 1px #0000001a, 0 3px 10px -5px #0003;
    outline: 2px solid transparent;
    outline-offset: 2px;
    padding: 1rem;
    transition-duration: .15s;
    transition-property: all;
    transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}

.about .link-button svg {
    width: 1.8rem;
    height: 1.8rem;
}

.fadeb-enter-active,
.fadeb-leave-active {
    transition: background-color 0.5s linear, backdrop-filter 0.5s ease;
}

.fadeb-enter-from,
.fadeb-leave-to {
    background-color: #00000000;
    backdrop-filter: none;
}

.fadeb-enter-to,
.fadeb-leave-from {
    background-color: #00000022;
    backdrop-filter: blur(30px);
}

.fadec-enter-active,
.fadec-leave-active {
    transition: filter 0.5s ease, opacity 0.5s ease;
}

.fadec-enter-from,
.fadec-leave-to {
    opacity: 0;
    filter: blur(20px);
}

.fadec-enter-to,
.fadec-leave-from {
    opacity: 1;
    filter: blur(0px);
}
</style>