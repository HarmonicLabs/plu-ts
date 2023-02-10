import { ITxOutRef, ITxOutRefToStr, TxOutRef, TxOutRefStr } from "./TxOutRef";
import { IUTxO, isIUTxO } from "./UTxO";


export type CanBeTxOutRef = ITxOutRef | IUTxO | TxOutRefStr;

export function forceTxOutRefStr( canBe: CanBeTxOutRef ): TxOutRefStr
{
    return typeof canBe === "string" ? canBe : ITxOutRefToStr( isIUTxO( canBe ) ? canBe.utxoRef : canBe )
}

export function forceTxOutRef( canBe: CanBeTxOutRef ): TxOutRef
{
    let _interface: ITxOutRef
    if( typeof canBe === "string" )
    {
        const [id,idx] = canBe.split('#');
        _interface = {
            id,
            index: Number( idx )
        } as any;
    }
    else _interface = isIUTxO( canBe ) ? canBe.utxoRef : canBe;

    return new TxOutRef( _interface );
}