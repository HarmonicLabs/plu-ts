import Cbor from "../../../cbor/Cbor";
import CborObj from "../../../cbor/CborObj";
import CborBytes from "../../../cbor/CborObj/CborBytes";
import { CanBeCborString, forceCborString } from "../../../cbor/CborString";
import InvalidCborFormatError from "../../../errors/InvalidCborFormatError";
import JsRuntime from "../../../utils/JsRuntime";
import Hash from "../Hash";

export default class Hash32 extends Hash
{
    constructor( bs: string | Buffer | Hash32 , className: string = "Hash32" )
    {
        super( bs instanceof Hash32 ? bs.asBytes : bs );

        JsRuntime.assert(
            this._bytes.length === 32,
            "'" + className + "' must be an hash of length 32"
        );
    }

    static fromCbor( cStr: CanBeCborString ): Hash32
    {
        return Hash32.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): Hash32
    {
        if(!(cObj instanceof CborBytes ))
        throw new InvalidCborFormatError("Hash");

        return new Hash32( cObj.buffer )
    }
    
}