import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../types/bits/BitStream";
import Integer, { UInteger } from "../../../../types/ints/Integer";
import BigIntUtils from "../../../../utils/BigIntUtils";
import Debug from "../../../../utils/Debug";
import JsRuntime from "../../../../utils/JsRuntime";

export type CanBeUInteger
    = UInteger
    | Integer
    | number;

export function forceUInteger( toForce: CanBeUInteger ): UInteger
{
    if( toForce instanceof UInteger && UInteger.isStrictInstance( toForce ) )
    {
        return toForce;
    }
    if( toForce instanceof Integer )
    {
        // makes sure is integer sitric instance
        toForce = toForce.toSigned();

        if( toForce.asBigInt < BigInt( 0 ) )
        {
            Debug.throw( "trying to convert an integer to an unsigned Integer, the integer was negative" );
            return new UInteger( BigIntUtils.abs( toForce.asBigInt ) );
        }
        
        return new UInteger( toForce.asBigInt );
    }

    if( toForce < 0 )
    {
        Debug.throw( "trying to convert an integer to an unsigned Integer, the number was negative" );
    }

    return new UInteger( Math.abs( Math.round( toForce ) ) );
} 

export default class UPLCVersion
    implements UPLCSerializable
{
    private _major: UInteger
    private _minor: UInteger
    private _patch: UInteger

    get major(): UInteger {return this._major};
    get minor(): UInteger {return this._minor};
    get patch(): UInteger {return this._patch};

    constructor( major: CanBeUInteger, minor: CanBeUInteger, patch: CanBeUInteger )
    {
        this._major = forceUInteger( major );
        this._minor = forceUInteger( minor );
        this._patch = forceUInteger( patch );
    }

    toUPLCBitStream(): BitStream
    {
        const result = this.major.toUPLCBitStream();
        result.append( this.minor.toUPLCBitStream() );
        result.append( this.patch.toUPLCBitStream() );
        return result;
    }
}