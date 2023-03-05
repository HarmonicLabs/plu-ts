
type PromiseState = "fulfilled" | "pending" | "rejected"

type DescriptivePromise<T> = Promise<T> & {
    readonly state: PromiseState
}

/**
 * BEFORE YOU USE THIS CODE
 * 
 * You should know that deferred Promises are considered an anti-pattern
 * 
 * this is because a normal promise is able to handle syncronous exceptions
 * and turn them in rejected Promises automatically
 * 
 * this feature is not applicable if the resolution happens outside the initial Promise callback
 * and might lead to undesired behaviours
 */
export class DeferredPromise<T>
{
    readonly promise!: DescriptivePromise<T>
    resolve!: ( result: T ) => void
    reject!: ( reason?: any ) => void

    constructor()
    {
        let resolve: (( result: T ) => void )| undefined = undefined;
        let reject:  (( result: T ) => void )| undefined = undefined;

        let state = "pending";
        const promise: DescriptivePromise<T> = new Promise( (res, rej) => {

            resolve = ( value: T ) => {
                state = "fulfilled";
                res( value )
            };
            reject = ( reason: any ) => {
                state = "rejected";
                res( reason )
            };
        }) as any;

        Object.defineProperty(
            promise, "state",
            {
                get: () => state,
                set: () => {},
                enumerable: false,
                configurable: false,
            }
        );
        Object.defineProperty(
            this, "promise",
            {
                value: promise,
                writable: false,
                enumerable: false,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "resolve",
            {
                get: () => ( value: T ) => {
                    if( promise.state === "pending" && typeof resolve === "function" ) return resolve( value );
                },
                set: () => {},
                enumerable: false,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "reject",
            {
                get: () => ( reason: any ) => {
                    if( promise.state === "pending" && typeof reject === "function" ) return reject( reason );
                },
                set: () => {},
                enumerable: false,
                configurable: false
            }
        );

    }
}