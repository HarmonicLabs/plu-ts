import ObjectUtils from "../../../../utils/ObjectUtils";

import { Cbor } from "../../../../cbor/Cbor";
import { CborObj } from "../../../../cbor/CborObj";
import { CborString, CanBeCborString, forceCborString } from "../../../../cbor/CborString";
import { ToCbor } from "../../../../cbor/interfaces/CBORSerializable";
import { Data } from "../../../../types/Data/Data";
import { DataConstr } from "../../../../types/Data/DataConstr";
import { ToData } from "../../../../types/Data/toData/interface";
import { ToJson } from "../../../../utils/ts/ToJson";
import { TxOut, ITxOut } from "./TxOut";
import { TxOutRef, ITxOutRef } from "./TxOutRef";

export interface IUTxO {
    utxoRef: ITxOutRef,
    resolved: ITxOut
}

export class UTxO
    implements IUTxO, ToData, ToJson, ToCbor
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

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() )
    }
    toCborObj()
    {
        return this.utxoRef.toCborObj()
    }

    static fromCbor( cStr: CanBeCborString ): UTxO
    {
        return UTxO.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): UTxO
    {
        return new UTxO({
            utxoRef: TxOutRef.fromCborObj( cObj ),
            resolved: TxOut.fake
        })
    }

    toJson()
    {
        return {
            utxoRef: this.utxoRef.toJson(),
            resolved: this.resolved.toJson()
        }
    }

}

export { TxOutRef };
