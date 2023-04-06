import { blake2b_128 } from "../../../crypto";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { UnexpectedMarkHashInvalidCall } from "../../../errors/PlutsIRError/UnexpectedMarkHashInvalidCall";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { ToJson } from "../../../utils/ts/ToJson";
import { UPLCVar } from "../../UPLC/UPLCTerms/UPLCVar";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";


export class IRVar
    implements Cloneable<IRVar>, IHash, IIRParent, ToJson
{
    readonly hash: Uint8Array;
    markHashAsInvalid!: () => void;
    /**
     * the IR DeBruijn index is not necessarly the same of the UPLC
     * ( more ofthen than not it won't be the same )
     * 
     * this is because in the IR things like `plet`
     * are skipping some DeBruijin levels that are instead present
     * in the final UPLC
    **/
    dbn!: number;

    parent: IRTerm | undefined;

    constructor( DeBruijn: number | bigint )
    {
        DeBruijn = typeof DeBruijn === "number" ? DeBruijn : Number( DeBruijn );
        
        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = getVarHashAtDbn( this.dbn );
                    }
                    return hash.slice();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => {
                    hash = undefined;
                    this.parent?.markHashAsInvalid()
                },
                writable: false,
                enumerable:  false,
                configurable: false
            }
        );

        const e = Error();

        let _dbn: number
        Object.defineProperty(
            this, "dbn",
            {
                get: () => _dbn,
                set: ( newDbn: number ) => {
                    if(!(
                        Number.isSafeInteger( newDbn ) && newDbn >= 0 
                    )){
                        console.log( e.stack );
                        throw new BasePlutsError(
                            "invalid index for an `IRVar` instance; new DeBruijn was: " + newDbn
                        );
                    }

                    if( newDbn === _dbn ) return; // everything ok

                    this.markHashAsInvalid()
                    _dbn = newDbn;
                },
                enumerable: true,
                configurable: false
            }
        );
        this.dbn = DeBruijn; // call set
        
        let _parent: IRTerm | undefined = undefined;
        Object.defineProperty(
            this, "parent",
            {
                get: () => _parent,
                set: ( newParent: IRTerm | undefined ) => {

                    if( newParent === undefined || isIRTerm( newParent ) )
                    {
                        _parent = newParent;
                    }

                },
                enumerable: false,
                configurable: false
            }
        );
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0000 ]); }

    clone(): IRVar
    {
        return new IRVar( this.dbn );
    }

    toJson(): any
    {
        return {
            type: "IRVar",
            dbn: this.dbn
        }
    }
}

const bdnVarHashCache: Uint8Array[] = []; 

function getVarHashAtDbn( dbn: number )
{
    while( (bdnVarHashCache.length - 1) < dbn )
    {
        bdnVarHashCache.push(
            blake2b_128(
                concatUint8Arr(
                    IRVar.tag,
                    positiveIntAsBytes( bdnVarHashCache.length )
                )
            )
        );
    }

    return bdnVarHashCache[ dbn ]
}