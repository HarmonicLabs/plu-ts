import { CborObj, cborObjFromRaw, isCborObj, isRawCborObj, RawCborObj } from "."
import { Cloneable } from "../../types/interfaces/Cloneable"
import { canBeUInteger } from "../../types/ints/Integer"
import JsRuntime from "../../utils/JsRuntime"
import { ToRawObj } from "./interfaces/ToRawObj"

export type RawCborTag = {
    tag: number | bigint,
    data: RawCborObj
}

export function isRawCborTag( t: RawCborTag ): boolean
{
    if( typeof t !== "object" ) return false;

    const keys = Object.keys( t );

    return (
        keys.length === 2 &&
        keys.includes( "tag" ) &&
        keys.includes( "data" ) &&
        canBeUInteger( t.tag ) &&
        isRawCborObj( t.data )
    );
}

export class CborTag
    implements ToRawObj, Cloneable<CborTag>
{
    private _tag: bigint
    get tag(): bigint { return this._tag }

    private _data: CborObj
    get data(): CborObj { return cborObjFromRaw( this._data.toRawObj() ) }

    constructor( tag: number | bigint , data: CborObj )
    {
        if( typeof tag === "number" )
        {
            tag = BigInt( tag );
        }

        JsRuntime.assert(
            typeof tag === "bigint" &&
            isCborObj( data ),
            "using direct value constructor; either 'tag' is not a number or 'data' is missing"
        );

        this._tag = tag;
        this._data = data;
    }

    toRawObj(): RawCborTag
    {
        return {
            tag: this.tag,
            data: this.data.toRawObj(),
        }
    }

    clone(): CborTag
    {
        return new CborTag( this.tag, this.data.clone() )
    }
}