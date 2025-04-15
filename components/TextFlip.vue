<template>
  <div style="transition: width .5s" :style="{ width: textWidth }">
    <div ref="scope" style="display: flex;">
      <span v-for="(char, idx) in wordsArray" :key="char + idx" class="spanStyle">
        {{ char }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type HTMLAttributes, onMounted, ref, watch, nextTick } from "vue";

const props = withDefaults(
  defineProps<{
    words: string;
    filter?: boolean;
    duration?: number;
    delay?: number;
    class?: HTMLAttributes["class"];
  }>(),
  { duration: 0.7, delay: 0, filter: true },
);

const scope = ref<HTMLElement | null>(null);

// 动态生成字符数组，支持 emoji 和特殊字符
const wordsArray = ref(props.words.split(""));

function getVisualLength(str: string): number {
  let length = 0
  for (const char of str) {
    // 中文、日文、韩文等通常是全角字符，占两个宽度
    if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(char)) {
      length += 2
    } else {
      length += 1
    }
  }
  return length
}

const textWidth = computed(() => {
  const str = wordsArray.value.join("") // 如果是字符数组
  const visualLength = getVisualLength(str)
  return (visualLength * 0.65) + "rem"
})

// 触发文字生成进入动画
function generateEnterAnimation() {
  if (scope.value) {
    const spans = scope.value.querySelectorAll("span");

    setTimeout(() => {
      spans.forEach((span: HTMLElement, index: number) => {
        setTimeout(() => {
          span.style.opacity = "1";
          span.style.filter = props.filter ? "blur(0px)" : "none";
        }, 450 / spans.length * index); // 每个字符的动画延迟
      });
    }, props.delay);
  }
}

// 触发文字消失动画
function generateExitAnimation() {
  if (scope.value) {
    const spans = scope.value.querySelectorAll("span");
    let completed = 0;

    spans.forEach((span: HTMLElement, index: number) => {
      setTimeout(() => {
        span.style.opacity = "0";
        span.style.filter = props.filter ? "blur(10px)" : "none";

        // 检查是否所有动画都完成
        if (++completed === spans.length) {
          setTimeout(async () => {
            wordsArray.value = props.words.split("");
            await nextTick();
            setTimeout(async () => {
              generateEnterAnimation();
            }, 50); // 等待 DOM 更新
          }, 50);
        }
      }, 450 / spans.length * index); // 每个字符的动画延迟
    });
  }
}

// 初次挂载时触发进入动画
onMounted(() => {
  nextTick(() => {
    generateEnterAnimation();
  });
});

// 监听 props.words 动态变化，先执行消失动画，再更新内容并执行进入动画
watch(
  () => props.words,
  async (newWords, oldWords) => {
    if (newWords !== oldWords) {
      generateExitAnimation()
    }
  },
);
</script>

<style scoped>
.spanStyle {
  opacity: 0;
  filter: blur(10px);
  transition: opacity .7s, filter .7s;
}
</style>