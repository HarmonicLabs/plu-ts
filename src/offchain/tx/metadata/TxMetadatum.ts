import ByteString from "../../../types/HexString/ByteString";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";


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
}

export class TxMetadatumList
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
}

export class TxMetadatumInt
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
}

export class TxMetadatumBytes
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
}

export class TxMetadatumText
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
}