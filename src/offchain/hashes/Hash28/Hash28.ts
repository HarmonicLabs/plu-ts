import JsRuntime from "../../../utils/JsRuntime";

import { Cbor } from "../../../cbor/Cbor";
import { CborObj } from "../../../cbor/CborObj";
import { CborBytes } from "../../../cbor/CborObj/CborBytes";
import { CanBeCborString, forceCborString } from "../../../cbor/CborString";
import { InvalidCborFormatError } from "../../../errors/InvalidCborFormatError";
import { Hash } from "../Hash";

export class Hash28 extends Hash
{
    constructor( bs: string | Buffer | Hash28 , className: string = "Hash28" )
    {
        super( bs instanceof Hash28 ? bs.toBuffer() : bs );

        JsRuntime.assert(
            this._bytes.length === 28,
            "'" + className + "' must be an hash of length 28"
        );
    }

    valueOf(): string
    {
        return this.asString;
    }

    clone(): Hash28
    {
        return new Hash28( this.toBuffer() );
    }

    static fromCbor( cStr: CanBeCborString ): Hash28
    {
        return Hash28.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): Hash28
    {
        if(!(cObj instanceof CborBytes ))
        throw new InvalidCborFormatError("Hash");

        return new Hash28( cObj.buffer )
    }
}