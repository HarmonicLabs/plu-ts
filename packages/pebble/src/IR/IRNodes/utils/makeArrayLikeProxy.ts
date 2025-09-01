
export function makeArrayLikeProxy<T>(
    arr: ArrayLike<T>,
    isValidElem: ( elem: T ) => boolean,
    initModifyElem: ( elem: T ) => T,
    modifyElem: ( elem: T, oldElem: T ) => T
): ArrayLike<T>
{
    const like = {} as ArrayLike<T>;

    Object.defineProperty(
        like, "length", {
            value: arr.length,
            writable: false,
            enumerable: false,
            configurable: false
        }
    );

    const clonedArr = Array.from( arr );

    for( let i = 0; i < arr.length; i++ )
    {
        clonedArr[i] = initModifyElem( arr[i] );
        Object.defineProperty(
            like, i, {
                get: () => clonedArr[i],
                set: ( newElem: T ) => {
                    if( isValidElem( newElem ) )
                        clonedArr[i] = modifyElem( newElem, clonedArr[i] );
                    
                    return newElem;
                },
                enumerable: true,
                configurable: false
            }
        );
    }

    Object.defineProperty(
        like, Symbol.iterator, {
            value: iterArrayLikeProxy.bind( like ),
            writable: false,
            enumerable: false,
            configurable: false
        }
    );

    return like;
}

function* iterArrayLikeProxy<T>( this: ArrayLike<T> )
{
    for( let i = 0; i < this.length; i++ ) yield this[i];
}
