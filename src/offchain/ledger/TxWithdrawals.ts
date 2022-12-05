import Coin from "../Coin";
import Hash28 from "../hashes/Hash28/Hash28";

export type TxWithdrawalsMap = {
    rewardAccount: Hash28,
    amount: Coin
}[];

export type ITxWithdrawals
    = { [rewardAccount: string]: Coin }
    | TxWithdrawalsMap;

export default class TxWithdrawals
{
    readonly map: TxWithdrawalsMap

    constructor( map: ITxWithdrawals )
    {
        
    }
}