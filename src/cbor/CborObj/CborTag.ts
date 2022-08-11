import CborObj, { isCborObj, RawCborObj } from "."
import JsRuntime from "../../utils/JsRuntime"
import ObjectUtils from "../../utils/ObjectUtils"
import ToRawObj from "./interfaces/ToRawObj"

export type RawCborTag = {
    tag: number,
    data: RawCborObj
}

export default class CborTag
    implements ToRawObj
{
    private _tag: number
    get tag(): number { return this._tag }

    private _data: CborObj
    get data(): CborObj { return ObjectUtils.jsonClone( this._data ) }

    constructor( tag: number , data: CborObj )
    {
        JsRuntime.assert(
            typeof tag === "number" &&
            isCborObj( data ),
            "using direct value constructor; either 'tag' is nota n umber or 'data' is missing"
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
}