import { blake2b_224 } from "../../../crypto";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";

export class IRApp
    implements Cloneable<IRApp>, IHash
{
    fn!: IRTerm;
    arg!: IRTerm;

    readonly hash!: Uint8Array;

    constructor( _fn_: IRTerm, _arg_: IRTerm )
    {
        let fn  = _fn_;
        let arg = _arg_;

        let hashIsValid: boolean = false;
        let hash: Uint8Array | undefined = undefined;

        Object.defineProperty(
            this, "fn", {
                get: () => fn,
                set: ( newFn: any ) => {
                    if( !isIRTerm( newFn ) ) return;

                    hashIsValid = false;
                    fn = newFn;
                },
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "arg", {
                get: () => arg,
                set: ( newArg: any ) => {
                    if( !isIRTerm( newArg ) ) return;

                    hashIsValid = false;
                    arg = newArg;
                },
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(
                        !( hash instanceof Uint8Array ) ||
                        !hashIsValid
                    )
                    {
                        // basically a merkle tree
                        hash = blake2b_224( concatUint8Arr( IRApp.tag, fn.hash, arg.hash ) );
                        hashIsValid = true;
                    }
                    // return a copy
                    return hash.slice()
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0010 ]); }

    clone(): IRApp
    {
        return new IRApp(
            this.fn.clone(),
            this.arg.clone()
        );
    }
}