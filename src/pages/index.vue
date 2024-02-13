<script setup lang="ts">
function getProgress(i: number) {
    const str = localStorage.getItem(`completedList-${i}`)
    if (str) {
        const completedList = JSON.parse(str) as boolean[]
        const progress =
            (completedList.filter((x) => x).length / completedList.length) * 100
        return `${progress}%`
    } else {
        return 0
    }
}
</script>

<template>
    <div class="vapp entrance-list">
        <!-- style="flex-basis: calc(16.66% - 0.9rem); min-width: 90px" -->
        <RouterLink
            v-for="i in 52"
            :key="i"
            :to="`/episode?i=${i}`"
            style="min-width: 5.625rem"
        >
            <button class="w-full h-16 btn btn-neutral btn-outline">
                <span>第 {{ String(i).padStart(2, '0') }} 集</span>
                <span :style="{ width: getProgress(i) }"></span>
            </button>
        </RouterLink>
    </div>
</template>

<style lang="scss" scoped>
.entrance-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.9rem;

    .btn {
        position: relative;
        overflow: hidden;
    }
    .btn span:first-child {
        position: relative;
        z-index: 5;
    }
    .btn span:last-child {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 1;
        background-color: #00a96e;
    }
}

@media (min-width: 640px) {
    .entrance-list {
        grid-template-columns: repeat(4, 1fr);
    }
}
</style>
