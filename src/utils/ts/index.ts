export * from "./TyLists";
export * from "./TyFn";

export type NoInfer<T> = T & {[K in keyof T]: T[K]};
