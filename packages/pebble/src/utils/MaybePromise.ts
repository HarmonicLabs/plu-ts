
export type MaybePromise<T> = T | Promise<T>;

export function definitelyPromise<T>(value: MaybePromise<T>): Promise<T> {
    return value instanceof Promise ? value : Promise.resolve(value);
};