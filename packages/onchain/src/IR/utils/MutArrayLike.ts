export interface MutArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}