export interface MutArrayLike<T> {
    readonly length: number;
    [n: number]: T;
    [Symbol.iterator](): IterableIterator<T>;
}