<script setup lang="ts">
const routes = useRouter().getRoutes()

const entrances = routes
    .filter((r) => r.path !== '/')
    .map((r) => ({
        text: r.meta?.title,
        url: r.path
    }))
</script>

<template>
    <div class="flex justify-center gap-5">
        <RouterLink
            v-for="entry in entrances"
            :key="entry.url"
            :to="entry.url"
            role="button"
            class="btn btn-outline"
        >
            {{ entry.text }}
        </RouterLink>
    </div>
</template>

<style lang="scss" scoped></style>
