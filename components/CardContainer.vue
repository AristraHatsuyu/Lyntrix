<template>
    <div ref="containerRef" :class="props.class" style="transform-style: preserve-3d" :style="WidgetStyle"
        @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { useMouseState } from "@/composables/useMouseState";
import { provide, ref } from "vue";

interface Props {
    class?: string;
    columns?: number;
    rows?: number;
    mcolumns?: number;
    mrows?: number;
}

const props = withDefaults(defineProps<Props>(), {
    class: "",
    columns: 2,
    rows: 2,
    mcolumns: 0,
    mrows: 0
});

const tz = ref(0);
const rx = ref(0);
const ry = ref(0);

const WidgetStyle = computed(() => ({
    '--columns': props.columns,
    '--rows': props.rows,
    '--m-columns': props.mcolumns == 0 ? props.columns : props.mcolumns,
    '--m-rows': props.mrows == 0 ? props.rows : props.mrows,
    '--tz': tz.value ? tz.value + 'rem' : '0',
    '--rx': rx.value ? rx.value + 'deg' : '0deg',
    '--ry': ry.value ? ry.value + 'deg' : '0deg'
}))

const containerRef = ref<HTMLElement | null>(null);
const isMouseDown = ref(false); // 标记鼠标是否按下

const mouseState = useMouseState(); // 使用自定义的鼠标状态管理
provide("use3DCardMouseState", mouseState);

function updatetransform(e: MouseEvent) {
    const maxRotation = 10

    if (!containerRef.value) return;
    const { left, top, width, height } = containerRef.value.getBoundingClientRect()
    const normX = (e.clientX - left - width / 2) / (width / 2)
    const normY = (e.clientY - top - height / 2) / (height / 2)
    const clampedX = Math.max(-1, Math.min(1, normX))
    const clampedY = Math.max(-1, Math.min(1, normY))
    ry.value = clampedY * maxRotation * -1  // Y轴上下移动 → 旋转X轴
    rx.value = clampedX * maxRotation   // X轴左右移动 → 旋转Y轴
    tz.value = -1.5;
}

function handleMouseMove(e: MouseEvent) {
    if (!isMouseDown.value) return; // 仅在鼠标按下时处理
    updatetransform(e);
}

function handleMouseDown(e: MouseEvent) {
    isMouseDown.value = true; // 标记鼠标按下
    mouseState.setMouseEntered(true);
    updatetransform(e);
}

function handleMouseUp() {
    if (!containerRef.value) return;
    isMouseDown.value = false; // 标记鼠标松开
    mouseState.setMouseEntered(false);
    rx.value = 0
    ry.value = 0
    tz.value = 0
}
</script>