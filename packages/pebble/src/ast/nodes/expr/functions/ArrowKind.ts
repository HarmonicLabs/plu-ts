/** Indicates the kind of an array function. */
export enum ArrowKind {
    /** Not an arrow function. */
    None,
    /** Parenthesized parameter list. */
    Parenthesized,
    /** Single parameter without parenthesis. */
    Single
}
Object.freeze(ArrowKind);