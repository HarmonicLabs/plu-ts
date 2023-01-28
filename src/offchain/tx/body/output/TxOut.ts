import Data, { isData } from "../../../../types/Data";
import Hash32 from "../../../hashes/Hash32/Hash32";
import Script from "../../../script/Script";
import { Value } from "../../../ledger/Value/Value";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { ToCbor } from "../../../../cbor/interfaces/CBORSerializable";
import CborString from "../../../../cbor/CborString";
import Cbor from "../../../../cbor/Cbor";
import Address from "../../../ledger/Address";
import CborMap, { CborMapEntry } from "../../../../cbor/CborObj/CborMap";
import CborUInt from "../../../../cbor/CborObj/CborUInt";
import CborArray from "../../../../cbor/CborObj/CborArray";
import dataToCbor, { dataToCborObj } from "../../../../types/Data/toCbor";
import CborTag from "../../../../cbor/CborObj/CborTag";
import CborBytes from "../../../../cbor/CborObj/CborBytes";
import Cloneable from "../../../../types/interfaces/Cloneable";
import ToData from "../../../../types/Data/toData/interface";
import DataConstr from "../../../../types/Data/DataConstr";
import { maybeData } from "../../../../types/Data/toData/maybeData";
import BasePlutsError from "../../../../errors/BasePlutsError";
import ToJson from "../../../../utils/ts/ToJson";

export interface ITxOut {
    address: Address,
    amount: Value,
    datum?: Hash32 | Data,
    refScript?: Script
}
export default class TxOut
    implements ITxOut, ToCbor, Cloneable<TxOut>, ToData, ToJson
{
    readonly address!: Address
    readonly amount!: Value
    readonly datum?: Hash32 | Data
    readonly refScript?: Script

    clone(): TxOut
    {
        return new TxOut({
            address: this.address.clone(),
            amount: this.amount.clone(),
            datum: this.datum?.clone(),
            refScript: this.refScript?.clone() 
        })
    }

    constructor( txOutput: ITxOut )
    {
        JsRuntime.assert(
            ObjectUtils.isObject( txOutput ) &&
            ObjectUtils.hasOwn( txOutput, "address" ) &&
            ObjectUtils.hasOwn( txOutput, "amount" ),
            "txOutput is missing some necessary fields"
        );

        const {
            address,
            amount,
            datum,
            refScript
        } = txOutput;

        JsRuntime.assert(
            address instanceof Address,
            "invlaid 'address' while constructing 'TxOut'" 
        );
        JsRuntime.assert(
            amount instanceof Value,
            "invlaid 'amount' while constructing 'TxOut'" 
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "address",
            address
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "amount",
            amount
        );

        if( datum !== undefined )
            JsRuntime.assert(
                datum instanceof Hash32 || isData( datum ),
                "invalid 'datum' field"
            );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "datum",
            datum
        );

        if( refScript !== undefined )
            JsRuntime.assert(
                refScript instanceof Script,
                "invalid 'refScript' field"
            );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "refScript",
            refScript
        );
    }

    toData( version: "v1" | "v2" = "v2" ): Data
    {
        if( version === "v1" )
        {
            if( isData( this.datum ) )
            throw new BasePlutsError(
                "trying to convert v2 utxo to v1"
            );

            return new DataConstr(
                0,
                [
                    this.address.toData(),
                    this.amount.toData(),
                    maybeData( this.datum?.toData() )
                ]
            )
        }

        const datumData =
            this.datum === undefined ?
                new DataConstr( 0, [] ) : 
            this.datum instanceof Hash32 ?
                new DataConstr( 1, [ this.datum.toData() ]) :
            this.datum; // inline

        return new DataConstr(
            0,
            [
                this.address.toData(),
                this.amount.toData(),
                datumData,
                maybeData( this.refScript?.hash.toData() )
            ]
        )
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborMap
    {
        const datum = this.datum;

        return new CborMap([
            {
                k: new CborUInt( 0 ),
                v: this.address.toCborObj()
            },
            {
                k: new CborUInt( 1 ),
                v: this.amount.toCborObj()
            },
            datum === undefined ? undefined :
            {
                k: new CborUInt( 2 ),
                v: datum instanceof Hash32 ? 
                    new CborArray([
                        new CborUInt( 0 ),
                        datum.toCborObj()
                    ]) :
                    new CborArray([
                        new CborUInt( 0 ),
                        new CborUInt( 1 ),
                        dataToCborObj( datum )
                    ])
            },
            this.refScript === undefined ? undefined :
            {
                k: new CborUInt( 3 ),
                v: new CborTag( 24, new CborBytes( this.refScript.cbor ) )
            }
        ].filter( elem => elem !== undefined ) as CborMapEntry[])
    }

    toJson()
    {
        return {
            address: this.address.toString(),
            amount: this.amount.toJson(),
            datum: this.datum === undefined ? undefined :
            this.datum instanceof Hash32 ?
            {
                type: "hash",
                hash: this.datum.toString()
            } :
            {
                type: "inline",
                cborHex: dataToCbor( this.datum ).asString
            },
            refScript: this.refScript?.toJson()
        }
    }

}