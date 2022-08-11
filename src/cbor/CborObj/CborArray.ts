import CborObj, { cborObjFromRaw, isCborObj, RawCborObj } from ".";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborArray = {
    array: RawCborObj[]
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
