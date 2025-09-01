
export function mapArrayLike<T, Out>( arr: ArrayLike<T>, fn: ( elem: T, idx: number, thisArr: ArrayLike<T> ) => Out ): Out[]
{
    const len = arr.length;
    const result = new Array<Out>( len );

    for( let i = 0; i < len; i++ )
    {
        result[i] = fn( arr[i], i, arr );
    }

    return result;
}