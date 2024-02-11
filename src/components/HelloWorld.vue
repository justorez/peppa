<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
    <div class="card w-96 bg-base-100 shadow-lg">
        <figure class="relative">
            <img
                src="https://daisyui.com/images/store/saas-landingpage.png"
                alt="vite"
            />
            <div
                class="bg-accent -left-1/5 pointer-events-none absolute bottom-[-50%] aspect-square w-3/4 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            ></div>
            <div
                class="bg-primary pointer-events-none absolute bottom-[-120%] left-1/2 aspect-square w-full -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            ></div>
            <div
                class="bg-base-100 pointer-events-none absolute -top-3/4 right-1/4 z-[3] aspect-square w-1/2 rounded-full opacity-60 blur-3xl"
            ></div>
        </figure>
        <div class="card-body">
            <h2 class="card-title">
                Hello
                <div class="badge badge-primary">{{ msg }}</div>
            </h2>
            <div class="mockup-code">
                <pre
                    data-prefix="1"
                ><code>components/HelloWorld.vue</code></pre>
            </div>
            <p>
                Install
                <a
                    class="link"
                    href="https://github.com/vuejs/language-tools"
                    target="_blank"
                >
                    Volar
                </a>
                in your IDE for a better DX
            </p>
            <div class="card-actions justify-end">
                <button
                    class="btn"
                    @click="count++"
                >
                    count is {{ count }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
