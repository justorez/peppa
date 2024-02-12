<script setup lang="ts">
import data from '@/assets/data.json'
import audioYesUrl from '/audio/yes.mp3'
import audioNoUrl from '/audio/no.mp3'
import { checkSentence } from '@/utils/index'
import { useLocalStorage } from '@vueuse/core'

type Sentence = {
    CN: string
    EN: string
}
type Lines = {
    titleEN: string
    titleCN: string
    sentences: Sentence[]
}

const yesAudio = new Audio(audioYesUrl)
const noAudio = new Audio(audioNoUrl)

const route = useRoute()
const router = useRouter()
const back = () => router.back()

const epNum = Number(route.query.i)
const episode = ref<Lines>(data[epNum - 1] as Lines)
const total = episode.value.sentences.length
const completedList = useLocalStorage<boolean[]>(
    `completedList-${epNum}`,
    new Array(total).fill(false)
)
const page = reactive({
    // 当前页码：找到第一个未练习的句子
    current: completedList.value.findIndex((x) => !x) + 1,
    total
})
const currentIndex = computed(() => page.current - 1)
const sentence = computed(() => episode.value.sentences[currentIndex.value])
// 已练习的个数
const completed = computed(() => completedList.value.filter((x) => x).length)

const input = ref('')
watch(input, () => {
    input.value = input.value.replace(/\n/g, '')
})
const checkDisabled = computed(() => !input.value)

const showResult = ref(false)
const result = ref(false)
function check() {
    if (checkDisabled.value) return
    if (showResult.value && !result.value) {
        restore()
        return
    }

    result.value = checkSentence(input.value, sentence.value.EN)
    showResult.value = true
    if (result.value) {
        completedList.value[currentIndex.value] = true
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
    for (let i = page.current; i < page.total; i++) {
        if (completedList.value[i]) continue
        page.current = i + 1
        break
    }
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
                :disabled="checkDisabled"
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
