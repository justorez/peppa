import audioYesUrl from '/audio/yes.mp3'
import audioNoUrl from '/audio/no.mp3'
import { useLocalStorage } from '@vueuse/core'
import { Episode } from '@/types/episode'
import EpisodeData from '@/assets/data.json'

export function useInput() {
    const input = ref('')
    watch(input, () => {
        input.value = input.value.replace(/\n/g, '')
    })
    const noInput = computed(() => !input.value)
    return { input, noInput }
}

export function usePage(ep: number) {
    const episode = ref<Episode>(EpisodeData[ep - 1] as Episode)
    const total = episode.value.sentences.length
    const completedList = useLocalStorage<boolean[]>(
        `completedList-${ep}`,
        new Array(total).fill(false)
    )

    // TODO 开关：跳过已练习的句子
    const skip = useLocalStorage('skip', false)

    // const index = ref(skip.value ? completedList.value.findIndex((x) => !x) : 0)
    const index = ref(completedList.value.findIndex((x) => !x))
    const page = reactive({
        index,
        current: computed({
            get: () => index.value + 1,
            set: (val) => nextPage(val - 1)
        }),
        total
    })

    function nextPage(n?: number) {
        if (typeof n === 'number') {
            n = Math.min(Math.max(0, n), page.total - 1)
            page.index = n
            return
        }

        const cur = page.index

        if (skip.value) {
            for (let i = cur; i < page.total; i++) {
                if (completedList.value[i]) continue
                page.index = i
                return
            }
        }

        const idx = cur + 1
        page.index = idx >= page.total ? page.total - 1 : idx
    }

    const sentence = computed(() => episode.value.sentences[page.index])
    const completed = computed(
        // 已练习的个数
        () => completedList.value.filter((x) => x).length
    )

    return { episode, skip, page, sentence, completed, completedList, nextPage }
}

export function useAudio() {
    const yesAudio = new Audio(audioYesUrl)
    const noAudio = new Audio(audioNoUrl)

    return {
        playYes: () => yesAudio.play(),
        playNo: () => noAudio.play()
    }
}

export function useSpeech() {
    if (window.speechSynthesis) {
        const synth = window.speechSynthesis

        let voices = synth.getVoices().filter((v) => v.lang === 'en-US')
        synth.onvoiceschanged = () => {
            voices = synth.getVoices().filter((v) => v.lang === 'en-US')
        }

        const speak = (text: string) => {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.voice =
                voices.find((v) => v.name.includes('Emma')) || null
            utterance.lang = 'en-US'
            synth.speak(utterance)
        }
        return { supported: true, speak }
    } else {
        return { supported: false, speak: (text: string) => text }
    }
}
