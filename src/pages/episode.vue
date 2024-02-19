<script setup lang="ts">
import { checkSentence } from '@/utils/index'
import { useAudio, usePage, useInput, useSpeech } from '@/hooks/episode'

const route = useRoute()
const router = useRouter()
const back = () => router.back()

const ep = Number(route.query.i)
const { episode, sentence, page, completed, completedList, nextPage } =
    usePage(ep)
const { input, noInput } = useInput()
const { speak, supported: speechSupported } = useSpeech()

const showResult = ref(false)
const result = ref(false)
const audio = useAudio()
function check() {
    if (noInput.value) return
    if (showResult.value && !result.value) return restore()
    if (showResult.value && result.value) return next()

    result.value = checkSentence(input.value, sentence.value.EN)
    showResult.value = true
    if (result.value) {
        completedList.value[page.index] = true
        audio.playYes()
    } else {
        audio.playNo()
    }
}
function restore() {
    showResult.value = false
    result.value = false
}
function next() {
    restore()
    input.value = ''
    nextPage()
}
</script>

<template>
    <div class="vapp">
        <div class="flex items-center gap-2">
            <i-mdi:close
                class="text-xl cursor-pointer"
                @click="back"
            />
            <progress
                class="progress progress-success flex-1 h-4"
                :value="completed"
                :max="page.total"
            ></progress>
            <span>{{ completed }}/{{ episode.sentences.length }}</span>
        </div>
        <div class="mt-5 flex justify-center items-center">
            <!-- <i-mdi:chevron-left class="text-2xl" /> -->
            <div class="px-2 flex-1">
                <h1 class="font-bold text-2xl flex justify-between items-end">
                    第 {{ ep }} 集：{{ episode.titleCN }}
                </h1>
                <div class="mt-5 mb-3 text-lg flex justify-between items-end">
                    <div class="flex items-center gap-2">
                        <button
                            v-if="speechSupported"
                            class="btn btn-circle btn-sm"
                            @click="speak(sentence.EN)"
                        >
                            <i-mdi:volume />
                        </button>
                        <span>“{{ sentence.CN }}”</span>
                    </div>
                    <!-- <label class="label cursor-pointer p-0 items-end">
                        <span class="label-text mr-3">跳过已完成</span>
                        <input
                            v-model="skip"
                            type="checkbox"
                            class="toggle"
                        />
                    </label> -->
                </div>
                <div
                    v-show="showResult"
                    class="mb-3 text-lg flex items-center"
                    :class="{
                        'text-success': result,
                        'text-error': !result
                    }"
                >
                    <span>"{{ sentence.EN }}"</span>
                    &nbsp;
                    <i-mdi:check v-show="result" />
                    <i-mdi:close v-show="!result" />
                </div>
                <textarea
                    v-model="input"
                    class="textarea textarea-bordered w-full text-lg bg-gray-50"
                    placeholder="请输入上述台词的英文"
                    rows="8"
                    @keyup.enter.exact="check"
                ></textarea>
            </div>
            <!-- <i-mdi:chevron-right class="text-2xl" /> -->
        </div>
        <div class="mt-5 flex justify-between items-center">
            <div>
                <input
                    v-model="page.current"
                    type="number"
                    class="input input-bordered input-sm"
                    :min="1"
                    :max="page.total"
                />
                &nbsp;&nbsp;/&nbsp;
                <span>{{ page.total }}</span>
            </div>
            <button
                v-show="!showResult"
                class="btn btn-neutral lg:w-32"
                :disabled="noInput"
                @click="check"
            >
                检查
            </button>
            <div v-show="showResult">
                <button
                    class="btn btn-outline lg:w-32 mr-3"
                    @click="restore"
                >
                    取消
                </button>
                <button
                    class="btn lg:w-32"
                    :class="{
                        'btn-success': result,
                        'btn-error': !result
                    }"
                    @click="next"
                >
                    继续
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@supports not (color: oklch(0% 0% 0deg)) {
    .btn[disabled],
    .btn:disabled {
        --fallback-n: rgba(43, 52, 64, 0.2);
        --fallback-bc: rgba(31, 41, 55, 0.2);
        border-color: transparent;
    }

    .progress {
        --fallback-bc: rgba(31, 41, 55, 0.2);
    }

    .toggle {
        color: rgba(31, 41, 55, 0.5);
    }
    .toggle:checked {
        color: #1f2937;
    }
}
</style>
