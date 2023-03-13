
export interface IHash {
    readonly hash: Uint8Array // supposed to be a getter only
    markHashAsInvalid: () => void // something changed
}