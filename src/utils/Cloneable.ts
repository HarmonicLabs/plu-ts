
export interface Cloneable<T>
{
    clone: () => T
}

export function isCloneable<T>( something: T ): something is T & { clone: () => T }
{
    return (
        typeof ( (something as any)["clone"] ) === "function" &&
        (something as any)["clone"].length === 0
    )
}