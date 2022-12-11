import Cbor from "../../../../cbor/Cbor";
import CborObj from "../../../../cbor/CborObj";
import CborArray from "../../../../cbor/CborObj/CborArray";
import CborUInt from "../../../../cbor/CborObj/CborUInt";
import CborString from "../../../../cbor/CborString";
import { ToCbor } from "../../../../cbor/interfaces/CBORSerializable";
import ByteString from "../../../../types/HexString/ByteString";
import { CanBeUInteger, forceUInteger } from "../../../../types/ints/Integer";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import Hash32 from "../../../hashes/Hash32/Hash32";
import TxOut, { ITxOut } from "./TxOut";

export interface ITxOutRef {
    id: string | Hash32
    index: number
}
export default class TxOutRef
    implements ITxOutRef, ToCbor
{
    readonly id!: Hash32
    readonly index!: number
    readonly resolved!: TxOut

    constructor( id: string | Hash32, index: CanBeUInteger, resolved: ITxOut )
    {
        JsRuntime.assert(
            (typeof id === "string" && ByteString.isValidHexValue( id ) && (id.length === 64)) ||
            (id instanceof Hash32),
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

        ObjectUtils.defineReadOnlyProperty(
            this,
            "resolved",
            resolved instanceof TxOut ? resolved : new TxOut( resolved )
        );
    }

    toString(): string
    {
        return `${this.id}#${this.index.toString()}`;
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborArray([
            this.id.toCborObj(),
            new CborUInt( this.index )
        ])
    }
}