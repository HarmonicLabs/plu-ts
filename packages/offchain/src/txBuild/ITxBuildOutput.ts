import { Address, Value, Hash32, Script, TxOut } from "@harmoniclabs/cardano-ledger-ts"
import { CanBeData, canBeData, forceData } from "../utils/CanBeData"
import { cloneData, isData } from "@harmoniclabs/plutus-data"


export interface ITxBuildOutput {
    address: Address,
    value: Value,
    datum?: Hash32 | CanBeData
    refScript?: Script
}

export function txBuildOutToTxOut( {
    address,
    value,
    datum,
    refScript
}: ITxBuildOutput ): TxOut
{
    return new TxOut({
        address: address.clone(),
        value: value.clone(),
        datum: canBeData( datum ) ? forceData( datum ) : datum,
        refScript 
    })
}


export function cloneITxBuildOutput({
    address,
    value,
    datum,
    refScript
}: ITxBuildOutput ): ITxBuildOutput
{
    return {
        address: address.clone(),
        value: value.clone(),
        datum: canBeData( datum ) ?
            ( isData( datum ) ? cloneData( datum ) : forceData( datum ) ) 
            : datum,
        refScript: refScript === undefined ? undefined : refScript.clone()
    };
}