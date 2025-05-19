<template>
    <div class="content">
        <div class="matrix">
            <CardContainer v-for="(data, index) in widgetdata" :key="index" class="widget" :columns="data.columns"
                :rows="data.row" :mcolumns="data.mcolumns" :mrows="data.mrow">
                <a v-if="data.type === 1" :class="{ 'single': data.row < 2 && windowWidth > 880 }"
                    draggable="false" :href="data.link?data.link:'javascript:;'" :target=" data.link ? '_blank' : '_self' " data-pointer>
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
                        style="border-radius: .6rem; width: 110%;" />
                </a>
                <div v-else-if="data.type === 2" class="imgcontent" style="width: 100%; height: 100%;"
                    :style="{ 'background-image': `url('${data.image}')` }" />
                <div v-else-if="data.type === 3" class="clock-widget">
                    <TimeCard />
                </div>
            </CardContainer>
        </div>
        <div class="projlist">
            <CardContainer v-for="(data, index) in projectdata" :key="index" class="project">
                <a draggable="false" data-pointer>
                    <div class="title" href="" target="_blank">{{ data.title }}</div>
                    <div class="description">{{ data.description }}</div>
                </a>
            </CardContainer>
        </div>
    </div>
</template>


<script setup lang="ts">
import config from "@/assets/config.json";
import { ref, onMounted, onUnmounted } from 'vue'

const widgetdata = config.widget
const projectdata = config.project

const windowWidth = ref(window.innerWidth)

const updateWidth = () => {
    windowWidth.value = window.innerWidth
}

onMounted(() => {
    window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
})
</script>

<style lang="scss">
.content {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 60px;
  align-items: start;

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

  @supports (animation-timeline: scroll(root y)) {
    animation: content-flip auto linear;
    animation-fill-mode: both;
    animation-timeline: scroll(root y);
    animation-range-start: 0;
    animation-range-end: 25vh;
  }

  @supports not (animation-timeline: scroll(root y)) {
    margin-top: max(0px, var(--scroll-shift));
    margin-bottom: calc(35vh - max(0px, var(--scroll-shift)));
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

      border-radius: 1.5rem;
      overflow: hidden;
      touch-action: manipulation;
      color: #000000;
      opacity: 0.8;
      background-color: color-mix(in srgb, var(--lyntrix-color-high, #fff) 32%, white);
      backdrop-filter: blur(0.8rem);
      transform: perspective(500px) translateZ(var(--tz)) rotateY(var(--rx)) rotateX(var(--ry));
      transition: transform 0.2s linear 0s, background-color 0.6s linear 0s, box-shadow 0.3s ease-in-out 0s;
      --col: min(var(--columns, 2), var(--display-columns));
      --row: var(--rows, 2);

      grid-column: span var(--col);
      grid-row: span var(--row);
      height: calc(var(--square-size) * var(--row) + var(--gap) * (var(--row) - 1));
      width: calc(var(--square-size) * var(--col) + var(--gap) * (var(--col) - 1));

      &:hover {
        background-color: color-mix(
          in srgb,
          color-mix(in srgb, var(--lyntrix-color-high, #fff) 32%, white) 90%,
          black
        );
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
        padding: 24px;
        color: inherit;
        box-sizing: border-box;

        > div {
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
          border-radius: 0.8rem;

          svg {
            color: #ffffff;
            width: calc(var(--square-size) * 0.3);
            height: calc(var(--square-size) * 0.3);
          }
        }

        &.single {
          padding: calc(var(--square-size) / 83.75 * 20);

          > div {
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 1.2rem;

            .icon {
              border-radius: 0.6rem;
              width: calc(var(--square-size) - calc(var(--square-size) / 83.75 * 40));
              height: calc(var(--square-size) - calc(var(--square-size) / 83.75 * 40));

              svg {
                width: calc(var(--square-size) * 0.25);
                height: calc(var(--square-size) * 0.25);
              }
            }

            .title {
              line-height: 1rem;
              font-size: 1rem;
              font-weight: bold;
              margin-bottom: calc(var(--square-size) / 83.75 * 4);
            }

            .desc {
              line-height: 1rem;
              font-size: 0.9rem;
              opacity: 0.8;
            }
          }
        }

        .title {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 0.2rem;
        }

        .desc {
          font-size: 0.95rem;
          opacity: 0.8;
        }
      }

      .imgcontent {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
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
    }
  }
}

.project {
  background-color: color-mix(in srgb, var(--lyntrix-color-high, #fff) 32%, white);
  backdrop-filter: blur(0.8rem);
  border-radius: 1.5rem;
  color: #000000;
  overflow: hidden;
  opacity: 0.8;
  --x: 0deg;
  --y: 0deg;
  transform: perspective(500px) translateZ(var(--tz)) rotateY(var(--rx)) rotateX(var(--ry));
  transition: transform 0.15s linear 0s, background-color 0.2s linear 0s, box-shadow 0.2s ease 0s;

  a {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 15px 20px;
    gap: 5px;
    user-select: none;

    .title {
      font-weight: 700;
      font-size: 1.08em;
    }

    .description {
      flex: 1 1 0%;
    }
  }
}

html.dark-mode {
  .content {
    .matrix {
      .widget {
        background: #78c7ff2f;
        color: #78c6ff;
        border: 2px solid #78c7ffd5;
        box-sizing: border-box;

        &:hover {
          background-color: #91d1ff3a;
          box-shadow: 0 0 24px #78c1f664, 0 0 10px #73bef351;
        }
      }
    }
    .projlist {
      .project {
        background: #78c7ff2f;
        color: #78c6ff;
        border: 2px solid #78c7ffd5;
        box-sizing: border-box;

        &:hover {
          background-color: #91d1ff3a;
          box-shadow: 0 0 24px #78c1f664, 0 0 10px #73bef351;
        }
      }
    }
  }
}

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