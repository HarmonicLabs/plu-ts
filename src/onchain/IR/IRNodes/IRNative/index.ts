import { blake2b_224 } from "../../../../crypto";
import { UnexpectedMarkHashInvalidCall } from "../../../../errors/PlutsIRError/UnexpectedMarkHashInvalidCall";
import { BitStream } from "../../../../types/bits/BitStream";
import { Cloneable } from "../../../../types/interfaces/Cloneable";
import UPLCFlatUtils from "../../../../utils/UPLCFlatUtils";
import { ToJson } from "../../../../utils/ts/ToJson";
import { IRTerm } from "../../IRTerm";
import { IHash } from "../../interfaces/IHash";
import { IIRParent } from "../../interfaces/IIRParent";
import { concatUint8Arr } from "../../utils/concatUint8Arr";
import { isIRTerm } from "../../utils/isIRTerm";
import { IRNativeTag, nativeTagToString } from "./IRNativeTag";

/**
 * we might not need all the hashes
 * 
 * but one we get one for a specific tag is not worth it re calclualte it
 */
const nativeHashesCache: { [n: number/*IRNativeTag*/]: Uint8Array } = {} as any;

/**
 * `IRNative` ⊇ `Builtins` + `std::fn`
**/
export class IRNative
    implements Cloneable<IRNative>, IHash, IIRParent, ToJson
{
    readonly tag!: IRNativeTag;
    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;

    parent: IRTerm | undefined;

    constructor( tag: IRNativeTag, irParent?: IRTerm )
    {
        Object.defineProperty(
            this, "tag", {
                value: tag,
                writable: false,
                enumerable: true,
                configurable: false
            }
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

        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(nativeHashesCache[this.tag] === undefined)
                    {
                        nativeHashesCache[this.tag] = blake2b_224( 
                            concatUint8Arr( 
                                IRNative.tag, 
                                new Uint8Array([
                                    parseInt(
                                        "0b" + 
                                        UPLCFlatUtils.zigzagBigint(
                                            BigInt( this.tag )
                                        )
                                        // builtin tag takes 7 bits
                                        // zigzagged it becomes up to 8
                                        .toString(2).padStart( 8, '0' )
                                    )
                                ])
                            )
                        );
                    }
                    // return a copy
                    return nativeHashesCache[this.tag].slice()
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => { throw new UnexpectedMarkHashInvalidCall("IRNative") },
                writable: false,
                enumerable:  true,
                configurable: false
            }
        );
        
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0100 ]); }

    clone(): IRNative
    {
        return new IRNative( this.tag );
    }

    toJson()
    {
        return {
            type: "IRNative",
            native: nativeTagToString( this.tag )
        };
    }
}