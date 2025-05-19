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
        gap: 1rem;

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

        .title,
        .mtitle {
            font-size: 1.2rem;
            font-weight: bold;
            line-height: 1.2rem;
            margin-bottom: 0.2rem;
        }

        .desc,
        .mdesc {
            font-size: 0.95rem;
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
            height: 45px;
            line-height: 40px;
            text-align: center;
            font-size: 30px;
            background: #00000024;
            border-radius: 10px;
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
            border-radius: 10px;
            justify-content: space-around;
            padding: 0 6px;

            .numbox {
                background: none;
            }
        }
    }
}
</style>