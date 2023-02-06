import { CanBeData, canBeData, forceData } from "../../../../types/Data/CanBeData";
import { Hash32 } from "../../../hashes/Hash32/Hash32";
import { Address } from "../../../ledger/Address";
import { Value } from "../../../ledger/Value/Value";
import { Script } from "../../../script/Script";
import { TxOut } from "../../body/output/TxOut";

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