import JsRuntime from "../../utils/JsRuntime";
import { ToJson } from "../../utils/ts/ToJson";
import { ByteString } from "../HexString/ByteString";
import { Cloneable } from "../interfaces/Cloneable";


export class DataB
    implements Cloneable<DataB>, ToJson
{
    private _bytes: ByteString
    get bytes(): ByteString
    {
        return Object.freeze( this._bytes ) as any
    };

    constructor( B: ByteString | Buffer | string )
    {
        if(!(B instanceof ByteString)) B = new ByteString( B );

        this._bytes = B.clone();
    }

    clone(): DataB
    {
        // the constructor clones the bytes
        return new DataB( this._bytes );
    }

    toJson()
    {
        return { bytes: this._bytes.asString }
    }
}