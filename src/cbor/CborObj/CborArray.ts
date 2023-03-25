import { CborObj, cborObjFromRaw, isCborObj, isRawCborObj, RawCborObj } from ".";
import { Cloneable } from "../../types/interfaces/Cloneable";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import { ToRawObj } from "./interfaces/ToRawObj";

export interface CborArrayOptions {
    indefinite?: boolean
}

export type RawCborArray = {
    array: RawCborObj[]
    options?: CborArrayOptions
}

export function isRawCborArray( arr: RawCborArray ): boolean
{
    if( typeof arr !== "object" ) return false;

    const keys = Object.keys( arr );

    return (
        keys.length >= 1 &&
        keys.includes("array") &&
        Array.isArray( arr.array ) &&
        arr.array.every( isRawCborObj )
    );
}

const defaultOpts: Required<CborArrayOptions> = {
    indefinite: false
}

export class CborArray
    implements ToRawObj, Cloneable<CborArray>
{
    private _array : CborObj[];
    public get array() : CborObj[]
    {
        return this._array
            .map( cObj => 
                cborObjFromRaw(
                    cObj.toRawObj()
                )
            );
    }

    readonly indefinite!: boolean;
    
    constructor( array: CborObj[], options?: CborArrayOptions )
    {
        JsRuntime.assert(
            Array.isArray( array ) &&
            array.every( isCborObj ),
            "in 'CborArray' constructor: invalid input; got: " + array
        );

        const {
            indefinite
        } = {
            ...defaultOpts,
            ...options
        };

        this._array = array;

        ObjectUtils.defineReadOnlyProperty(
            this, "indefinite", Boolean( indefinite )
        );
    }

    toRawObj(): RawCborArray
    {
        return {
            array: this.array.map( cborObj => cborObj.toRawObj() ),
            options: {
                indefinite: this.indefinite
            }
        };
    }

    clone(): CborArray
    {
        return new CborArray(
            this.array,
            {
                indefinite: this.indefinite
            }
        );
    }
}
