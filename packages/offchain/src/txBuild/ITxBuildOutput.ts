import { Address, Value, Hash32, Script, TxOut, CanBeHash32, canBeHash32, AddressStr, IValue } from "@harmoniclabs/cardano-ledger-ts"
import { CanBeData, canBeData, forceData } from "../utils/CanBeData"


export interface ITxBuildOutput {
    address: Address | AddressStr,
    value: Value | IValue,
    datum?: CanBeHash32 | CanBeData
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
        address: typeof address === "string" ? Address.fromString( address ) : address.clone(),
        value: value instanceof Value ? value.clone(): new Value( value ),
        datum: canBeData( datum ) ? forceData( datum ) :
        ( canBeHash32( datum ) ? new Hash32( datum ) : undefined ),
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
        address: typeof address === "string" ? Address.fromString( address ) : address.clone(),
        value: value instanceof Value ? value.clone(): new Value( value ),
        datum: canBeData( datum ) ? forceData( datum ) :
            ( canBeHash32( datum ) ? new Hash32( datum ) : undefined ),
        refScript: refScript === undefined ? undefined : refScript.clone()
    };
}