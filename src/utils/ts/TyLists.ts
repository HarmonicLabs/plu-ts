
export type Head<Types extends any[]> = Types extends [ infer First, ...any[] ] ? First : never;
export type Tail<Types extends any[]> = Types extends [ any, ...infer Lasts extends any[] ] ? Lasts: never;

export type NonEmptyTail<Types extends [ any, ...any[] ]> =
    Types extends [ any, infer Snd ] ? [ Snd ] :
    Types extends [ any, infer Snd,  ...infer Lasts extends any[] ] ? [ Snd, ...Lasts ] : never;


export type Last<Types extends any[]> = Types extends [ ...any[], infer Last ] ? Last : never;
export type Init<Types extends any[]> = Types extends [ ...infer All, any ] ? All: never;

export type VoidIfEmpty< Arr extends Array<any> > = Arr extends [] ? void : Arr;