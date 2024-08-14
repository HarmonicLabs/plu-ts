
export interface IHash {
    readonly hash: number // supposed to be a getter only
    markHashAsInvalid: () => void // something changed
    isHashPresent: () => boolean
}