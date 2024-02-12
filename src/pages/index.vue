<script setup lang="ts"></script>

<template>
    <div class="vapp entrance">
        <!-- style="flex-basis: calc(16.66% - 0.9rem); min-width: 90px" -->
        <RouterLink
            v-for="i in 52"
            :key="i"
            :to="`/episode?i=${i}`"
            style="min-width: 5.625rem"
        >
            <button class="w-full h-16 btn btn-neutral btn-outline">
                第 {{ String(i).padStart(2, '0') }} 集
            </button>
        </RouterLink>
    </div>
</template>

<style lang="scss" scoped>
.entrance {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.9rem;
}

@media (min-width: 640px) {
    .entrance {
        grid-template-columns: repeat(4, 1fr);
    }
}
</style>
