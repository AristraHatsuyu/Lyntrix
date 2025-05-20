<template>
    <div class="clock-widget">
        <div class="clock-face">
            <svg class="clock-bg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
                <path
                    d="M469.881,324.15a90.631,90.631,0,0,1,7.616-28.425l15.88-32.267c3.642-7.4,3.642-19.514,0-26.916L477.5,204.275a90.631,90.631,0,0,1-7.616-28.425L467.5,139.967c-.547-8.232-6.6-18.722-13.459-23.311l-29.885-20a90.643,90.643,0,0,1-20.809-20.809l-20-29.885C378.755,39.1,368.265,33.047,360.033,32.5L324.15,30.119A90.631,90.631,0,0,1,295.725,22.5L263.458,6.623c-7.4-3.642-19.514-3.642-26.916,0L204.275,22.5a90.631,90.631,0,0,1-28.425,7.616L139.967,32.5c-8.232.547-18.722,6.6-23.311,13.459l-20,29.885A90.643,90.643,0,0,1,75.844,96.653l-29.885,20C39.1,121.245,33.047,131.735,32.5,139.967L30.119,175.85A90.631,90.631,0,0,1,22.5,204.275L6.623,236.542c-3.642,7.4-3.642,19.514,0,26.916L22.5,295.725a90.631,90.631,0,0,1,7.616,28.425L32.5,360.033c.546,8.232,6.6,18.722,13.458,23.311l29.885,20a90.643,90.643,0,0,1,20.809,20.809l20,29.885c4.589,6.856,15.079,12.912,23.311,13.459l35.883,2.381a90.631,90.631,0,0,1,28.425,7.616l32.267,15.88c7.4,3.642,19.514,3.642,26.916,0l32.267-15.88a90.631,90.631,0,0,1,28.425-7.616l35.883-2.381c8.232-.547,18.722-6.6,23.311-13.459l20-29.885a90.643,90.643,0,0,1,20.809-20.809l29.885-20c6.856-4.589,12.912-15.079,13.458-23.311Z">
                </path>
            </svg>
            <div class="hand hour" :style="{ transform: `rotate(${hourDeg}deg)` }" />
            <div class="hand minute" :style="{ transform: `rotate(${minuteDeg}deg)` }" />
            <div class="hand second" :style="{ transform: `rotate(${secondDeg}deg)` }" />
        </div>
        <div class="clock-linear"></div>
        <div class="clock-text">
            <div class="date">
                <span class="date-text">{{ currentDate }}</span>
                <span class="abbr">{{ currentDay }}</span>
            </div>
            <div class="time">
                <transition-group name="digit" tag="span" class="hour-text">
                    <span v-for="item in [currentTime.split(':')[0]]" :key="'hour-' + item">{{ item }}</span>
                </transition-group>
                    <span class="literal">:</span>
                <transition-group name="digit" tag="span" class="minute-text">
                    <span v-for="item in [currentTime.split(':')[1]]" :key="'minute-' + item">{{ item }}</span>
                </transition-group>
                    <span class="literal">:</span>
                <transition-group name="digit" tag="span" class="second-text">
                    <span v-for="item in [currentTime.split(':')[2]]" :key="'second-' + item">{{ item }}</span>
                </transition-group>
            </div>
            <div class="timezone">
                <span class="diff">{{ timezoneDiff }}</span>
                <span class="offset">{{ utcOffset }}<span class="abbr">{{ timezoneAbbr }}</span></span>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { DateTime } from "luxon"

// 用户可配置时区常量（为空则使用系统时区）
const CONFIG_TIMEZONE = "" // e.g., "Europe/London"

const currentDate = ref('')
const currentTime = ref('')
const currentDay = ref('')
const utcOffset = ref('')
const timezoneAbbr = ref('')
const timezoneDiff = ref('')

const hourDeg = ref(0)
const minuteDeg = ref(0)
const secondDeg = ref(0)

let timer: number

const getTimePeriod = (hour: number): string => {
    if (hour < 6 || hour >= 22) return "Nocturne";
    if (hour < 9) return "Morning";
    if (hour < 12) return "Forenoon";
    if (hour < 14) return "Meridian";
    if (hour < 16) return "Afternoon";
    if (hour < 19) return "Eventide";
    return "Night";
};

const updateTime = () => {
    if (document.visibilityState !== 'visible') {
        return;
    }
    const tzAbbrMap = {
        "Europe/London": { standard: "GMT", daylight: "BST" },
        "America/New_York": { standard: "EST", daylight: "EDT" },
        "America/Chicago": { standard: "CST", daylight: "CDT" },
        "America/Denver": { standard: "MST", daylight: "MDT" },
        "America/Los_Angeles": { standard: "PST", daylight: "PDT" },
        "Europe/Berlin": { standard: "CET", daylight: "CEST" },
        "Europe/Paris": { standard: "CET", daylight: "CEST" },
        "Australia/Sydney": { standard: "AEST", daylight: "AEDT" },
        "Asia/Tokyo": { standard: "JST", daylight: "JST" },
        "Asia/Shanghai": { standard: "CST", daylight: "CST" },
    } as const;

    type ZoneKey = keyof typeof tzAbbrMap;

    const getTzAbbr = (zone: string, isDST: boolean) => {
        const mapping = tzAbbrMap[zone as ZoneKey];
        if (!mapping) return isDST ? "DST" : "STD";
        return isDST ? mapping.daylight : mapping.standard;
    };

    const zone = CONFIG_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dt = DateTime.now().setZone(zone);
    const isDST = dt.isInDST;

    currentTime.value = dt.toFormat("HH:mm:ss");
    currentDate.value = dt.toFormat("yyyy/MM/dd");
    currentDay.value = dt.toFormat("ccc").toUpperCase();
    utcOffset.value = `UTC ${dt.toFormat("ZZ")}`;
    timezoneAbbr.value = getTzAbbr(zone, isDST);
    timezoneDiff.value = getTimePeriod(dt.hour) + ' / ';  // 👈 设置高级时间段词汇
    // 精确到秒的角度计算（累计秒数，不归零，每秒更新）
    const totalSeconds = Math.trunc(dt.diff(dt.startOf("day"), "seconds").seconds);

    secondDeg.value = totalSeconds * 6;
    minuteDeg.value = (totalSeconds / 60) * 6;
    hourDeg.value = (totalSeconds / 3600) * 30;
};

onMounted(() => {
    updateTime()
    timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
    clearInterval(timer)
})
</script>

<style lang="scss">
.clock-widget {
    padding: 20px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;

    @media (max-width: 880px) {
        gap: 10px;
    }

    .clock-face {
        aspect-ratio: 1/1;
        height: 100%;
        position: relative;

        >* {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
        }

        .clock-bg {
            fill: color-mix(in srgb, color-mix(in srgb, var(--lyntrix-color-high, #FFF), #FFF 20%), #000 15%);
            transition: fill 0.5s;
        }

        .hand {
            width: 100%;
            height: 100%;

            &.hour {
                --w: 8%;
                --h: 25%;
                --color: color-mix(in srgb, var(--lyntrix-color, #000), #000 30%);
            }

            &.minute {
                --w: 8%;
                --h: 34%;
                --color: color-mix(in srgb, var(--lyntrix-color-high, #000), #000 50%);
            }

            &.second {
                transition: transform 0.3s ease;
                --color: color-mix(in srgb, var(--lyntrix-color, #000), #000 40%);
                filter: saturate(0.6) brightness(1.1);
            }

            &:before {
                content: "";
                display: block;
                position: absolute;
                border-radius: 50px;
                background-color: var(--color);
                transition: 0.5s;
            }

            &.hour:before,
            &.minute:before {
                width: var(--w);
                height: calc(var(--h) + 4%);
                left: calc(50% - var(--w) / 2);
                bottom: 46%;
            }

            &.second:before {
                width: 9.5%;
                height: 9.5%;
                top: 6.5%;
                left: 45.25%;
            }
        }
    }

    .clock-linear {
        width: 8px;
        height: 85%;
        border-radius: 4px;
        background-color: #000;
        opacity: 0.2;

        @media (max-width: 880px) {
            display: none;
        }
    }

    .clock-text {
        .date {
            font-size: 1.2em;
            opacity: 0.8;

            .date-text {
                font-weight: 700;
            }
        }

        .time {
            font-size: 2.5em;
            min-width: 7ch;
            font-weight: 700;
            margin: 0.1em 0;
            font-family: 'Arial Rounded MT Bold';

            .literal {
                margin: 0 1px;
                position: relative;
                top: -2.5px;
            }

            .minute-text~* ,.minute-text~* ,.hour-text~* {
                display: inline-flex;
                flex-direction: column;
                max-height: 1em;
            }

            .minute-text~* {
                opacity: 0.6;
            }

            .digit-enter-active {
                transition: transform 0.6s ease, opacity 0.6s ease, filter 0.6s ease;
            }

            .digit-leave-active {
                transition: transform 0.6s cubic-bezier(0.4, 0, 1, 1), opacity 0.6s cubic-bezier(0.4, 0, 1, 1), filter 0.6s cubic-bezier(0.4, 0, 1, 1);
            }

            .digit-enter-from {
                transform: translateY(-150%);
                opacity: 0;
                filter: blur(15px);
            }

            .digit-enter-to {
                transform: translateY(-100%);
                opacity: 1;
                filter: blur(0px)
            }

            .digit-leave-from {
                transform: translateY(0);
                opacity: 1;
                filter: blur(0px)
            }

            .digit-leave-to {
                transform: translateY(50%);
                opacity: 0;
                filter: blur(15px);
            }
        }

        .timezone {
            font-size: 0.95em;

            .diff {
                opacity: 0.8;
            }

            .offset {
                opacity: 0.6;
                white-space: nowrap;
            }
        }

        .abbr {
            margin-left: 5px;
        }
    }
}

html.dark-mode {
    .clock-widget {
        .clock-face {
            .clock-bg {
                fill: #a3e9ff11;
                stroke: #9ed4ffee;
                stroke-width: 6px;
            }

            .hand.hour {
                --color: #3b81bf;
            }

            .hand.minute {
                --color: #5ca3e9;
            }

            .hand.second {
                --color: #73c7f6;
            }
        }

        .clock-linear {
            background-color: #68c9ff;
            opacity: 0.4;
        }
    }
}
</style>