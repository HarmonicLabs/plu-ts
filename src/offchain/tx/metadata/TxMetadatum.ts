import Cbor from "../../../cbor/Cbor";
import CborObj from "../../../cbor/CborObj";
import CborArray from "../../../cbor/CborObj/CborArray";
import CborBytes from "../../../cbor/CborObj/CborBytes";
import CborMap from "../../../cbor/CborObj/CborMap";
import CborNegInt from "../../../cbor/CborObj/CborNegInt";
import CborText from "../../../cbor/CborObj/CborText";
import CborUInt from "../../../cbor/CborObj/CborUInt";
import CborString from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import ByteString from "../../../types/HexString/ByteString";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import ToJson from "../../../utils/ts/ToJson";


export type TxMetadatum
    = TxMetadatumMap
    | TxMetadatumList
    | TxMetadatumInt
    | TxMetadatumBytes
    | TxMetadatumText;

export default TxMetadatum;

export function isTxMetadatum( something: any ): something is TxMetadatum
{
    return (
        something instanceof TxMetadatumMap     ||
        something instanceof TxMetadatumList    ||
        something instanceof TxMetadatumInt     ||
        something instanceof TxMetadatumBytes   ||
        something instanceof TxMetadatumText
    );
}

export type TxMetadatumMapEntry = {
    k: TxMetadatum,
    v: TxMetadatum
};

function isTxMetadatumMapEntry( something: any ): something is TxMetadatumMapEntry
{
    return (
        ObjectUtils.has_n_determined_keys(
            something, 2, "k", "v"
        ) &&
        isTxMetadatum( something["k"] ) &&
        isTxMetadatum( something["v"] )
    );
}

export class TxMetadatumMap
    implements ToCbor, ToJson
{
    readonly map!: TxMetadatumMapEntry[];

    constructor( map: TxMetadatumMapEntry[] )
    {
        JsRuntime.assert(
            map.every( isTxMetadatumMapEntry ),
            "invalid entries for TxMetadatumMap"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "map",
            Object.freeze( map )
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborMap(
            this.map.map( entry => {
                return {
                    k: entry.k.toCborObj(),
                    v: entry.v.toCborObj(),
                }
            })
        )
    }

    toJson()
    {
        return this.map.map( entry => {
            return {
                k: entry.k.toJson(),
                v: entry.v.toJson(),
            }
        })
    }
}

export class TxMetadatumList
    implements ToCbor, ToJson
{
    readonly list!: TxMetadatum[];

    constructor( map: TxMetadatum[] )
    {
        JsRuntime.assert(
            map.every( isTxMetadatum ),
            "invalid entries for TxMetadatumList"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "list",
            Object.freeze( map )
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborArray( this.list.map( _ => _.toCborObj() ) );
    }

    toJson()
    {
        return this.list.map( _ => _.toJson() );
    }
}

export class TxMetadatumInt
    implements ToCbor, ToJson
{
    readonly n!: bigint;

    constructor( n: number | bigint )
    {
        ObjectUtils.defineReadOnlyProperty(
            this,
            "n",
            BigInt( n )
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return this.n < BigInt( 0 ) ? new CborNegInt( this.n ) : new CborUInt( this.n )
    }

    toJson()
    {
        return { int: this.n.toString() }
    }
}

export class TxMetadatumBytes
    implements ToCbor, ToJson
{
    readonly bytes!: Buffer

    constructor( bytes: Buffer | ByteString )
    {
        ObjectUtils.defineReadOnlyProperty(
            this,
            "bytes",
            Buffer.isBuffer( bytes ) ? bytes : bytes.asBytes
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.bytes.length > 64 )
        {
            const chunks: CborBytes[] = [];

            for( let ptr: number = 0; ptr < this.bytes.length; ptr += 64 )
            {
                chunks.push(
                    new CborBytes(
                        this.bytes.subarray( ptr, ptr + 64 )
                    )
                );
            }

            return new CborArray( chunks );
        }

        return new CborBytes( this.bytes );
    }

    toJson()
    {
        return { bytes: this.bytes.toString("hex") }
    }
}

export class TxMetadatumText
    implements ToCbor, ToJson
{
    readonly text!: string

    constructor( text: string )
    {
        JsRuntime.assert(
            typeof text === "string",
            "invalid text"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "text",
            text
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.text.length > 64 )
        {
            const chunks: CborText[] = [];

            for( let ptr: number = 0; ptr < this.text.length; ptr += 64 )
            {
                chunks.push(
                    new CborText(
                        this.text.slice( ptr, ptr + 64 )
                    )
                );
            }

            return new CborArray( chunks );
        }

        return new CborText( this.text );
    }

    toJson()
    {
        return { text: this.text }
    }
}