import Data, { isData } from "../../../../types/Data";
import Hash32 from "../../../hashes/Hash32/Hash32";
import Script from "../../../script/Script";
import { Value } from "../../../ledger/Value";
import TxOutRef from "./TxOutRef";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { ToCbor } from "../../../../cbor/interfaces/CBORSerializable";
import CborObj from "../../../../cbor/CborObj";
import CborString from "../../../../cbor/CborString";
import Cbor from "../../../../cbor/Cbor";
import Address from "../../../ledger/Address";
import CborMap, { CborMapEntry } from "../../../../cbor/CborObj/CborMap";
import CborUInt from "../../../../cbor/CborObj/CborUInt";
import CborArray from "../../../../cbor/CborObj/CborArray";
import { dataToCborObj } from "../../../../types/Data/toCbor";
import CborTag from "../../../../cbor/CborObj/CborTag";
import CborBytes from "../../../../cbor/CborObj/CborBytes";

export interface ITxOut {
    address: Address,
    amount: Value,
    datum?: Hash32 | Data,
    refScript?: Script,
    ref?: TxOutRef
}
export default class TxOut
    implements ITxOut, ToCbor
{
    readonly address!: Address
    readonly amount!: Value
    readonly datum?: Hash32 | Data
    readonly refScript?: Script
    readonly ref?: TxOutRef

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
            refScript,
            ref
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

        if( ref !== undefined )
            JsRuntime.assert(
                ref instanceof TxOutRef,
                "invalid 'ref' field"
            );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "ref",
            ref
        );
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
}