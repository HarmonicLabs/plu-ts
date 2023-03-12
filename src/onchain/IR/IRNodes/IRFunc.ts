import { seahash } from "../../../crypto";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { PrimType, TermType, getNRequiredLambdaArgs } from "../../pluts";
import { cloneTermType } from "../../pluts/type_system/cloneTermType";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { IRApp } from "./IRApp";
import { IRLetted } from "./IRLetted";


type _ = {
    __pluts_internal: 
    "ERROR: this field is used to optimize cloning; you should not use as it maight degrade perforamces" & never 
}
export class IRFunc
    implements Cloneable<IRFunc>, IHash
{
    readonly arity!: number;
    readonly type!: [PrimType.Lambda,TermType,TermType]

    readonly hash!: Uint8Array;

    readonly body!: IRTerm

    clone!: () => IRFunc;

    constructor(
        t: [PrimType.Lambda,TermType,TermType],
        mkBody: ( ...boundedVars: IRVar[] ) => IRTerm,
        __unsafeBodyHash__?: _
    )
    {
        ObjectUtils.defineReadOnlyProperty(
            this, "arity", getNRequiredLambdaArgs( t )
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "type", cloneTermType( t )
        );

        const vars = new Array( this.arity )
            .fill( undefined )
            .map( (_,i) => new IRVar( this, i ) );

        const body = mkBody( ...vars );
        ObjectUtils.defineReadOnlyProperty(
            this, "body", body
        );

        const bodyHash = (
            (__unsafeBodyHash__ as any) instanceof Uint8Array &&
            (__unsafeBodyHash__ as any as Uint8Array).length === 8
        ) ? (__unsafeBodyHash__ as any as Uint8Array) : 
            getIRFuncBodyHash( body, this );
 
        let hash: Uint8Array | undefined = undefined;

        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = seahash(
                            concatUint8Arr(
                                IRFunc.tag,
                                numAsBytes( this.arity ),
                                // body.hash, // NO
                                // the above causes infinite loops
                                // because variables defined here would require this same hash
                                // instead we use:
                                bodyHash // got using `boundedHash` on variables
                            )
                        )
                    }
                    return hash.slice();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        ObjectUtils.defineReadOnlyProperty(
            this, "clone",
            {
                value: () => {
                    return new IRFunc(
                        t,
                        mkBody,
                        (bodyHash as unknown as _)
                    )
                }
            }
        );
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_00001 ]); }

}

const boundedHashCache: Uint8Array[] = []; 

export class IRVar
    implements Cloneable<IRVar>, IHash
{
    readonly hash: Uint8Array;
    /*
    different hash used to theremine hash of the bounding function

    It is still defined but the world doesnt needs to know it
    
    // readonly boundedHash!: Uint8Array;
    */
    readonly bound!: IRFunc;
    readonly idx!: number;

    constructor( bound: IRFunc, idx: number )
    {
        /**
         * !!! IMPORTANT !!!
         * needs to be the same exact object as the input
         * and MUST be readonly
         * 
         * this is the only way to check an IRVar origin
        **/
        ObjectUtils.defineReadOnlyProperty(
            this, "bound", bound
        );

        if(!( Number.isSafeInteger( idx ) && idx >= 0 ))
        throw new BasePlutsError(
            "invalid index for an `IRVar` instance"
        )
        ObjectUtils.defineReadOnlyProperty(
            this, "idx", idx
        );

        Object.defineProperty(
            this, "boundedHash",
            {
                get: () => {

                    while( (boundedHashCache.length - 1) < this.idx )
                    {
                        boundedHashCache.push(
                            seahash(
                                concatUint8Arr(
                                    IRVar.tag,
                                    numAsBytes(
                                        (boundedHashCache.length - 1)
                                    )
                                )
                            )
                        );
                    }

                    return boundedHashCache[ this.idx ].slice();
                },
                set: () => {},
                enumerable: false, // the world doesn't need to use boundedHash
                configurable: false
            }
        );

        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = seahash(
                            concatUint8Arr(
                                IRVar.tag,
                                this.bound.hash,
                                numAsBytes( this.idx )
                            )
                        )
                    }
                    return hash.slice();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0000 ]); }

    clone(): IRVar
    {
        return new IRVar(
            this.bound, // DO NOT CLONE, is the reference that we need
            this.idx
        );
    }
}

/**
 * assumes positive number
 * 
 * writes the number in a new `Uint8Array` Big Endian
 */
function numAsBytes( n: number ): Uint8Array
{
    let max = 0x100;
    let nBytes = 1;
    while( max <= n )
    {
        nBytes++;
        max = max << 8;
    }
    const result = new Uint8Array( nBytes );
    // just reuse some variable
    nBytes = 0; 
    while( n > 0 )
    {
        result[ nBytes++ ] = n & 0xff;
        n = n >>> 8;
    }
    return result;
}


function getIRFuncBodyHash( body: IRTerm, irFunc: IRFunc ): Uint8Array
{
    if( body instanceof IRVar )
    {
        if( body.bound === irFunc )
        {
            // we know boundedHash exsists
            return (body as any).boundedHash;
        }
        return body.hash
    }

    if( body instanceof IRFunc )
    return seahash(
        concatUint8Arr(
            IRFunc.tag,
            getIRFuncBodyHash( body.body, irFunc )
        )
    );

    if( body instanceof IRApp  )
    return seahash(
        concatUint8Arr(
            IRApp.tag,
            getIRFuncBodyHash( body.fn, irFunc ),
            getIRFuncBodyHash( body.arg, irFunc )
        )
    );

    if( body instanceof IRLetted )
    return seahash(
        concatUint8Arr(
            IRLetted.tag,
            getIRFuncBodyHash( body.value, irFunc )
        )
    );

    // at this point body must be either
    // IRHoisted
    // IRError
    // IRNative
    // IRConst
    // all of which can't have any of the function variables in their definition
    // (hoisted terms are closed)
    return body.hash.slice();
}