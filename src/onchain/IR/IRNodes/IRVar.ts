import { blake2b_224 } from "../../../crypto";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { UnexpectedMarkHashInvalidCall } from "../../../errors/PlutsIRError/UnexpectedMarkHashInvalidCall";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";


export class IRVar
    implements Cloneable<IRVar>, IHash, IIRParent
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
    readonly dbn!: number;

    parent: IRTerm | undefined;

    constructor( dbn: number, irParent?: IRTerm )
    {
        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = getVarHashAtDbn( dbn );
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
                value: () => { throw new UnexpectedMarkHashInvalidCall("IRVar") },
                writable: false,
                enumerable:  true,
                configurable: false
            }
        );
        
        if(!( Number.isSafeInteger( dbn ) && dbn >= 0 ))
        throw new BasePlutsError(
            "invalid index for an `IRVar` instance"
        )
        ObjectUtils.defineReadOnlyProperty(
            this, "dbn", dbn
        );
        
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
                enumerable: true,
                configurable: false
            }
        );
        this.parent = irParent;
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0000 ]); }

    clone(): IRVar
    {
        return new IRVar( this.dbn );
    }
}

const bdnVarHashCache: Uint8Array[] = []; 

function getVarHashAtDbn( dbn: number )
{
    while( (bdnVarHashCache.length - 1) < dbn )
    {
        bdnVarHashCache.push(
            blake2b_224(
                concatUint8Arr(
                    IRVar.tag,
                    positiveIntAsBytes( bdnVarHashCache.length )
                )
            )
        );
    }

    return bdnVarHashCache[ dbn ]
}