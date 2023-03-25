import ObjectUtils from "../../../../utils/ObjectUtils";

import { Cbor } from "../../../../cbor/Cbor";
import { CborObj } from "../../../../cbor/CborObj";
import { CborString, CanBeCborString, forceCborString } from "../../../../cbor/CborString";
import { ToCbor } from "../../../../cbor/interfaces/CBORSerializable";
import { Data } from "../../../../types/Data/Data";
import { DataConstr } from "../../../../types/Data/DataConstr";
import { ToData } from "../../../../types/Data/toData/interface";
import { ToJson } from "../../../../utils/ts/ToJson";
import { TxOut, ITxOut, isITxOut } from "./TxOut";
import { TxOutRef, ITxOutRef, isITxOutRef } from "./TxOutRef";
import { CborArray } from "../../../../cbor/CborObj/CborArray";
import { InvalidCborFormatError } from "../../../../errors/InvalidCborFormatError";
import { Cloneable } from "../../../../types/interfaces/Cloneable";

export interface IUTxO {
    utxoRef: ITxOutRef,
    resolved: ITxOut
}

export function isIUTxO( stuff: any ): stuff is IUTxO
{
    return (
        ObjectUtils.isObject( stuff ) &&
        ObjectUtils.hasOwn( stuff, "utxoRef" ) && isITxOutRef( stuff.utxoRef ) &&
        ObjectUtils.hasOwn( stuff, "resolved" ) && isITxOut( stuff.resolved )
    );
}

export class UTxO
    implements IUTxO, ToData, ToJson, ToCbor, Cloneable<UTxO>
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

    clone(): UTxO
    {
        return new UTxO( this );
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
        return new CborArray([
            this.utxoRef.toCborObj(),
            this.resolved.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): UTxO
    {
        return UTxO.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): UTxO
    {
        if(!(cObj instanceof CborArray))
        throw new InvalidCborFormatError("UTxO");

        const [ ref, res ] = cObj.array;

        let utxoRef: TxOutRef;
        let resolved: TxOut;

        if( ref === undefined )
        throw new InvalidCborFormatError("UTxO");

        if( res === undefined )
        throw new InvalidCborFormatError(
            "UTxO",
            "if you are trying to parse only a TxOutRef instead (<hex>#<index>) you should use `TxOutRef.fromCborObj`"
        );

        utxoRef = TxOutRef.fromCborObj( ref );
        resolved = TxOut.fromCborObj( res );

        return new UTxO({
            utxoRef,
            resolved
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
