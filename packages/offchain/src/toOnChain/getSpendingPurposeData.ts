import { Hash28, StakeCredentials, StakeValidatorHash, Tx, TxBody, TxRedeemer, TxRedeemerTag, VoterKind } from "@harmoniclabs/cardano-ledger-ts";
import type { ToDataVersion } from "@harmoniclabs/cardano-ledger-ts/dist/toData/defaultToDataVersion";
import { Data, DataB, DataConstr, DataI, DataList, isData } from "@harmoniclabs/plutus-data";
import { lexCompare } from "@harmoniclabs/uint8array-utils";

export function getSpendingPurposeData( rdmr: TxRedeemer, tx: TxBody, version: ToDataVersion = "v3" ): DataConstr
{
    const scriptInfos = getScriptInfoData(
        rdmr,
        tx,
        version
    );

    // for all versions, purpose has never the datum,
    // only script info has the datum
    if( rdmr.tag === TxRedeemerTag.Spend )
    return new DataConstr(
        scriptInfos.constr,
        [ scriptInfos.fields[0] ]
    );

    return scriptInfos;
}

export function getScriptInfoData(
    rdmr: TxRedeemer,
    tx: TxBody,
    version: ToDataVersion,
    datum?: Data | undefined
): DataConstr
{
    version = version ?? "v3";
    const tag = rdmr.tag;

    let ctorIdx: 0 | 1 | 2 | 3 | 4 | 5;
    let purposeArgs: Data[];

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
        purposeArgs = [ new DataB( policy.toBuffer() ) ];
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
        
        purposeArgs = [ utxoRef.toData( version ) ];
        
        if( version === "v3" ) purposeArgs.push(
            isData( datum ) ?
            new DataConstr( 0, [ datum ] ) : // just datum
            new DataConstr( 1, [] ) // nothing
        );
    }
    else if( tag === TxRedeemerTag.Withdraw )
    {
        ctorIdx = 2;
        const stakeAddr = tx.withdrawals?.map[ rdmr.index ]?.rewardAccount
        if( stakeAddr === undefined )
        throw new Error(
            "invalid stake credentials for rewarding redeemer " + rdmr.index.toString()
        );
        purposeArgs = [
            new StakeCredentials(
                "script",
                new StakeValidatorHash( stakeAddr.credentials )
            )
            .toData( version )
        ];
    }
    else if( tag === TxRedeemerTag.Cert )
    {
        ctorIdx = 3;
        const cert = tx.certs?.at( rdmr.index )
        if( cert === undefined )
        throw new Error(
            "invalid certificate for certifyng redeemer " + rdmr.index.toString()
        );
        let tmp: Data;

        tmp = cert.toData( version );

        while( tmp instanceof DataList )
        {
            tmp = tmp.list[0]; 
        }

        purposeArgs = [ tmp ];

        if( version === "v3" )
        {
            purposeArgs.unshift( new DataI( rdmr.index ) );
        }
    }
    else if( version !== "v3" )
    {
        throw new Error(
            "voting and proposing script purpose only introduced in plutus v3"
        );
    }
    else if( tag === TxRedeemerTag.Voting )
    {
        ctorIdx = 4;
        const votingProcedure = tx.votingProcedures?.procedures
        .filter( p => 
            p.voter.kind === VoterKind.ConstitutionalCommitteScript ||
            p.voter.kind === VoterKind.DRepScript
        )[ rdmr.index ];

        if( !votingProcedure )
        {
            throw new Error(
                "mismatching voting redeemer, couldn't find voting procedure at index " +
                rdmr.index.toString()
            );
        }

        purposeArgs = [
            votingProcedure.voter.toData( version )
        ];
    }
    else if( tag === TxRedeemerTag.Proposing )
    {
        ctorIdx = 5;
        const proposalProcedure = tx.proposalProcedures?.filter(
            p => p.rewardAccount.type === "script"
        )[ rdmr.index ];

        if( !proposalProcedure )
        {
            throw new Error(
                "mismatching proposal redeemer,  couldn't find voting procedure at index " +
                rdmr.index.toString()
            );
        }

        purposeArgs = [
            new DataI( rdmr.index ),
            proposalProcedure.toData( version )
        ];
    }
    else throw new Error(
        "invalid redeemer tag"
    );

    return new DataConstr(
        ctorIdx,
        purposeArgs
    );
}