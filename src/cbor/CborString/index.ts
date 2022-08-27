import CborObj from "../CborObj";
import Cbor from "../Cbor";
import ByteString from "../../types/HexString/ByteString";

export default
class CborString extends ByteString
{
    static isStrictInstance( cborStr: any ): cborStr is CborString
    {
        return Object.getPrototypeOf( cborStr ) === CborString.prototype
    }

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

    static fromCborObj( jsonCbor : CborObj ): CborString
    {
        return Cbor.encode( jsonCbor );
    }

    toCborObj(): CborObj
    {
        return Cbor.parse( this );
    }
}