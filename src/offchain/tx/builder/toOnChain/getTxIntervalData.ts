import { BasePlutsError } from "../../../../errors/BasePlutsError";
import { Data } from "../../../../types/Data/Data";
import { DataConstr } from "../../../../types/Data/DataConstr";
import { DataI } from "../../../../types/Data/DataI";
import { forceBigUInt, unsafeForceUInt } from "../../../../types/ints/Integer";
import { GenesisInfos, isGenesisInfos } from "../TxBuilder/GenesisInfos";

export function POSIXToSlot( POSIX: number, sysStartPOSIX: number, slotLenMs: number ): number
{
    return Math.floor( (POSIX - sysStartPOSIX) / slotLenMs );
}

export function slotToPOSIX( slotN: number, sysStartPOSIX: number, slotLenMs: number ): number
{
    return sysStartPOSIX + (slotLenMs * slotN);
}

export function getTxIntervalData(
    startSlot: bigint | undefined,
    ttlSlot: bigint | undefined,
    geneisInfos: GenesisInfos | undefined
): DataConstr
{
    let lowerBoundData: Data | undefined = undefined;

    if( startSlot === undefined )
    {
        lowerBoundData = new DataConstr( 0, [] ); // PNegInf 
    }
    else
    {
        if( !isGenesisInfos( geneisInfos ) )
        {
            throw new BasePlutsError("missing genesis infos requried to translate slot number to posix")
        }

        lowerBoundData = new DataConstr( // PExtended
            1, // PFinite
            [
                new DataI(
                    slotToPOSIX(
                        unsafeForceUInt( startSlot ),
                        unsafeForceUInt( geneisInfos.systemStartPOSIX ),
                        unsafeForceUInt( geneisInfos.slotLengthInMilliseconds )
                    )
                )
            ]
        );
    }

    const endSlot = startSlot === undefined ? undefined :
        ttlSlot === undefined ? undefined :
        startSlot + ttlSlot;
    
    let upperBoundData: Data | undefined = undefined;

    if( endSlot === undefined )
    {
        upperBoundData = new DataConstr( 2, [] ); // PPosInf 
    }
    else
    {
        if( !isGenesisInfos( geneisInfos ) )
        {
            throw new BasePlutsError("missing genesis infos requried to translate slot number to posix")
        }

        upperBoundData = new DataConstr( // PExtended
            1, // PFinite
            [
                new DataI(
                    slotToPOSIX(
                        unsafeForceUInt( endSlot ),
                        unsafeForceUInt( geneisInfos.systemStartPOSIX ),
                        unsafeForceUInt( geneisInfos.slotLengthInMilliseconds )
                    )
                )
            ]
        );
    }

    return new DataConstr(
        0, // PPosixTimeRange (PInterval) only constructor
        [
            // from
            new DataConstr( // PLowerBound
                0, // only constructor
                [
                    // bound
                    lowerBoundData,
                    // inclusive
                    new DataConstr( 0, [] ) // PDataBool; True
                ]
            ),
            // to
            new DataConstr( // PUpperBound
                0, // only constructor
                [
                    // bound
                    upperBoundData,
                    // inclusive
                    new DataConstr( 1, [] ) // PDataBool; False
                ]
            ),
        ]
    );
}