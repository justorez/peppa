export type Sentence = {
    CN: string
    EN: string
}

export type Episode = {
    titleEN: string
    titleCN: string
    sentences: Sentence[]
}
