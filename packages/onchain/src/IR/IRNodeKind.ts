
export enum IRNodeKind {
    Var = 0,
    Func = 1,
    App = 2,
    Const = 3,
    Native = 4,
    Letted = 5,
    Hoisted = 6,
    Error = 7,
    Forced = 8,
    Delayed = 9,
    Constr = 10,
    Case = 11,
    Recursive = 12,
    SelfCall = 13
}
Object.freeze( IRNodeKind );