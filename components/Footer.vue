<template>
    <div class="footer">
        <div class="footer-inner">
            <div class="footer-text-mobile" @click="showabout = true">
                Lyntrix&nbsp;Design
            </div>
            <div class="bg-info">
                <div class="footer-text-web" @click="showabout = true">Lyntrix&nbsp;Design</div><div class="footer-text-web">&nbsp;&nbsp;・&nbsp;&nbsp;</div>Background
                <a :href="props.url" target="_blank" rel="noreferrer" class="bg-name" :class="{ 'bg-link': props.url }">
                    <TextGenerateEffect :words="props.name.replace(/ /g, '&nbsp;')" />
                </a>
            </div>
        </div>
        <Transition name="fadeb">
            <div v-if="showabout" class="about" @click="showabout = false">
                <img src="@/public/images/lyntrix.png" class="image" />
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
interface Props {
    name?: string;
    url?: string;
}

const props = withDefaults(defineProps<Props>(), {
    name: "Lyntrix",
    url: "",
});

const showabout = ref(false)

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
    color: color-mix(in srgb, var(--lyntrix-theme-color), #fff 50%);
    transition: .5s ease;
    line-height: 2;
}

.footer .footer-inner .bg-info {
    display: flex;
}

html.dark-mode .bg-info {
    opacity: 0;
    pointer-events: none;
}

.footer .footer-inner .bg-name {
    color: var(--lyntrix-theme-color-high);
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
    background-color: #0000000d;
    backdrop-filter: blur(30px);
}

.about .image {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 320px;
    transform: translate(-50%, -50%);
    opacity: 0.8;
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
    background-color: #00000010;
    backdrop-filter: blur(30px);
}
</style>