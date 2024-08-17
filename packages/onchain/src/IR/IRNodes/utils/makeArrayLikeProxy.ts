
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

    for( let i = 0; i < arr.length; i++ )
    {
        let elem = initModifyElem( arr[i] );
        Object.defineProperty(
            like, i, {
                get: () => elem,
                set: ( newElem: T ) => {
                    if( isValidElem( newElem ) )
                        elem = modifyElem( newElem, arr[i] );
                    
                    return newElem;
                },
                enumerable: true,
                configurable: false
            }
        );
    }

    return like;
}