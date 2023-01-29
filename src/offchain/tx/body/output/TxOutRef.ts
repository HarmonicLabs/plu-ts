import { ByteString } from "../../../.."
import Cbor from "../../../../cbor/Cbor"
import CborObj from "../../../../cbor/CborObj"
import CborArray from "../../../../cbor/CborObj/CborArray"
import CborUInt from "../../../../cbor/CborObj/CborUInt"
import CborString from "../../../../cbor/CborString"
import { ToCbor } from "../../../../cbor/interfaces/CBORSerializable"
import Data from "../../../../types/Data"
import DataB from "../../../../types/Data/DataB"
import DataConstr from "../../../../types/Data/DataConstr"
import DataI from "../../../../types/Data/DataI"
import ToData from "../../../../types/Data/toData/interface"
import { forceUInteger } from "../../../../types/ints/Integer"
import JsRuntime from "../../../../utils/JsRuntime"
import ObjectUtils from "../../../../utils/ObjectUtils"
import ToJson from "../../../../utils/ts/ToJson"
import Hash32 from "../../../hashes/Hash32/Hash32"

export interface ITxOutRef {
    id: string | Hash32
    index: number
}

export default class TxOutRef
    implements ITxOutRef, ToData, ToCbor, ToJson
{
    readonly id!: Hash32
    readonly index!: number

    constructor({ id, index }: ITxOutRef)
    {
        JsRuntime.assert(
            (typeof id === "string" && ByteString.isValidHexValue( id ) && (id.length === 64)) ||
            (id instanceof Hash32),
            "tx output id (tx hash) invalid while constructing a 'UTxO'"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "id",
            id instanceof Hash32 ? Hash32 : new Hash32( id )
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "index",
            Number( forceUInteger( index ).asBigInt )
        );
    }

    toString(): string
    {
        return `${this.id.asString}#${this.index.toString()}`;
    }

    toData(): DataConstr
    {
        return new DataConstr(
            0, // PTxOutRef only constructor
            [
                new DataConstr(
                    0, // PTxId only constructor
                    [ new DataB( this.id.asBytes ) ]
                ),
                new DataI( this.index )
            ]
        )
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

    toJson()
    {
        return {
            id: this.id.asString,
            index: this.index
        };
    }
    
}