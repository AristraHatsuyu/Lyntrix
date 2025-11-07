<template>
    <div class="content" :class="{ 'infocus': infocus, 'inanim': floatingEl }" ref="htmlEl">
        <div class="matrix">
            <CardContainer v-for="(data, index) in widgetdata" :key="index" class="widget" :columns="data.columns"
                :rows="data.row" :mcolumns="data.mcolumns" :mrows="data.mrow" :infocus="infocus" @dblclick="handleDoubleClick">
                <a v-if="data.type === 1" :class="{ 'single': data.row < 2 && windowWidth > 880 }" draggable="false"
                    :href="data.link ? data.link : 'javascript:;'" :target="data.link ? '_blank' : '_self'"
                    data-pointer>
                    <div>
                        <div :style="{ 'background-color': data.color }" class="icon">
                            <font-awesome :icon="data.icon ?? ''" />
                        </div>
                        <div>
                            <div class="title">{{ data.title }}</div>
                            <div class="desc">{{ data.description }}</div>
                        </div>
                    </div>
                    <div v-if="data.image" class="imgcontent" :style="{ 'background-image': `url('${data.image}')` }"
                        style="border-radius: calc(var(--square-size) * 0.18); width: 110%;" />
                </a>
                <div v-else-if="data.type === 2" class="imgcontent" style="width: 100%; height: 100%; transition: background-size .5s;"
                    :style="{ 'background-image': `url('${data.image}')`, 'background-position': `${data.left}% ${data.top}%`, 'background-size': data.scale }" />
                <TimeCard v-else-if="data.type === 3" />
                <AnalyticsCard v-else-if="data.type === 4" :url="data.url" />
                <MusicCard :data="data.data" v-else-if="data.type === 5 && data.data" />
            </CardContainer>
        </div>
        <div class="projlist">
            <CardContainer v-for="(data, index) in projectdata" :key="index" :infocus="infocus" class="project" @click="handleProjectClick">
                <a draggable="false" data-pointer>
                    <div class="title" href="" target="_blank">{{ data.title }}</div>
                    <div class="description">{{ data.description }}</div>
                    <div class="detail">
                    </div>
                </a>
            </CardContainer>
        </div>
        <div class="covers" @click="handledbgclose"
            :style="{ 'background': infocus ? '#00000055' : '#00000000', 'pointer-events': floatingEl ? 'unset' : 'none' }">
        </div>
    </div>
</template>

<script setup lang="ts">
import config from "@/assets/profile.json"
import { ref, onMounted, onUnmounted } from 'vue'

declare global {
  interface Window {
    _preventScroll?: (e: Event) => void;
    _preventKeys?: (e: KeyboardEvent) => void;
  }
}

const widgetdata = config.widget
const projectdata = config.project
const windowWidth = ref(window.innerWidth)
const forceTriggered = ref(false)
const htmlforceclass = ref(false)
const tempopacity = ref('')
const currentdisplay = ref('')

const updateWidth = () => windowWidth.value = window.innerWidth

let touchHoldTimer: ReturnType<typeof setTimeout> | null = null
let holdTarget: HTMLElement | null = null
let startX = 0, startY = 0
let allowtouchout = true
const moveThreshold = 15

onMounted(() => {
    window.addEventListener('resize', updateWidth)

    document.body.addEventListener('webkitmouseforcechanged', (e: any) => {
        const force = e.webkitForce
        const path = e.composedPath?.() || []
        const target = path.find((el: any) =>
            el?.classList?.contains?.('widget')
        ) as HTMLElement | undefined

        if (force >= 2 && target && !forceTriggered.value) {
            forceTriggered.value = true
            htmlforceclass.value = true
            document.documentElement.classList.add('forcetouch')
            handleDoubleClick({ currentTarget: target } as unknown as MouseEvent)
        } else if (force >= 2 && !forceTriggered.value && !htmlforceclass.value) {
            htmlforceclass.value = true
            document.documentElement.classList.add('forcetouch')
        } else if (force < 2 && htmlforceclass.value) {
            forceTriggered.value = false
            htmlforceclass.value = false
            document.documentElement.classList.remove('forcetouch')
        }
    })

    document.body.addEventListener('mouseup', () => {
        forceTriggered.value = false
        htmlforceclass.value = false
        document.documentElement.classList.remove('forcetouch')
    })

    document.body.addEventListener('touchstart', (e: TouchEvent) => {
        const path = e.composedPath?.() || []
        const target = path.find((el: any) =>
            el?.classList?.contains?.('widget')
        ) as HTMLElement | undefined

        if (!target) return

        holdTarget = target

        const touch = e.touches[0]
        startX = touch.clientX
        startY = touch.clientY

        touchHoldTimer = setTimeout(() => {
            if (!forceTriggered.value) {
                forceTriggered.value = true
                htmlforceclass.value = true
                allowtouchout = false
                document.documentElement.classList.add('forcetouch')
                handleDoubleClick({ currentTarget: holdTarget } as unknown as MouseEvent)
            }
        }, 800)
    })

    document.body.addEventListener('touchmove', (e: TouchEvent) => {
        if (!touchHoldTimer) return

        const touch = e.touches[0]
        const deltaX = touch.clientX - startX
        const deltaY = touch.clientY - startY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        if (distance > moveThreshold) {
            clearTimeout(touchHoldTimer)
            touchHoldTimer = setTimeout(() => {
                allowtouchout = true
            }, 500)
        }
    })

    const cancelTouchHold = () => {
        if (touchHoldTimer) {
            clearTimeout(touchHoldTimer)
            touchHoldTimer = setTimeout(() => {
                allowtouchout = true
            }, 500)
        }
        forceTriggered.value = false
        htmlforceclass.value = false
        document.documentElement.classList.remove('forcetouch')
        holdTarget = null
    }

    document.body.addEventListener('touchend', cancelTouchHold)
    document.body.addEventListener('touchcancel', cancelTouchHold)
})

onUnmounted(() => window.removeEventListener('resize', updateWidth))

const htmlEl = ref<HTMLElement | null>(null)

const disableScroll = () => {
    const preventDefault = (e: Event) => e.preventDefault()
    const preventKeys = (e: KeyboardEvent) => {
        const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End']
        if (keys.includes(e.code)) e.preventDefault()
    }

    window.addEventListener('wheel', preventDefault, { passive: false })
    window.addEventListener('touchmove', preventDefault, { passive: false })
    window.addEventListener('keydown', preventKeys, { passive: false })

    const { $lenis } = useNuxtApp?.() || {}
    $lenis?.stop?.()

    window._preventScroll = preventDefault
    window._preventKeys = preventKeys
}

const enableScroll = () => {
    window.removeEventListener('wheel', window._preventScroll!)
    window.removeEventListener('touchmove', window._preventScroll!)
    window.removeEventListener('keydown', window._preventKeys!)

    const { $lenis } = useNuxtApp?.() || {}
    $lenis?.start?.()
}

const floatingEl = ref<HTMLElement | null>(null)
const placeholderEl = ref<HTMLElement | null>(null)
const infocus = ref(false)

const floatElement = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()

    disableScroll()

    const placeholder = document.createElement('div')
    placeholder.className = 'widget widget-placeholder'
    placeholder.style.background = 'none'

    const vars = ['--columns', '--rows', '--m-columns', '--m-rows']
    vars.forEach(name => {
        const val = element.style.getPropertyValue(name)
        if (val) placeholder.style.setProperty(name, val)
    })

    element.parentNode?.insertBefore(placeholder, element)
    placeholderEl.value = placeholder

    element.dataset.floatItem = "content"

    const oleft = touchHoldTimer && forceTriggered.value ? rect.left - 11 : rect.left

    Object.assign(element.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${oleft}px`,
        zIndex: '9999',
        transition: 'top .5s ease, left .5s ease, transform 0.2s linear 0s, background-color 0.6s linear 0s, box-shadow 0.3s ease-in-out 0s, border-radius .6s, border .3s linear'
    })

    document.documentElement.classList.add('forcewidget')

    void element.offsetWidth

    const pleft = touchHoldTimer && forceTriggered.value ? ((window.innerWidth - rect.width - 22) / 2) : ((window.innerWidth - rect.width) / 2)

    element.style.top = `${(window.innerHeight - rect.height) / 2}px`
    element.style.left = `${pleft}px`

    floatingEl.value = element
}

const floatElementWithRatio = (element: HTMLElement, aspectRatio: number, opacity = false, percent = 0.8, type = 'image') => {
    const rect = element.getBoundingClientRect();

    disableScroll();

    const placeholder = document.createElement('div');
    placeholder.className = 'widget widget-placeholder';
    placeholder.style.background = 'none';

    const vars = ['--columns', '--rows', '--m-columns', '--m-rows'];
    vars.forEach(name => {
        const val = element.style.getPropertyValue(name);
        if (val) placeholder.style.setProperty(name, val);
    });

    element.parentNode?.insertBefore(placeholder, element);
    placeholderEl.value = placeholder;

    element.dataset.floatItem = type;

    const oleft = touchHoldTimer && forceTriggered.value ? rect.left - 11 : rect.left;

    element.classList.add(type+'cover')

    tempopacity.value = window.getComputedStyle(element).opacity

    Object.assign(element.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${oleft}px`,
        zIndex: '9999',
        opacity: tempopacity.value,
        transition: 'top .5s ease, left .5s ease, width .5s ease, height .5s ease, opacity .5s linear, transform 0.2s linear 0s, background-color 0.6s linear 0s, box-shadow 0.3s ease-in-out 0s, border-radius .6s, border .3s linear'
    });

    document.documentElement.classList.add('forcewidget')

    floatingEl.value = element;
    void element.offsetWidth;

    const maxWidth = window.innerWidth * percent;
    const maxHeight = window.innerHeight * percent;


    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
    }

    element.style.width = `${newWidth}px`;
    element.style.height = `${newHeight}px`;

    element.style.setProperty('--size', `${newWidth/50}px`);

    if (!opacity) {
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    const pleft = touchHoldTimer && forceTriggered.value
        ? ((window.innerWidth - newWidth - 22) / 2)
        : ((window.innerWidth - newWidth) / 2);

    element.style.top = `${(window.innerHeight - newHeight) / 2}px`;
    element.style.left = `${pleft}px`;

    floatingEl.value = element;
};

const restoreElement = () => {
    const element = floatingEl.value
    const placeholder = placeholderEl.value
    if (!element || !placeholder) return

    const { top, left } = placeholder.getBoundingClientRect()

    element.style.transition = 'top .5s ease, left .5s ease, transform 0.2s linear 0s, background-color 0.6s linear 0s, box-shadow 0.3s ease-in-out 0s, border-radius .6s, border .3s linear'
    element.style.top = `${top}px`
    element.style.left = `${left}px`

    document.documentElement.classList.remove('forcewidget')

    setTimeout(() => {
        placeholder.remove()

        Object.assign(element.style, {
            position: '',
            transition: '',
            zIndex: '',
            top: '',
            left: ''
        })
        

        delete element.dataset.floatItem

        floatingEl.value = null
        placeholderEl.value = null

        enableScroll()
    }, 500)
}

const restoreElementWithRatio = () => {
    const element = floatingEl.value;
    const placeholder = placeholderEl.value;
    if (!element || !placeholder) return;


    const { top, left, width, height } = placeholder.getBoundingClientRect();

    element.style.transition = 'top .5s ease, left .5s ease, width .5s ease, height .5s ease, opacity .5s linear, transform 0.2s linear 0s, background-color 0.6s linear 0s, box-shadow 0.3s ease-in-out 0s, border-radius .6s, border .3s linear';
    element.style.top = `${top}px`;
    element.style.left = `${left}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.opacity = tempopacity.value;
    element.classList.remove('imagecover')
    element.classList.remove('musiccover')

    document.documentElement.classList.remove('forcewidget')

    setTimeout(() => {
        placeholder.remove();

        Object.assign(element.style, {
            position: '',
            transition: '',
            zIndex: '',
            top: '',
            left: '',
            width: '',
            height: '',
            opacity: ''
        });

        element.style.removeProperty('--size');

        delete element.dataset.floatItem;

        floatingEl.value = null;
        placeholderEl.value = null;

        enableScroll();
    }, 500);
};

const handleDoubleClick = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement

    if (floatingEl.value === target) {
        infocus.value = false
        currentdisplay.value = ''
        if (target.children[0].classList.contains('imgcontent') && widgetdata[Array.from(target.parentElement!.children).indexOf(target)-1].zoom) {
            restoreElementWithRatio()
        } else if (target.children[0].classList.contains('music-widget')) {
            restoreElementWithRatio()
        } else {
            restoreElement()
        }
    } else {
        if (floatingEl.value) restoreElement()
        if (target.children[0].classList.contains('imgcontent') && widgetdata[Array.from(target.parentElement!.children).indexOf(target)].zoom) {
            const bgImage = getComputedStyle(target.children[0]).backgroundImage;
            const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
            if (urlMatch && urlMatch[1]) {
                const imageUrl = urlMatch[1];
                const img = new Image();
                img.src = imageUrl;
                img.onload = () => {
                    const width = img.naturalWidth;
                    const height = img.naturalHeight;
                    const ratio = width / height;
                    infocus.value = true
                    floatElementWithRatio(target, ratio)
                };
            }
        } else if (target.children[0].classList.contains('music-widget')) {
            const ratio = 4 / 3;
            infocus.value = true
            floatElementWithRatio(target, ratio, true, 0.5, 'music')
        } else {
            infocus.value = true
            floatElement(target)
        }
        currentdisplay.value = 'widget'
    }
}

const handledbgclose = () => {
    if(!allowtouchout) return;

    if (currentdisplay.value === 'widget') {
        infocus.value = false;
        if (floatingEl.value?.children[0].classList.contains('imgcontent') && widgetdata[Array.from(floatingEl.value.parentElement!.children).indexOf(floatingEl.value)-1].zoom) {
            restoreElementWithRatio()
        } else if (floatingEl.value?.children[0].classList.contains('music-widget')) {
            restoreElementWithRatio()
        } else {
            restoreElement()
        }
    } else if (currentdisplay.value === 'project') {
        infocus.value = false
        currentdisplay.value = ''
        restoreElementWithRatio()
    }
}

const floatProjectRatio = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();

    disableScroll();

    infocus.value = true
    currentdisplay.value = 'project'
    const placeholder = document.createElement('div');
    placeholder.className = 'project project-placeholder';
    placeholder.style.background = 'none';

    const vars = ['--columns', '--rows', '--m-columns', '--m-rows'];
    vars.forEach(name => {
        const val = element.style.getPropertyValue(name);
        if (val) placeholder.style.setProperty(name, val);
    });

    const link = document.createElement('a');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = 'Lyntrix';
    const desc = document.createElement('div');
    desc.className = 'description';
    desc.textContent = 'Lyntrix';
    link.appendChild(title);
    link.appendChild(desc);
    placeholder.appendChild(link);
    element.parentNode?.insertBefore(placeholder, element);

    placeholderEl.value = placeholder;
    element.dataset.floatItem = "project";

    const oleft = touchHoldTimer && forceTriggered.value ? rect.left - 11 : rect.left;

    tempopacity.value = window.getComputedStyle(element).opacity

    Object.assign(element.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${oleft}px`,
        width: `${window.getComputedStyle(element).width}`,
        height: `${window.getComputedStyle(element).height}`,
        zIndex: '9999',
        opacity: tempopacity.value,
        transition: 'top .5s ease, left .5s ease, width .5s ease, height .5s ease, opacity .5s linear, transform 0.2s linear 0s, background-color 0.6s linear 0s, box-shadow 0.3s ease-in-out 0s, border-radius .6s, border .3s linear'
    });

    document.documentElement.classList.add('forcewidget')

    floatingEl.value = element;

    // 强制回流，确保 transition 生效
    void element.offsetWidth;

    // 🟡 以下部分是唯一修改：根据比例调整宽高并居中
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.8;

    let newWidth = maxWidth;
    let newHeight = newWidth / 1.6;

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * 1.6;
    }

    element.style.width = `${newWidth}px`;
    element.style.height = `${newHeight}px`;
    element.style.setProperty('--size', `${newWidth/50}px`);
    requestAnimationFrame(() => {
        element.style.opacity = '1';
    });

    const pleft = touchHoldTimer && forceTriggered.value
        ? ((window.innerWidth - newWidth - 22) / 2)
        : ((window.innerWidth - newWidth) / 2);

    element.style.top = `${(window.innerHeight - newHeight) / 2}px`;
    element.style.left = `${pleft}px`;

    floatingEl.value = element;
};

const handleProjectClick = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement

    if (floatingEl.value === target && infocus.value) {
        infocus.value = false
        currentdisplay.value = ''
        restoreElementWithRatio()
    } else if (!floatingEl.value) {
        floatProjectRatio(target)
    }
}
</script>

<style lang="scss">
.content {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    column-gap: 60px;
    align-items: start;
    margin-top: max(0px, var(--scroll-shift));
    margin-bottom: calc(35vh - max(0px, var(--scroll-shift)));

    @media (max-width: 1300px) {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        max-width: 950px;
        margin-left: auto;
        margin-right: auto;
        gap: 40px;
    }

    @media (max-width: 880px) {
        max-width: 480px;
    }

    .matrix {
        --gap: 40px;
        --display-columns: 8;

        display: grid;
        grid-template-columns: repeat(var(--display-columns), 1fr);
        grid-column-gap: 40px;
        grid-row-gap: 40px;
        grid-column: span 8;

        @media (max-width: 880px) {
            --gap: 25px;
            --display-columns: 4;
            grid-column-gap: 25px;
            grid-row-gap: 25px;
        }

        .widget {
            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: calc(var(--square-size) * 0.36);
            overflow: hidden;
            touch-action: manipulation;
            color: #000000;
            opacity: 0.8;
            font-size: calc(var(--square-size) * 0.1365);
            background-color: color-mix(in srgb, var(--lyntrix-color-high, #fff) 32%, white);
            transform: perspective(500px) translateZ(var(--tz)) rotateY(var(--rx)) rotateX(var(--ry));
            transition: transform 0.2s linear 0s, background-color 0.6s linear 0s, box-shadow 0.3s ease-in-out 0s, filter 0.5s, border-radius .6s, border 0.3s linear;
            --col: min(var(--columns, 2), var(--display-columns));
            --row: var(--rows, 2);

            grid-column: span var(--col);
            grid-row: span var(--row);
            height: calc(var(--square-size) * var(--row) + var(--gap) * (var(--row) - 1));
            width: calc(var(--square-size) * var(--col) + var(--gap) * (var(--col) - 1));

            &:hover {
                background-color: color-mix(in srgb,
                        color-mix(in srgb, var(--lyntrix-color-high, #fff) 32%, white) 90%,
                        black);
            }

            @media (max-width: 880px) {
                --col: min(var(--m-columns, --columns, 2), var(--display-columns));
                --row: var(--m-rows, --rows, 2);
            }

            a {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: space-between;
                padding: calc(var(--square-size) * 0.3);
                color: inherit;
                box-sizing: border-box;

                >div {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: calc(var(--square-size) * 0.66);
                    height: calc(var(--square-size) * 0.66);
                    border-radius: calc(var(--square-size) * 0.18);

                    svg {
                        color: #ffffff;
                        width: calc(var(--square-size) * 0.3);
                        height: calc(var(--square-size) * 0.3);
                    }
                }

                &.single {
                    padding: calc(var(--square-size) / 83.75 * 20);

                    >div {
                        flex-direction: row;
                        align-items: center;
                        justify-content: flex-start;
                        gap: calc(var(--square-size) * 0.18);

                        .icon {
                            border-radius: calc(var(--square-size) * 0.18);
                            width: calc(var(--square-size) - calc(var(--square-size) / 83.75 * 40));
                            height: calc(var(--square-size) - calc(var(--square-size) / 83.75 * 40));

                            svg {
                                width: calc(var(--square-size) * 0.25);
                                height: calc(var(--square-size) * 0.25);
                            }
                        }

                        .title {
                            line-height: calc(var(--square-size) * 0.24);
                            font-size: calc(var(--square-size) * 0.24);
                            font-weight: bold;
                            margin-bottom: calc(var(--square-size) / 83.75 * 4);
                        }

                        .desc {
                            line-height: calc(var(--square-size) * 0.2);
                            font-size: calc(var(--square-size) * 0.2);
                            opacity: 0.8;
                        }
                    }
                }

                .title {
                    font-size: calc(var(--square-size) * 0.26);
                    font-weight: bold;
                    margin-bottom: calc(var(--square-size) * 0.05);
                }

                .desc {
                    font-size: calc(var(--square-size) * 0.2);
                    opacity: 0.8;
                }
            }

            .imgcontent {
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
            }

            .count-widget {
                display: flex;
                height: 100%;
                width: 100%;
                padding: calc(var(--square-size) * 0.26);
                box-sizing: border-box;
                flex-direction: column;
                justify-content: space-between;
            }

            .music-widget {
                display: flex;
                height: 100%;
                width: 100%;
                padding: calc(var(--square-size) * 0.26);
                padding-bottom: calc(var(--square-size) * 0.2);
                box-sizing: border-box;
                flex-direction: column;
                justify-content: space-between;
            }
        }

        .widget.imagecover {
            > .imgcontent {
                background-size: 100% !important;
            }
        }
    }

    .projlist {
        display: flex;
        grid-column: span 4;
        flex-direction: column;
        gap: 20px;

        @media (max-width: 1300px) {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 880px) {
            display: flex;
            min-width: 275px;
        }

        .project {
            background-color: color-mix(in srgb, var(--lyntrix-color-high, #fff) 32%, white);
            border-radius: calc(var(--square-size) * 0.36);
            font-size: calc(var(--square-size) * 0.1365);
            color: #000000;
            overflow: hidden;
            opacity: 0.8;
            --x: 0deg;
            --y: 0deg;
            transform: perspective(500px) translateZ(var(--tz)) rotateY(var(--rx)) rotateX(var(--ry));
            transition: transform 0.15s linear 0s, background-color 0.2s linear 0s, box-shadow 0.2s ease 0s, width 0.5s, height 0.5s, filter 0.5s;

            a {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                transition: padding .6s;
                padding: calc(var(--square-size) * 0.28) calc(var(--square-size) * 0.32);
                user-select: none;

                .title {
                    font-weight: 700;
                    font-size: calc(var(--square-size) * 0.26);
                    line-height: calc(var(--square-size) * 0.26);
                    margin-bottom: calc(var(--square-size) * 0.1);
                    transition: font-size .6s, line-height .6s, margin .6s;
                }

                .description {
                    flex: 1 1 0%;
                    opacity: 0.8;
                    transition: font-size .6s;
                    font-size: calc(var(--square-size) * 0.2);
                }

                .detail {
                    opacity: 0;
                    height: 100%;
                    width: 100%;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 0.8em;
                    overflow: hidden;
                    filter: blur(15px);
                    transition: margin 0.6s, opacity 0.6s, filter 0.6s;
                }
            }

            &.project-placeholder {
                opacity: 0 !important;
            }
        }
    }

    .covers {
        position: fixed;
        inset: 0;
        transition: .5s;
    }
}

html.dark-mode {
    .content {
        .matrix {
            .widget {
                background: #78c7ff2f;
                color: #78c6ff;
                border: calc(var(--square-size) * 0.035) solid #78c7ffd5;
                box-sizing: border-box;

                &:hover {
                    background-color: #91d1ff3a;
                    box-shadow: 0 0 24px #78c1f664, 0 0 10px #73bef351;
                }

                &[data-float-item=music], &[data-float-item=image] {
                    border-width: .3em;
                }
            }
        }

        .projlist {
            .project {
                background: #78c7ff2f;
                color: #78c6ff;
                border: calc(var(--square-size) * 0.035) solid #78c7ffd5;
                box-sizing: border-box;

                &:hover {
                    background-color: #91d1ff3a;
                    box-shadow: 0 0 24px #78c1f664, 0 0 10px #73bef351;
                }
            }
        }
    }
}

.content .widget.imagecover {
    border-width: 0 !important;
}

.content.infocus {
    .matrix {
        .widget {
            filter: blur(15px);

            .widget[data-float-item=image] {
                border-radius: 3em;
            }

            &[data-float-item=music] {
                border-radius: 3em;
            }
        }
    }

    .projlist .project {
        filter: blur(15px);

        &[data-float-item] {
            border-radius: 2em;

            a {
                padding: 1.25em 1.25em;

                .title {
                    font-size: 1.25em;
                    line-height: 1em;
                    margin-bottom: .4em;
                }

                .description {
                    font-size: 1em;
                }

                .detail {
                    opacity: 1;
                    filter: none;
                    margin-top: .75em;
                }
            }
        }
    }
}

.content.inanim {
    .matrix {
        .widget[data-float-item] {
            filter: none;
        }

        .widget[data-float-item=image], .widget[data-float-item=music] {
            font-size: var(--size);
            animation: none;
        }

        .widget-placeholder {
            opacity: 0 !important;
        }
    }

    .projlist {
        .project[data-float-item] {
            font-size: var(--size);
            animation: none;
            filter: none;
        }
    }
}
@supports not (font: -apple-system-body) {
    @supports (animation-timeline: scroll(root y)) {
        .content {
            animation: content-flip auto linear;
            animation-fill-mode: both;
            animation-timeline: scroll(root y);
            animation-range-start: 0;
            animation-range-end: 25vh;

            .widget,
            .project {
                animation: widget-flip auto linear;
                animation-fill-mode: both;
                animation-timeline: view();
                animation-range: entry 0 entry 100px;
            }
        }
    }
}

@keyframes content-flip {
    0% {
        margin-top: 35vh;
        margin-bottom: 0vh;
        opacity: 0;
    }

    100% {
        margin-top: 0vh;
        margin-bottom: 35vh;
        opacity: 1;
    }
}

@keyframes widget-flip {
    0% {
        scale: 0.8;
        opacity: 0;
    }

    100% {
        scale: 1;
        opacity: 0.8;
    }
}
</style>