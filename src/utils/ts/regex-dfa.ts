type Head<StrT extends string> = StrT extends `${infer HeadT}${string}` ? HeadT : never;

type Tail<StrT extends string> = StrT extends `${string}${infer TailT}` ? TailT : never;

export interface Dfa {
    startState : string,
    acceptStates : string,
    transitions : Record<string, Record<string, string>>,
}

type AcceptsImpl<
    DfaT extends Dfa,
    StateT extends string,
    InputT extends string
> =
    InputT extends "" ?
    (StateT extends DfaT["acceptStates"] ? true : false) :
    AcceptsImpl<
        DfaT,
        DfaT["transitions"][StateT][Head<InputT>],
        Tail<InputT>
    >;

export type Accepts<DfaT extends Dfa, InputT extends string> = AcceptsImpl<DfaT, DfaT["startState"], InputT>;