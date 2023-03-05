
const defaultInitialSize = 8;
const defaultIncrementSize = 8;

export class Queque<T>
{
    enqueue!: ( elem: T ) => void
    dequeue!: () => T | undefined
    peek!: () => T | undefined
    isEmpty!: () => boolean
    toArray: () => T[]
    length!: number

    constructor( _initSize?: number, _incrementSize?: number )
    {
        const incrSize =
        typeof _incrementSize === "number" && Number.isSafeInteger( _incrementSize ) ?
            Math.max( defaultIncrementSize >>> 1, Math.round( _incrementSize ) ) :
            defaultIncrementSize;

        let currentSize =
        typeof _initSize === "number" && Number.isSafeInteger( _initSize ) ?
            Math.max( defaultInitialSize >>> 1, Math.round( _initSize ) ) :
            defaultInitialSize;

        let elems: T[] = new Array( currentSize );

        Object.defineProperty(
            this, "elems",
            {
                get: () => elems.slice(),
                set: () => {} 
            }
        )

        let startPtr = -1;
        let endPtr =   -1;
        let len = 0;

        function isEmpty(): boolean {
            return (startPtr < 0 && endPtr < 0) || len === 0
        }
        Object.defineProperty(
            this, "isEmpty",
            {
                value: isEmpty,
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
        
        function toArray(): T[]
        {
            const res = new Array(len);
            if( len > 0 )
            {
                let n = 0;
                for( let i = startPtr; ; i = (i + 1) % elems.length )
                {
                    res[n++] = elems[i];
                    if( i === endPtr ) break;
                }
            }
            return res;
        }
        Object.defineProperty(
            this, "toArray",
            {
                value: toArray,
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        function enqueue( elem: T ): void
        {
            len++;

            // endPtr is pointing to last
            if( endPtr === elems.length - 1 )
            {
                // elems is full
                if( startPtr === 0 )
                {
                    elems = elems.concat( new Array( incrSize ) );
                    endPtr = (endPtr + 1) % elems.length;
                    elems[endPtr] = elem;
                    return;
                }
                else // some space at the start
                {
                    endPtr = 0;
                    elems[0] = elem;
                    return;
                }
            }
            // elems is full (and offset)
            else if( endPtr === startPtr - 1 )
            {
                const prevElemsSize = elems.length;
                const lowerIsBigger = endPtr > (prevElemsSize / 2);

                if( lowerIsBigger )
                {
                    // move upper
                    elems = (new Array( incrSize )).concat( elems );
                    endPtr = endPtr + incrSize;
                    startPtr = startPtr + incrSize;

                    for( let i = elems.length; i >= startPtr; i-- )
                    {
                        elems[i - prevElemsSize] = elems[i];
                    }
                    startPtr = startPtr - prevElemsSize;
                }
                else // lower is smaller
                {
                    // move lower
                    elems = elems.concat( new Array( incrSize ) );

                    for( let i = 0; i <= endPtr; i++ )
                    {
                        elems[i + prevElemsSize] = elems[i];
                    }
                    endPtr = endPtr + prevElemsSize;
                }
            }
            if( startPtr === -1 ) startPtr = 0;

            // base case
            endPtr = (endPtr + 1) % elems.length;
            elems[endPtr] = elem;
            return;
        }
        Object.defineProperty(
            this, "enqueue",
            {
                value: enqueue,
                writable: false,
                enumerable: false,
                configurable: false
            }
        );

        function dequeue(): T
        {
            if( isEmpty() )
            // only case that returns undefined
            // using wrong return type so that ts remembers me to return
            return undefined as any;

            len--;

            if( startPtr === -1 ) startPtr = 0;

            const elem = elems[startPtr];

            if( startPtr === endPtr )
            {
                startPtr = -1;
                endPtr =   -1;
            }
            else
            {
                startPtr = (startPtr + 1) % elems.length
            }

            return elem ;
        }
        Object.defineProperty(
            this, "dequeue",
            {
                value: dequeue,
                writable: false,
                enumerable: false,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "peek",
            {
                get: () => () => elems[startPtr],
                set: () => {},
                enumerable: true,
                configurable: false
            } 
        )

        Object.defineProperty(
            this, "length",
            {
                get: () => len,
                set: () => {},
                enumerable: false,
                configurable: false
            }
        )
    }
}