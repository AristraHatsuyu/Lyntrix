<template>
    <div class="content">
        <div class="matrix">
            <CardContainer v-for="(data, index) in widgetdata" :key="index" class="widget" :columns="data.columns"
                :rows="data.row" :mcolumns="data.mcolumns" :mrows="data.mrow">
                <a draggable="false">
                    <div class="title">{{ data.title }}</div>
                    <div class="desc">{{ data.description }}</div>
                </a>
            </CardContainer>
        </div>
        <div class="projlist">
            <CardContainer v-for="i in 8" :key="i" class="project">
                <a draggable="false">
                    <div class="title" href="" target="_blank">Project {{ i }}</div>
                    <div class="description">This is the project {{ i }}</div>
                </a>
            </CardContainer>
        </div>
    </div>
</template>


<script setup lang="ts">
const widgetdata = [
    {
        title: 'Widget 1',
        description: 'This is the large widget.',
        icon: '',
        link: 'https://example.com/widget1',
        columns: 4,
        row: 2,
        image: 'https://example.com/image1.jpg'
    },
    {
        title: 'Widget 2',
        description: 'This is the widget.',
        icon: '',
        link: 'https://example.com/widget2',
        columns: 2,
        row: 2
    },
    {
        title: 'Widget 3',
        description: 'This is the widget.',
        icon: '',
        link: 'https://example.com/widget3',
        columns: 2,
        row: 2
    },
    {
        title: 'Widget 4',
        description: 'This is the widget.',
        icon: '',
        link: 'https://example.com/widget3',
        columns: 2,
        row: 2
    },
    {
        title: 'Widget 5',
        description: 'This is the widget.',
        icon: '',
        link: 'https://example.com/widget3',
        columns: 2,
        row: 2
    },
    {
        title: 'Widget 6',
        description: 'This is the large widget.',
        icon: '',
        link: 'https://example.com/widget1',
        columns: 4,
        row: 2,
        image: 'https://example.com/image1.jpg'
    },
    {
        title: 'Widget 7',
        description: 'This is the large widget.',
        icon: '',
        link: 'https://example.com/widget1',
        columns: 5,
        row: 2,
        mrow: 2,
        image: 'https://example.com/image1.jpg'
    },
    {
        title: 'Widget 8',
        description: '',
        icon: '',
        link: 'https://example.com/widget3',
        columns: 3,
        row: 1,
        mcolumns: 2,
        mrow: 2
    },
    {
        title: 'Widget 9',
        description: 'This is the widget.',
        icon: '',
        link: 'https://example.com/widget3',
        columns: 3,
        row: 3,
        mcolumns: 2,
        mrow: 2
    },
    {
        title: 'Widget 10',
        description: 'This is the widget.',
        icon: '',
        link: 'https://example.com/widget3',
        columns: 2,
        row: 2
    },
    {
        title: 'Widget 11',
        description: 'This is the widget.',
        icon: '',
        link: 'https://example.com/widget3',
        columns: 3,
        row: 2,
        mcolumns: 2,
        mrow: 2
    }
]
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
        animation: content-shift auto linear;
        animation-fill-mode: both;
        animation-timeline: scroll(root y);
        animation-range-start: 0;
        animation-range-end: 25vh;
    }
}

@keyframes content-shift {
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

.content .matrix {
    --gap: 40px;
    --template-columns: 8;

    display: grid;
    grid-template-columns: repeat(var(--template-columns),1fr);
    grid-column-gap: 40px;
    grid-row-gap: 40px;
    grid-column: span 8;
}

@media (max-width: 880px) {
    .content .matrix {
        --gap: 25px;
        --template-columns: 4;
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
    background-color: color-mix(in srgb, var(--lyntrix-theme-color-high) 32%, white);
    backdrop-filter: blur(.8rem);
    user-select: none;
    transform: perspective(500px) translateZ(var(--tz)) rotateY(var(--rx)) rotateX(var(--ry));
    transition: transform .2s linear 0s, background-color .6s linear 0s, box-shadow .2s ease 0s;
    --c: min(var(--columns, 2), var(--template-columns));
    --r: var(--rows, 2);

    grid-column: span var(--c);
    grid-row: span var(--r);
    height: calc(var(--square-size) * var(--r) + var(--gap) * (var(--r) - 1));
    width: calc(var(--square-size) * var(--c) + var(--gap) * (var(--c) - 1));
}

@media (max-width: 880px) {
    .content .matrix .widget {
        --c: min(var(--m-columns, --columns, 2), var(--template-columns));
        --r: var(--m-rows, --rows, 2);
    }
}

@supports (animation-timeline: scroll(root y)) {
    .content .widget, .content .project {
        animation: widget-in auto linear;
        animation-fill-mode: both;
        animation-timeline: view();
        animation-range: entry 0 entry 100px;
    }
}

@keyframes widget-in {
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
        display: flex
;
    }
}

.project {
    background-color: color-mix(in srgb, var(--lyntrix-theme-color-high) 32%, white);
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

.project > a .title {
    font-weight: 700;
    font-size: 1.08em;
}

.project > a .description {
    flex: 1 1 0%;
}
</style>