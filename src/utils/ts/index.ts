export * from "./TyLists";
export * from "./TyFn";

export type NoInfer<T> = T & {[K in keyof T]: T[K]};

export type DefaultUndefined<A, Def> = A extends undefined ? Def : A;
export type DefaultNever<A, Def> = A extends never ? Def : A;