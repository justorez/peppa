import audioYesUrl from '/audio/yes.mp3'
import audioNoUrl from '/audio/no.mp3'
import EpisodeData from '@/assets/data.json'

export function usePage(ep: Ref<number>) {
    const epNum = computed(() =>
        Math.min(Math.max(1, ep.value), EpisodeData.length)
    )
    const episode = computed(() => EpisodeData[epNum.value - 1])
    const total = computed(() => episode.value.sentences.length)

    // progress
    // reactive path: ep -> progresslist -> localStorage
    // the above feature cannot be implemented with @vueuse,
    // so I made a reactive storage by myself
    const progressKey = computed(() => `completedList-${epNum.value}`)
    const loadProgress = (): number[] => {
        const dataStr = localStorage.getItem(progressKey.value)
        let data = !dataStr
            ? new Array(total.value).fill(0)
            : JSON.parse(dataStr)
        data = data.map((d: number | boolean) => Number(d))
        if (/true|false/.test(dataStr || '')) {
            localStorage.setItem(progressKey.value, JSON.stringify(data))
        }
        return data
    }
    const progressList = ref(loadProgress())
    watch(ep, () => {
        progressList.value = loadProgress()
    })
    watch(
        progressList,
        (val) => {
            localStorage.setItem(progressKey.value, JSON.stringify(val))
        },
        { deep: true }
    )

    // start index
    const getStartIndex = () => {
        const index = progressList.value.findIndex((x) => !x)
        return index !== -1 ? index : total.value - 1
    }
    const index = ref(getStartIndex())
    watch(progressList, () => {
        index.value = getStartIndex()
    })

    const current = computed({
        get: () => index.value + 1,
        set: (val) => nextPage(val - 1)
    })
    const page = reactive({
        index, // min value 0
        current, // min value 1
        total,
        completed: computed(() => progressList.value.filter((x) => x).length),
        isLast: computed(() => current.value === total.value)
    })

    function nextPage(n?: number) {
        n = typeof n === 'number' ? Math.max(0, n) : page.index + 1
        page.index = Math.min(n, page.total - 1)
    }

    /**
     * mark current sentence as complete or not
     */
    function markPage(status: boolean | number) {
        progressList.value[page.index] = Number(status)
    }

    const sentence = computed(() => episode.value.sentences[page.index])

    return {
        epNum,
        title: episode.value.titleCN,
        page,
        sentence,
        nextPage,
        markPage
    }
}

export function useInput() {
    const input = ref('')
    watch(input, () => {
        input.value = input.value.replace(/\n/g, '')
    })
    const noInput = computed(() => !input.value)
    return { input, noInput }
}

export function useCheck() {
    function eq(value: string, other: string) {
        value = value
            .replace(/[.,?!]/g, ' ')
            .split(/\s+/)
            .join('')
        other = other
            .replace(/[.,?!]/g, ' ')
            .split(/\s+/)
            .join('')
        return value.toLowerCase() === other.toLowerCase()
    }

    const yesAudio = new Audio(audioYesUrl)
    const noAudio = new Audio(audioNoUrl)
    function check(input: string, answer: string, tone = true) {
        const result = eq(input, answer)
        if (tone && result) {
            yesAudio.play()
        } else if (tone && !result) {
            noAudio.play()
        }
        return result
    }

    return {
        eq,
        check
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
        return { isSupported: true, speak }
    } else {
        return { isSupported: false, speak: (text: string) => text }
    }
}
