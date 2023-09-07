import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { blake2b_128 } from "@harmoniclabs/crypto";
import { BasePlutsError } from "../../utils/BasePlutsError";
import { ToJson } from "../../utils/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";

export class IRForced
    implements Cloneable<IRForced>, IHash, IIRParent, ToJson
{
    forced!: IRTerm
    readonly hash!: Uint8Array
    markHashAsInvalid!: () => void;

    parent: IRTerm | undefined;

    constructor( forced: IRTerm )
    {
        let hash: Uint8Array | undefined = undefined
        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(!(hash instanceof Uint8Array))
                    {
                        hash = blake2b_128(
                            concatUint8Arr(
                                IRForced.tag,
                                this.forced.hash
                            )
                        );
                    }
                    return hash.slice();
                }
            }
        );
        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => { 
                    hash = undefined;
                    this.parent?.markHashAsInvalid();
                },
                writable: false,
                enumerable:  false,
                configurable: false
            }
        );
        
        let _forced: IRTerm;
        Object.defineProperty(
            this, "forced",
            {
                get: () => _forced,
                set: ( newForced: IRTerm | undefined ) => {
                    if(!isIRTerm( newForced ))
                    {
                        throw new BasePlutsError(
                            "invalid IRTerm to be forced"
                        );
                    }
                    this.markHashAsInvalid();
                    _forced = newForced;
                    _forced.parent = this;
                },
                enumerable: true,
                configurable: false
            }
        );
        this.forced = forced;

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
    }

    static get tag(): Uint8Array
    {
        return new Uint8Array([0b0000_1000]);
    }

    clone(): IRForced
    {
        return new IRForced( this.forced.clone() )
    }

    toJson(): any
    {
        return {
            type: "IRForced",
            forced: this.forced.toJson()
        }
    }
}