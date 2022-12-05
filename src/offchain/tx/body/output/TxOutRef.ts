import ByteString from "../../../../types/HexString/ByteString";
import { CanBeUInteger, forceUInteger } from "../../../../types/ints/Integer";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";

export default class TxOutRef
{
    readonly id!: string
    readonly index!: number

    constructor( id: string, index: CanBeUInteger )
    {
        JsRuntime.assert(
            ByteString.isValidHexValue( id ) && (id.length === 64),
            "tx output id (tx hash) invalid while constructing a 'TxOutRef'"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "id",
            id
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "index",
            Number( forceUInteger( index ).asBigInt )
        );

    }

    toString(): string
    {
        return `${this.id}#${this.index.toString()}`;
    }

    static fromString( str: string ): TxOutRef
    {
        const [id, index] = str.split('#');
        return new TxOutRef( id, BigInt( index ) );
    }
}