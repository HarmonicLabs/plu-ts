
export function isNonEmpty<T>(arr: T[]): arr is [T, ...T[]]
{
    return arr.length >= 1;
}