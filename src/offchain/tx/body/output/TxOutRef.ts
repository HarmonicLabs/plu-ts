import JsRuntime from "../../../../utils/JsRuntime"
import ObjectUtils from "../../../../utils/ObjectUtils"

import { ToCbor } from "../../../../cbor/interfaces/CBORSerializable"
import { CborString, CanBeCborString, forceCborString } from "../../../../cbor/CborString"
import { forceBigUInt } from "../../../../types/ints/Integer"
import { ByteString } from "../../../../types/HexString/ByteString"
import { Cbor } from "../../../../cbor/Cbor"
import { CborObj } from "../../../../cbor/CborObj"
import { CborArray } from "../../../../cbor/CborObj/CborArray"
import { CborUInt } from "../../../../cbor/CborObj/CborUInt"
import { InvalidCborFormatError } from "../../../../errors/InvalidCborFormatError"
import { DataB } from "../../../../types/Data/DataB"
import { DataConstr } from "../../../../types/Data/DataConstr"
import { DataI } from "../../../../types/Data/DataI"
import { ToData } from "../../../../types/Data/toData/interface"
import { ToJson } from "../../../../utils/ts/ToJson"
import { Hash32 } from "../../../hashes/Hash32/Hash32"
import { BasePlutsError } from "../../../../errors/BasePlutsError"

export type TxOutRefStr = `${string}#${number}`;

export interface ITxOutRef {
    id: string | Hash32
    index: number
}

export function isITxOutRef( stuff: any ): stuff is ITxOutRef
{
    return (
        ObjectUtils.isObject( stuff ) &&
        ObjectUtils.hasOwn( stuff, "id" ) && (
            (typeof stuff.id === "string" && ByteString.isValidHexValue( stuff.id ) && (stuff.id.length === 64)) ||
            (stuff.id instanceof Hash32)
        ) &&
        ObjectUtils.hasOwn( stuff, "index" ) && (
            typeof stuff.index === "number" &&
            stuff.index === Math.round( Math.abs( stuff.index ) )
        )
    )
}

export function ITxOutRefToStr( iRef: ITxOutRef ): TxOutRefStr
{
    if( !isITxOutRef( iRef ) )
    throw new BasePlutsError(
        "'ITxOutRefToStr' works on 'ITxOutRef' like objects"
    );

    return `${iRef.id.toString()}#${iRef.index.toString()}` as any;
}

export type UTxORefJson = {
    id: string;
    index: number;
};

export class TxOutRef
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
            id instanceof Hash32 ? id : new Hash32( id )
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "index",
            Number( forceBigUInt( index ) )
        );
    }

    toString(): TxOutRefStr
    {
        return `${this.id.toString()}#${this.index.toString()}` as any;
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

    static fromCbor( cStr: CanBeCborString ): TxOutRef
    {
        return TxOutRef.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): TxOutRef
    {
        if(!(cObj instanceof CborArray ))
        throw new InvalidCborFormatError("TxOutRef");

        const [ _id, _index ] = cObj.array;

        const idRes = Hash32.fromCborObj( _id );

        if(!(_index instanceof CborUInt))
        throw new InvalidCborFormatError("TxOutRef");

        return new TxOutRef({
            id: idRes,
            index: Number( _index.num )
        });
    }

    toJson(): UTxORefJson
    {
        return {
            id: this.id.toString(),
            index: this.index
        };
    }
    
    static get fake(): TxOutRef
    {
        return new TxOutRef({
            id: "ff".repeat(32),
            index: 0
        });
    }
}