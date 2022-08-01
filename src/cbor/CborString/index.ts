import HexString from "../../types/HexString";
import JsonCbor from "../JsonCbor";
import Cbor from "../Cbor";

export default
class CborString extends HexString
{
    constructor( cbor: string | Buffer )
    {
        if( typeof cbor === "string" )
        {
            cbor = cbor.split(" ").join("");
    
            // hex string length has to be even
            cbor = (cbor.length % 2) ? "0" + cbor : cbor;
        }
        
        super( cbor );
    }

    static fromJsonCbor( jsonCbor : JsonCbor ): CborString
    {
        return Cbor.encode( jsonCbor );
    }

    toJsonCbor(): JsonCbor
    {
        return Cbor.parse( this );
    }
}