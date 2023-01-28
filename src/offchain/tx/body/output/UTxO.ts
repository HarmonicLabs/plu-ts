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
import { forceUInteger } from "../../../../types/ints/Integer";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import ToJson from "../../../../utils/ts/ToJson";
import Hash32 from "../../../hashes/Hash32/Hash32";
import TxOut, { ITxOut } from "./TxOut";
import TxOutRef, { ITxOutRef } from "./TxOutRef";

export interface IUTxO {
    utxoRef: ITxOutRef,
    resolved: ITxOut
}

export default class UTxO
    implements IUTxO, ToData, ToJson
{
    readonly utxoRef!: TxOutRef
    readonly resolved!: TxOut

    constructor( utxo: IUTxO )
    constructor({ utxoRef, resolved }: IUTxO)
    {
        ObjectUtils.defineReadOnlyProperty(
            this,
            "utxoRef",
            utxoRef instanceof TxOutRef ? utxoRef : new TxOutRef( utxoRef )
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "resolved",
            resolved instanceof TxOut ? resolved : new TxOut( resolved )
        );
    }

    toData( version: "v1" | "v2" = "v2" ): Data
    {
        return new DataConstr(
            0, // PTxInInfo only constructor
            [
                this.utxoRef.toData(),
                this.resolved.toData( version ) // PTxOut based on specified version
            ]
        );
    }

    toJson()
    {
        return {
            utxoRef: this.utxoRef.toJson(),
            resolved: this.resolved.toJson()
        }
    }
}