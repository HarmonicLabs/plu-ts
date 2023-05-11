import { Head, Tail } from "./types";

export type CurriedFn< Args extends any[], Output > =
    Args extends [] ? () => Output:
    Args extends [ infer Arg ] ? ( arg: Arg ) => Output :
    Args extends [ infer Arg1, infer Arg2, ...infer RestArgs ] ? ( arg: Arg1 ) => CurriedFn<[ Arg2, ...RestArgs ], Output> :
    Args extends [ ...infer Tys ] ? ( ...args: Tys ) => Output : //only case is all parameters are lastCallRest; meaning fn.length will be 0;
    never;

/**
 * parametrized functions will have TypeParameters automatically substituted with ```any```
 * 
 * > example:
 * > ```ts
 * > function ifThenElse<T>( cond: boolean, a: T, b: T ): T
 * > {
 * >      return cond ? a : b;
 * > }
 * > 
 * > const cuffiedIf = curry( ifThenElse );
 * > // type:
 * > // ( arg: boolean ) => ( arg: any ) => ( arg: any ) => any
 * > ```
 * 
 * a workaround is to define a wrapper function ( ofthe translating to identity at runtime )
 * with the fixed types:
 * > ```ts
 * > const ifNum = ( cond: boolean, a: number, b: number ) => ifThenElse( cond, a, b );
 * > 
 * > const cuffiedIfNum = curry( ifNum );
 * > // type:
 * > // ( arg: boolean ) => ( arg: number ) => ( arg: number ) => number
 * > ```
 * 
 * but at this point it would be probably faster and easier to directly vrite the curried version:
 * > ```ts
 * > const curriedIfNumFaster = ( cond: boolean ) => ( a: number ) => ( b: number ) => ifThenElse( cond, a, b );
 * > // type:
 * > // ( arg: boolean ) => ( arg: number ) => ( arg: number ) => number
 * > ```
 * 
*/
export function curry<Args extends any[], Output,>
    ( fn: (...args: Args ) => Output ): CurriedFn<Args, Output>
{
    if( fn.length === 0 ) return ( ( ...restArgs: any[] ) => (fn as any)( ...restArgs ) )as any;

    function curryMem( uncurried: (...args: any[] ) => any, argsMem: any[], lastCallRest: any[] )
    {
        if( argsMem.length === uncurried.length )
        {
            return uncurried( ...argsMem, ...lastCallRest );
        }

        return ( arg: any, ...rest: any[] ) => curryMem( uncurried, [ ...argsMem, arg ], rest );
    }

    return curryMem( fn, [], [] );
}

export function curryFirst<Args extends [ any, ...any[] ], Output>
    ( fn: ( arg1: Head<Args>, ...args: Tail<Args> ) => Output )
    : ( arg1: Head<Args> ) => ( ...args: Tail<Args> ) => Output
{
    if( fn.length === 0 ) return ( () => (fn as any)() )as any;
    if( fn.length === 1 ) return ( ( arg: Head<Args> ) => (fn as any)( arg ) )as any;

    /*
    !!!  IMPORTANT !!!

    return ( arg: Head<Args> ) => ( ...args: Tail<Args> ) => fn( arg, ...args )
    
    doesn't work because  ```( ...args: Tail<Args> ) => ...``` has ```length``` of  ```0```
    */
    if( fn.length === 2 ) return ( arg: Head<Args> ) =>
        ( ( args_0: Tail<Args> ) => fn( arg, ...[ args_0 ] as Tail<Args> ) ) as any;

    if( fn.length === 3 ) return ( arg: Head<Args> ) =>
        ( ( args_0: any, args_1: any ) => fn( arg, ...[ args_0, args_1 ] as Tail<Args> ) ) as any;

    if( fn.length === 4 ) return ( arg: Head<Args> ) =>
        ( ( args_0: any, args_1: any, args_2: any ) => fn( arg, ...[ args_0, args_1, args_2 ] as Tail<Args> ) ) as any;

    if( fn.length === 5 ) return ( arg: Head<Args> ) =>
        ( ( args_0: any, args_1: any, args_2: any, args_3: any ) => fn( arg, ...[ args_0, args_1, args_2, args_3 ] as Tail<Args> ) ) as any;

    if( fn.length === 6 ) return ( arg: Head<Args> ) =>
        ( ( args_0: any, args_1: any, args_2: any, args_3: any, args_4: any ) => 
            fn( arg, ...[ args_0, args_1, args_2, args_3, args_4 ] as Tail<Args> ) ) as any;

    if( fn.length === 7 ) return ( arg: Head<Args> ) =>
        ( ( args_0: any, args_1: any, args_2: any, args_3: any, args_4: any, args_5: any ) => 
            fn( arg, ...[ args_0, args_1, args_2, args_3, args_4, args_5 ] as Tail<Args> ) ) as any;
        
    if( fn.length === 8 ) return ( arg: Head<Args> ) =>
        ( ( args_0: any, args_1: any, args_2: any, args_3: any, args_4: any, args_5: any, args_6: any ) => 
            fn( arg, ...[ args_0, args_1, args_2, args_3, args_4, args_5, args_6 ] as Tail<Args> ) ) as any;
            
    if( fn.length === 9 ) return ( arg: Head<Args> ) =>
        ( ( args_0: any, args_1: any, args_2: any, args_3: any, args_4: any, args_5: any, args_6: any, args_7: any ) => 
            fn( arg, ...[ args_0, args_1, args_2, args_3, args_4, args_5, args_6, args_7 ] as Tail<Args> ) ) as any;

    if( fn.length === 10 ) return ( arg: Head<Args> ) =>
        ( ( args_0: any, args_1: any, args_2: any, args_3: any, args_4: any, args_5: any, args_6: any, args_7: any, args_8: any ) => 
            fn( arg, ...[ args_0, args_1, args_2, args_3, args_4, args_5, args_6, args_7, args_8 ] as Tail<Args> ) ) as any;

    throw new Error(
        "functions with more thatn 10 parameters not supported for conversion; try gruping paramters in structured types"
    );
}