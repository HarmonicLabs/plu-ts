import { IRHash } from "../IRHash"

export interface IHash {
    readonly hash: IRHash // supposed to be a getter only
    markHashAsInvalid: () => void // something changed
    isHashPresent: () => boolean
}