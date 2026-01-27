<template>
    <div class="flip-words-wrapper">
        <div v-show="showtext" class="flip-words-content">
            <template v-for="(wordObj, wordIndex) in splitWords" :key="wordObj.word + wordIndex">
                <span class="flip-words-word" :style="{
                    animation: `fadeInWord 0.3s ease forwards`,
                    animationDelay: `${wordIndex * 0.6}s`,
                }">
                    <span v-for="(letter, letterIndex) in wordObj.letters" :key="wordObj.word + letterIndex"
                        class="flip-words-letter" :style="{
                            animation: `fadeInLetter 0.4s ease forwards`,
                            animationDelay: `${wordIndex * 0.6 + letterIndex * 0.1}s`,
                        }">
                        {{ letter }}
                    </span>
                    <span class="flip-words-space">&nbsp;</span>
                </span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Props {
    words: string;
    duration?: number;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    duration: 0,
    class: "",
});

const showtext = ref(false)

const splitWords = computed(() => {
    return props.words.split(" ").map((word) => ({
        word,
        letters: word.split(""),
    }));
});

onMounted(() => {
    setTimeout(() => {
        showtext.value = true // 显示文字
    }, props.duration);
});
</script>

<style>
/* Wrapper styles */
.flip-words-wrapper {
    position: relative;
    display: inline-block;
}

/* Content styles */
.flip-words-content {
    position: relative;
    z-index: 10;
    display: inline-block;
    text-align: left;
}

/* Word styles */
.flip-words-word {
    display: inline-block;
    white-space: nowrap;
    opacity: 0;
}

/* Letter styles */
.flip-words-letter {
    display: inline-block;
    opacity: 0;
}

/* Space styles */
.flip-words-space {
    display: inline-block;
}

/* Keyframes */
@keyframes fadeInWord {
    0% {
        opacity: 0;
        transform: translateY(10px);
        filter: blur(8px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
        filter: none;
    }
}

@keyframes fadeInLetter {
    0% {
        opacity: 0;
        transform: translateY(10px);
        filter: blur(8px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
        filter: none;
    }
}
</style>