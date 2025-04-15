<template>
    <div class="content">
        <div class="matrix">
            <CardContainer v-for="(data, index) in widgetdata" :key="index" class="widget" :columns="data.columns"
                :rows="data.row" :mcolumns="data.mcolumns" :mrows="data.mrow">
                <a draggable="false" :href="data.link" target="_blank" data-pointer>
                    <div class="title">{{ data.title }}</div>
                    <div class="desc">{{ data.description }}</div>
                </a>
            </CardContainer>
        </div>
        <div class="projlist">
            <CardContainer v-for="i in 8" :key="i" class="project">
                <a draggable="false" data-pointer>
                    <div class="title" href="" target="_blank">Project {{ i }}</div>
                    <div class="description">This is the project {{ i }}</div>
                </a>
            </CardContainer>
        </div>
    </div>
</template>


<script setup lang="ts">
import config from "@/assets/config.json";
const widgetdata = config.widget
</script>

<style>
.content {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    column-gap: 60px;
    align-items: start;
}

@media (max-width: 1300px) {
    .content {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        max-width: 950px;
        margin-left: auto;
        margin-right: auto;
        gap: 40px;
    }
}

@media (max-width: 880px) {
    .content {
        max-width: 480px;
    }
}

@supports (animation-timeline: scroll(root y)) {
    .content {
        animation: content-flip auto linear;
        animation-fill-mode: both;
        animation-timeline: scroll(root y);
        animation-range-start: 0;
        animation-range-end: 25vh;
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

@supports not (animation-timeline: scroll(root y)) {
    .content {
        margin-top: max(0px, var(--scroll-shift));
        margin-bottom: calc(35vh - max(0px, var(--scroll-shift)));
    }
}

.content .matrix {
    --gap: 40px;
    --display-columns: 8;

    display: grid;
    grid-template-columns: repeat(var(--display-columns), 1fr);
    grid-column-gap: 40px;
    grid-row-gap: 40px;
    grid-column: span 8;
}

@media (max-width: 880px) {
    .content .matrix {
        --gap: 25px;
        --display-columns: 4;
        grid-column-gap: 25px;
        grid-row-gap: 25px;
    }
}

.content .matrix .widget {
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 1.5rem;
    overflow: hidden;
    touch-action: manipulation;
    color: #000000;
    opacity: .8;
    background-color: color-mix(in srgb, var(--lyntrix-color-high, #fff) 32%, white);
    backdrop-filter: blur(.8rem);
    transform: perspective(500px) translateZ(var(--tz)) rotateY(var(--rx)) rotateX(var(--ry));
    transition: transform .2s linear 0s, background-color .6s linear 0s, box-shadow .3s ease-in-out 0s;
    --col: min(var(--columns, 2), var(--display-columns));
    --row: var(--rows, 2);

    grid-column: span var(--col);
    grid-row: span var(--row);
    height: calc(var(--square-size) * var(--row) + var(--gap) * (var(--row) - 1));
    width: calc(var(--square-size) * var(--col) + var(--gap) * (var(--col) - 1));
}

.content .matrix .widget:hover {
    background-color: color-mix(in srgb, color-mix(in srgb, var(--lyntrix-color-high, #fff) 32%, white) 90%, black);
}

html.dark-mode .content .matrix .widget,
html.dark-mode .projlist .project {
    background: #78c7ff2f;
    color: #78c6ff;
    border: 2px solid #78c7ffd5;
    box-sizing: border-box;
}

html.dark-mode .content .matrix .widget:hover,
html.dark-mode .content .projlist .project:hover {
    background-color: #91d1ff3a;
    box-shadow: 0 0 24px #78c1f664, 0 0 10px #73bef351;
}

@media (max-width: 880px) {
    .content .matrix .widget {
        --col: min(var(--m-columns, --columns, 2), var(--display-columns));
        --row: var(--m-rows, --rows, 2);
    }
}

@supports (animation-timeline: scroll(root y)) {

    .content .widget,
    .content .project {
        animation: widget-flip auto linear;
        animation-fill-mode: both;
        animation-timeline: view();
        animation-range: entry 0 entry 100px;
    }
}

@keyframes widget-flip {
    0% {
        scale: .8;
        opacity: 0;
    }

    100% {
        scale: 1;
        opacity: .8;
    }
}

/* 卡片内部 widget 样式 */
.content .matrix .widget>a {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px;
    color: inherit;
    box-sizing: border-box;
}

.content .matrix .widget>a .title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.content .matrix .widget>a .desc {
    font-size: 0.95rem;
    opacity: 0.8;
}

.content .projlist {
    display: flex;
    grid-column: span 4;
    flex-direction: column;
    gap: 20px;
}

@media (max-width: 1300px) {
    .content .projlist {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 880px) {
    .content .projlist {
        display: flex;
    }
}

.project {
    background-color: color-mix(in srgb, var(--lyntrix-color-high, #fff) 32%, white);
    backdrop-filter: blur(.8rem);
    border-radius: 1.5rem;
    color: #000000;
    overflow: hidden;
    opacity: .8;
    --x: 0deg;
    --y: 0deg;
    transform: perspective(500px) translateZ(var(--tz)) rotateY(var(--rx)) rotateX(var(--ry));
    transition: transform .15s linear 0s, background-color .2s linear 0s, box-shadow .2s ease 0s;
}

.project>a {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 15px 20px;
    gap: 5px;
    user-select: none;
}

.project>a .title {
    font-weight: 700;
    font-size: 1.08em;
}

.project>a .description {
    flex: 1 1 0%;
}
</style>