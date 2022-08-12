import CborObj, { cborObjFromRaw, isCborObj, isRawCborObj, RawCborObj } from ".";
import JsRuntime from "../../utils/JsRuntime";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborArray = {
    array: RawCborObj[]
}

export function isRawCborArray( arr: RawCborArray ): boolean
{
    if( typeof arr !== "object" ) return false;

    const keys = Object.keys( arr );

    return (
        keys.length === 1 &&
        keys[0] === "array" &&
        Array.isArray( arr.array ) &&
        arr.array.every( isRawCborObj )
    );
}

export default class CborArray
    implements ToRawObj
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
    
    constructor( array: CborObj[] )
    {
        JsRuntime.assert(
            Array.isArray( array ) &&
            array.every( isCborObj ),
            "in 'CborArray' constructor: invalid input; got: " + array
        );

        this._array = array;
    }

    toRawObj(): RawCborArray
    {
        return {
            array: this.array.map( cborObj => cborObj.toRawObj() )
        };
    }
}
