import { Hash28, StakeCredentials, StakeValidatorHash, Tx, TxBody, TxRedeemer, TxRedeemerTag } from "@harmoniclabs/cardano-ledger-ts";
import { Data, DataB, DataConstr } from "@harmoniclabs/plutus-data";
import { lexCompare } from "@harmoniclabs/uint8array-utils";

export function getSpendingPurposeData( rdmr: TxRedeemer, tx: TxBody ): DataConstr
{
    const tag = rdmr.tag;

    let ctorIdx: 0 | 1 | 2 | 3;
    let purposeArgData: Data;

    if( tag === TxRedeemerTag.Mint )
    {
        ctorIdx = 0;
        const policy = tx.mint
            // "+ 1" because in `plu-ts` values we keep track of lovelaces anyway
            ?.map[ rdmr.index + 1 ]
            .policy;
        if(!( policy instanceof Hash28 ))
        throw new Error(
            "invalid minting policy for minting redeemer " + rdmr.index.toString()
        );
        purposeArgData = new DataB( policy.toBuffer() );
    }
    else if( tag === TxRedeemerTag.Spend )
    {
        ctorIdx = 1;
        const sortedIns = tx.inputs.slice().sort((a,b) => {
            const ord = lexCompare( a.utxoRef.id.toBuffer(), b.utxoRef.id.toBuffer() );
            // if equal tx id order based on tx output index
            if( ord === 0 ) return a.utxoRef.index - b.utxoRef.index;
            // else order by tx id
            return ord;
        });
        const utxoRef = sortedIns[ rdmr.index ]?.utxoRef;
        if( utxoRef === undefined )
        throw new Error(
            "invalid 'Spend' redeemer index: " + rdmr.index.toString() +
            "; tx.inputs.length is: " + tx.inputs.length.toString()
        );
        purposeArgData = utxoRef.toData();
    }
    else if( tag === TxRedeemerTag.Withdraw )
    {
        ctorIdx = 2;
        const stakeAddr = tx.withdrawals?.map[ rdmr.index ]?.rewardAccount
        if( stakeAddr === undefined )
        throw new Error(
            "invalid stake credentials for rewarding redeemer " + rdmr.index.toString()
        );
        purposeArgData = new StakeCredentials(
            "script",
            new StakeValidatorHash( stakeAddr.credentials )
        ).toData();
    }
    else if( tag === TxRedeemerTag.Cert )
    {
        ctorIdx = 3;
        const cert = tx.certs?.at( rdmr.index )
        if( cert === undefined )
        throw new Error(
            "invalid certificate for certifyng redeemer " + rdmr.index.toString()
        );
        purposeArgData = cert.toData();
    }
    else throw new Error(
        "invalid redeemer tag"
    );

    return new DataConstr(
        ctorIdx,
        [ purposeArgData ]
    );
}