<template>
    <div class="banner">
        <div class="avatar">
            <img draggable="false" src="@/public/images/avatar.jpg" alt="头像" />
        </div>
        <div class="info">
            <div class="name">
                <svg class="name-svg" viewBox="0 0 300 61" xmlns="http://www.w3.org/2000/svg"
                    style="mask-image: url(data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMjAgMjAgNTE4IDEwNSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+CglAa2V5ZnJhbWVzIGRhc2h7MCV7c3Ryb2tlLWRhc2hvZmZzZXQ6IGNhbGModmFyKC0tbGVuKSArIDFweCk7fTEwMCV7c3Ryb2tlLWRhc2hvZmZzZXQ6IDA7fX1Aa2V5ZnJhbWVzIHN0cm9rZS13aWR0aHswJXtzdHJva2Utd2lkdGg6IDNweDt9MTAwJXtzdHJva2Utd2lkdGg6IDE0cHg7fX1Aa2V5ZnJhbWVzIGZhZGV7MCV7b3BhY2l0eTogMDt9MTAwJXtvcGFjaXR5OiAxO319QGtleWZyYW1lcyBkb3R7MCV7cjogMHB4O30xMDAle3I6IHZhcigtLXIpO319LnN0cm9rZXtmaWxsOiBub25lO3N0cm9rZTogIzY2YmNmZTtzdHJva2UtbGluZWNhcDogcm91bmQ7c3Ryb2tlLWxpbmVqb2luOiByb3VuZDtzdHJva2Utd2lkdGg6IDNweDtzdHJva2UtZGFzaGFycmF5OiBjYWxjKHZhcigtLWxlbikgKyAxcHgpO3N0cm9rZS1kYXNob2Zmc2V0OiBjYWxjKHZhcigtLWxlbikgKyAxcHgpO2FuaW1hdGlvbjogZGFzaCAxcyBjdWJpYy1iZXppZXIoMC44LCAwLCAwLjIsIDEpIHZhcigtLWRlbGF5KSBmb3J3YXJkcywgc3Ryb2tlLXdpZHRoIDFzIGN1YmljLWJlemllcigwLjgsIDAsIDAuMiwgMSkgY2FsYyh2YXIoLS1kZWxheSkgKyAwLjVzKSBmb3J3YXJkcywgZmFkZSAwLjJzIGxpbmVhciBjYWxjKHZhcigtLWRlbGF5KSArIDBzKSBmb3J3YXJkczt9LmRvdHtmaWxsOiAjNjZiY2ZlO3I6IDA7YW5pbWF0aW9uOiBkb3QgMXMgY3ViaWMtYmV6aWVyKDAuOCwgMCwgMC4yLCAxKSB2YXIoLS1kZWxheSkgZm9yd2FyZHM7fQo8L3N0eWxlPgo8ZyBpZD0idGV4dCI+Cgk8cGF0aCBjbGFzcz0ic3Ryb2tlIiBzdHlsZT0iLS1sZW46IDE4N3B4OyAtLWRlbGF5OiAwLjVzOyIgZD0iTTI4LjksMTEzLjljMCwwLDMwLjQtNzcuNCwzMS43LTgwLjZjMS4yLTMuMiw2LjQtNCw4LjIsMGMyLjUsNC44LDMyLjcsODAuNiwzMi43LDgwLjYiLz4KCTxsaW5lIGNsYXNzPSJzdHJva2UiIHN0eWxlPSItLWxlbjogNTJweDsgLS1kZWxheTogMC42czsiIHgxPSI0MC4yIiB5MT0iOTAiIHgyPSI5MC44IiB5Mj0iOTAiLz4KCTxwYXRoIGNsYXNzPSJzdHJva2UiIHN0eWxlPSItLWxlbjogODJweDsgLS1kZWxheTogMC44czsiIGQ9Ik0xMzcuMSwxMTMuOVY3NC4xYzAsMCwwLTE1LDE1LTE1bDE5LDAiLz4KCTxsaW5lIGNsYXNzPSJzdHJva2UiIHN0eWxlPSItLWxlbjogNTdweDsgLS1kZWxheTogMXM7IiB4MT0iMjA4LjkiIHkxPSIxMTMuOSIgeDI9IjIwOC45IiB5Mj0iNTkuMSIvPgoJPGNpcmNsZSBjbGFzcz0iZG90IiBzdHlsZT0iLS1yOiA4LjVweDsgLS1kZWxheTogMS41czsiIGN4PSIyMDguOSIgY3k9IjMwLjkiIHI9IjcuNCIvPgoJPHBhdGggY2xhc3M9InN0cm9rZSIgc3R5bGU9Ii0tbGVuOiAxNzVweDsgLS1kZWxheTogMS4yczsiIGQ9Ik0yOTcuMSw1OS4xaC0zMy42Yy0xMi45LDAtMTMuNCwxMC41LTEzLjQsMTMuNGMwLDMuOSwwLDEzLjksMTUuMywxMy45aDE2LjVjMTUuMiwwLDE1LjIsMTEuMiwxNS4yLDE0LjJjMCwyLjQsMCwxMy4zLTEzLjUsMTMuM2gtMzMuNSIvPgoJPHBhdGggY2xhc3M9InN0cm9rZSIgc3R5bGU9Ii0tbGVuOiAxMDVweDsgLS1kZWxheTogMS40czsiIGQ9Ik0zMzcuNywzMC42YzAsMjIuMiwwLDQyLDAsNTUuOWMwLDE1LjgsMTAuNiwyNy40LDI1LjgsMjcuNGw3LjMsMCIvPgoJPGxpbmUgY2xhc3M9InN0cm9rZSIgc3R5bGU9Ii0tbGVuOiAxMnB4OyAtLWRlbGF5OiAxLjZzOyIgeDE9IjM1OC4yIiB5MT0iNTMuNiIgeDI9IjM3MC45IiB5Mj0iNTMuNiIvPgoJPHBhdGggY2xhc3M9InN0cm9rZSIgc3R5bGU9Ii0tbGVuOiA4MnB4OyAtLWRlbGF5OiAxLjhzOyIgZD0iTTQwNy41LDExMy45di00MGMwLDAsMC0xNC44LDE1LTE0LjhoMTkiLz4KCTxwYXRoIGNsYXNzPSJzdHJva2UiIHN0eWxlPSItLWxlbjogMTY0cHg7IC0tZGVsYXk6IDJzOyIgZD0iTTUwMC41LDExMy45aC03LjljLTEwLDAtMTYuOC03LjYtMTYuOC0xNi4yVjc0LjhjMC05LjgsNi43LTE1LjcsMTUuOC0xNS43aDExLjdjOSwwLDE1LjQsNS44LDE1LjYsMTQuN2wwLDI4LjZjLTAuMSwxMS41LDkuMywxMS41LDkuMywxMS41Ii8+CjwvZz4KPC9zdmc+);"></svg>
                <h1 class="name-text-overlay">Aristra</h1>
            </div>
            <div class="bio">
                <FlipWords :duration="2000" :words="'星々の軌跡、未知の旅路を刻め！'" />
            </div>
        </div>
    </div>
</template>

<style>
.banner {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 3.2rem;
    text-align: left;
    margin-top: 45vh;
    transform: translateY(-50%);
}

@media (max-width: 1300px) {
    .banner {
        max-width: 950px;
        margin-left: auto;
        margin-right: auto;
    }
}

@media (max-width: 880px) {
    .banner {
        flex-direction: column;
        gap: 3.2rem;
        align-items: flex-start;
        max-width: 480px;
        margin-left: auto;
        margin-right: auto;
    }
}

.avatar img {
    width: clamp(120px, 26vmin, 200px);
    height: clamp(120px, 26vmin, 200px);
    border-radius: 50%;
    opacity: 1;
    object-fit: cover;
    pointer-events: none;
    user-select: none;
    animation-name: InitAvatar;
    animation-duration: 1s;
    animation-timing-function: ease;
    animation-delay: .3s;
    animation-fill-mode: both;
}

.info {
    width: 100%;
    gap: 1.2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.name {
    width: min(360px, 100%);
    max-width: 100%;
    position: relative;
}

html.dark-mode .name {
    filter: drop-shadow(0px 0px 10px #78b0ff89) drop-shadow(0px 0px 24px #78b0ff3a);
}

.name-svg {
    background-color: color-mix(in srgb, var(--lyntrix-theme-color, #fff) clamp(25%, 350% * var(--scroll-y-percent, 0) + 25%, 95%), transparent);
    backdrop-filter: saturate(2) brightness(2.5) blur(12px);
    transition: .5s;
}

html.dark-mode .name-svg {
    background-color: #64beff;
    backdrop-filter: none;
}

.wrapper.lightbg .name-svg {
    backdrop-filter: saturate(2.5) brightness(.5) blur(12px);
}

.name-text-overlay {
    position: absolute;
    font-size: 25px;
    top: 0;
    pointer-events: none;
    z-index: -1;
    filter: opacity(0);
}

.bio {
    user-select: none;
    opacity: clamp(.7, .75 * var(--scroll-y-percent, 0) + .7, .85);
    color: color-mix(in srgb, var(--lyntrix-theme-color, #fff), #fff clamp(10%, -275% * var(--scroll-y-percent, 0) + 65%, 65%));
    font-size: clamp(18px, 3.5vmin, 1.6rem);
    mask-image: linear-gradient(to right, rgb(0, 0, 0) 45.4545%, rgba(0, 0, 0, 0) 54.5455%);
    mask-size: 220% 100%;
    mask-repeat: no-repeat;
    transition: 1s;
}

.wrapper.lightbg .bio {
    filter: brightness(clamp(.4, 3 * var(--scroll-y-percent, 0) + .4, 1));
}

html.dark-mode .bio {
    color: #64beff;
    opacity: 0.8;
    filter: drop-shadow(#64beff 0px 0px 2px) !important;
}

@keyframes InitAvatar {
    0% {
        transform: scale(0.8);
        filter: blur(10px);
        opacity: 0;
    }

    100% {
        transform: none;
        filter: none;
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .banner {
        gap: 2rem;
        flex-direction: column;
        align-items: flex-start;
    }

    .banner .name {
        width: clamp(240px, 60%, 360px);
    }
}
</style>