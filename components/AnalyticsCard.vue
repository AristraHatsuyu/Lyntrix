<template>
    <div class="count-widget">
        <div class="count-banner">
            <div style="background-color: #f5a228" class="icon">
                <font-awesome icon="chart-simple" />
            </div>
            <div>
                <div class="title">Analytics</div>
                <div class="desc">Data Statistics</div>
                <div class="mtitle">Count</div>
                <div class="mdesc">Visitor</div>
            </div>
        </div>
        <div class="numcontent">
            <div class="numbox">{{ countnum[0] }}</div>
            <div class="numbox">{{ countnum[1] }}</div>
            <div class="numbox">{{ countnum[2] }}</div>
            <div class="numbox">{{ countnum[3] }}</div>
            <div class="numbox">{{ countnum[4] }}</div>
            <div class="numbox">{{ countnum[5] }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';

interface Props {
    url?: string;
}

const props = withDefaults(defineProps<Props>(), {
    url: ""
});

const countnum = reactive(['-', '-', '-', '-', '-', '-']);

if (props.url) {
    axios.get(props.url)
        .then(res => {
            const count = Number(res.data?.count);
            if (!isNaN(count)) {
                const padded = count.toString().padStart(6, '0');
                for (let i = 0; i < 6; i++) {
                    countnum[i] = padded[i];
                }
            }
        })
        .catch(() => { });
}
</script>

<style lang="scss">
.count-widget {
    .count-banner {
        display: flex;
        align-items: center;
        gap: calc(var(--square-size) * 0.18);

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

        .title,
        .mtitle {
            font-size: calc(var(--square-size) * 0.26);
            font-weight: bold;
            line-height: calc(var(--square-size) * 0.26);
            margin-bottom: calc(var(--square-size) / 83.75 * 4);
        }

        .desc,
        .mdesc {
            font-size: calc(var(--square-size) * 0.2);
            opacity: 0.8;
        }

        .mdesc,
        .mtitle {
            display: none;
        }
    }

    .numcontent {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;

        .numbox {
            width: 14%;
            height: calc(var(--square-size) * 0.6);
            line-height: calc(var(--square-size) * 0.53);
            text-align: center;
            font-size: calc(var(--square-size) * 0.45);
            background: #00000024;
            border-radius: calc(var(--square-size) * 0.15);
        }
    }

    @media (max-width: 880px) {
        .count-banner {

            .desc,
            .title {
                display: none;
            }

            .mdesc,
            .mtitle {
                display: block;
            }
        }

        .numcontent {
            background: #00000024;
            border-radius: calc(var(--square-size) * 0.15);
            justify-content: space-around;
            padding: 0 calc(var(--square-size) * 0.05);

            .numbox {
                background: none;
            }
        }
    }
}

.dark-mode {
    .count-widget {
        .numcontent {
            .numbox {
                background: none;
                border: calc(var(--square-size) * 0.035) solid #78c6ff52;
            }
            @media (max-width: 880px) {
                background: none;
                border: calc(var(--square-size) * 0.035) solid #78c6ff52;

                .numbox {
                    background: none;
                    border: none;
                }
            }
        }
    }
}
</style>