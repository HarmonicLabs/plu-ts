import { ByteString } from "@harmoniclabs/bytestring";
import { ITxOutRef, IUTxO, TxOutRef, TxOutRefStr, UTxO, isITxOutRef, isIUTxO } from "@harmoniclabs/cardano-ledger-ts";

export type CanResolveToUTxO = IUTxO | ITxOutRef | TxOutRefStr;

function isTxOutRefStr( stuff: any ): stuff is TxOutRefStr
{
    if( typeof stuff !== "string" ) return false;

    const [ id, idx, ...rest ] = stuff.split('#');

    if( rest.length !== 0 ) return false;

    if(!(
        ByteString.isValidHexValue(id) && 
        id.length === 64 
    )) return false;

    let n!: number;
    try {
        n = parseInt( idx );
    }
    catch
    {
        return false;
    }

    return Number.isSafeInteger( n )
}

export function canResolveToUTxO( stuff: any ): stuff is CanResolveToUTxO
{
    return (
        isIUTxO( stuff ) ||
        isITxOutRef( stuff ) ||
        isTxOutRefStr( stuff )
    );
}

export function cloneCanResolveToUTxO( stuff: CanResolveToUTxO ): CanResolveToUTxO
{
    if( typeof stuff === "string" ) return stuff;
    if( isIUTxO( stuff ) ) return new UTxO( stuff );
    if( isITxOutRef( stuff ) ) return new TxOutRef( stuff );
    throw new Error("unexpected \"CanResolveToUTxO\"");
}

export function shouldResolveToUTxO( stuff: any ): stuff is (ITxOutRef | TxOutRefStr)
{
    return (
        // isIUTxO( stuff ) ||
        isITxOutRef( stuff ) ||
        isTxOutRefStr( stuff )
    );
}