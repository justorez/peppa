import audioYesUrl from '/audio/yes.mp3'
import audioNoUrl from '/audio/no.mp3'

export function useAudio() {
    const yesAudio = new Audio(audioYesUrl)
    const noAudio = new Audio(audioNoUrl)

    return {
        playYes: () => yesAudio.play(),
        playNo: () => noAudio.play()
    }
}
