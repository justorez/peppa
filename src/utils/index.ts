export function checkSentence(input: string, answer: string) {
    input = input.replace(/[.,?]/g, ' ').split(/\s+/).join('')
    answer = answer.replace(/[.,?]/g, ' ').split(/\s+/).join('')
    return input.toLowerCase() === answer.toLowerCase()
}
