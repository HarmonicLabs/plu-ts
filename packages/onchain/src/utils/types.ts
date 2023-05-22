export type Head<Types extends any[]> = Types extends [ infer First, ...any[] ] ? First : never;
export type Tail<Types extends any[]> = Types extends [ any, ...infer Lasts extends any[] ] ? Lasts: never;

export type NonEmptyTail<Types extends [ any, ...any[] ]> =
    Types extends [ any, infer Snd ] ? [ Snd ] :
    Types extends [ any, infer Snd,  ...infer Lasts extends any[] ] ? [ Snd, ...Lasts ] : never;


export type Last<Types extends any[]> = Types extends [ ...any[], infer Last ] ? Last : never;
export type Init<Types extends any[]> = Types extends [ ...infer All, any ] ? All: never;

export type VoidIfEmpty< Arr extends Array<any> > = Arr extends [] ? void : Arr;

export type NoInfer<T> = T & {[K in keyof T]: T[K]};

export type DefaultUndefined<A, Def> = A extends undefined ? Def : A;
export type DefaultNever<A, Def> = A extends never ? Def : A;

export type ConcreteInstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;