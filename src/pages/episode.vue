<script setup lang="ts">
import data from '@/assets/data.json'
import audioYesUrl from '/audio/yes.mp3'
import audioNoUrl from '/audio/no.mp3'
import { checkSentence } from '@/utils/index'

const yesAudio = new Audio(audioYesUrl)
const noAudio = new Audio(audioNoUrl)

type Sentence = {
    CN: string
    EN: string
}
type Lines = {
    titleEN: string
    titleCN: string
    sentences: Sentence[]
}

const route = useRoute()
const router = useRouter()
const back = () => router.back()

const epNum = Number(route.query.i)
const episode = ref<Lines>(data[epNum - 1] as Lines)
const total = episode.value.sentences.length
const page = reactive({
    current: 1,
    completed: new Array(total).fill(false),
    total
})
const sentence = computed<Sentence>(
    () => episode.value.sentences[page.current - 1]
)
const completed = computed(() => page.completed.filter((x) => x).length)

const input = ref('')
const checkDisabled = computed(() => !input.value)

const showResult = ref(false)
const result = ref(false)
function check() {
    result.value = checkSentence(input.value, sentence.value.EN)
    showResult.value = true
    if (result.value) {
        page.completed[page.current] = true
        yesAudio.play()
    } else {
        noAudio.play()
    }
}
function restore() {
    showResult.value = false
    result.value = false
}
function next() {
    restore()
    input.value = ''
    const current = page.current + 1
    if (current <= page.total) {
        page.current = current
    }
}
</script>

<template>
    <div class="vapp">
        <div class="flex items-center gap-2">
            <i-mdi:close
                class="text-xl"
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
                <h1 class="font-bold text-2xl">
                    第 {{ epNum }} 集：{{ episode.titleCN }}
                </h1>
                <div class="mt-5 mb-3 text-lg">“{{ sentence.CN }}”</div>
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
                ></textarea>
            </div>
            <!-- <i-mdi:chevron-right class="text-2xl" /> -->
        </div>
        <div class="mt-5 px-2 flex justify-between items-center">
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
                class="m-btn btn-neutral"
                :disabled="checkDisabled"
                @click="check"
            >
                检查
            </button>
            <div v-show="showResult">
                <button
                    class="m-btn btn-outline mr-3"
                    @click="restore"
                >
                    取消
                </button>
                <button
                    class="m-btn"
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
        <!-- <div class="btn-bar">
            <button class="btn btn-outline">跳过</button>
            <button
                class="btn btn-neutral"
                :disabled="checkDisabled"
                @click="check"
            >
                检查
            </button>
        </div> -->
    </div>
</template>

<style lang="scss" scoped>
.m-btn {
    @apply btn lg:w-32;
}

.btn-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 2.5rem;
    padding-bottom: 3.5rem;
    border-top: 2px solid rgb(229, 229, 229);
    background-color: white;
    display: grid;
    grid-gap: 8px 16px;
    align-items: center;
    grid-auto-rows: 1fr;
    grid-template-columns: 100%;
    justify-items: stretch;

    > button {
        width: 100%;
    }
}

@media (min-width: 700px) {
    .btn-bar {
        align-items: center;
        grid-auto-rows: auto;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: 100%;
        justify-content: space-between;

        button:first-child {
            justify-self: start;
        }
        button:last-child {
            grid-column: 5 / auto;
            justify-self: end;
        }
    }
}
</style>
