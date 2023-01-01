import DataConstr from "../../../../types/Data/DataConstr";
import DataI from "../../../../types/Data/DataI";
import { forceBigUInt } from "../../../../types/ints/Integer";

export function getTxIntervalData(
    start: bigint | undefined,
    ttl: bigint | undefined
): DataConstr
{
    const lowerBoundData =
        start === undefined ?
        new DataConstr( 0, [] ) : // PNegInf
        new DataConstr( // PExtended
            1, // PFinite
            [ new DataI( forceBigUInt( start ) ) ]
        );

    const end = start === undefined ? undefined :
        ttl === undefined ? undefined :
        start + ttl;
    
    const upperBoundData =
        end === undefined ?
        new DataConstr( 2, [] ) : // PPosInf
        new DataConstr( // PExtended
            1, // PFinite
            [ new DataI( forceBigUInt( end ) ) ]
        );

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