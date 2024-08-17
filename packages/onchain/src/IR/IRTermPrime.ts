export enum IRTermPrime {
    Var = 3,
    Func = 5,
    App = 7,
    Const = 11,
    Native = 13,
    Letted = 17,
    Hoisted = 19,
    Error = 23,
    Forced = 29,
    Delayed = 31,
    Constr = 37,
    Case = 41
}

Object.freeze( IRTermPrime );