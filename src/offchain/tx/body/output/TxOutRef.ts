import Cbor from "../../../../cbor/Cbor";
import CborObj from "../../../../cbor/CborObj";
import CborArray from "../../../../cbor/CborObj/CborArray";
import CborUInt from "../../../../cbor/CborObj/CborUInt";
import CborString from "../../../../cbor/CborString";
import { ToCbor } from "../../../../cbor/interfaces/CBORSerializable";
import Data from "../../../../types/Data";
import DataB from "../../../../types/Data/DataB";
import DataConstr from "../../../../types/Data/DataConstr";
import DataI from "../../../../types/Data/DataI";
import ToData from "../../../../types/Data/toData/interface";
import ByteString from "../../../../types/HexString/ByteString";
import { CanBeUInteger, forceUInteger } from "../../../../types/ints/Integer";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import Hash32 from "../../../hashes/Hash32/Hash32";
import TxOut, { ITxOut } from "./TxOut";

export interface ITxOutRef {
    id: string | Hash32
    index: number,
    resolved: ITxOut
}
export default class TxOutRef
    implements ITxOutRef, ToCbor, ToData
{
    readonly id!: Hash32
    readonly index!: number
    readonly resolved!: TxOut

    constructor( txOutRef: ITxOutRef )
    constructor({ id, index, resolved }: ITxOutRef)
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

    toData( version: "v1" | "v2" = "v2" ): Data
    {
        return new DataConstr(
            0, // PTxInInfo only constructor
            [
                new DataConstr(
                    0, // PTxOutRef only constructor
                    [
                        new DataConstr(
                            0, // PTxId only constructor
                            [ new DataB( this.id.asBytes ) ]
                        ),
                        new DataI( this.index )
                    ]
                ),
                this.resolved.toData( version ) // PTxOut based on specified version
            ]
        );
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