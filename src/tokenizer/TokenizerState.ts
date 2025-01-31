import { Token } from "./Token";

/** Tokenizer state as returned by {@link Tokenizer#mark} and consumed by {@link Tokenizer#reset}. */
export class TokenizerState {
    constructor(
        /** Current position. */
        public pos: number,
        /** Current token. */
        public token: Token,
        /** Current token's position. */
        public tokenPos: number
    ) { }
}