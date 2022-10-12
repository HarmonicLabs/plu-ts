import { pgenericStruct, PStruct } from "../../../PTypes/PStruct";
import { ConstantableStructType, ConstantableTermType } from "../../../Term/Type";
import PLowerBound, { PLowerBoundT } from "./PLowerBound";
import PUpperBound, { PUpperBoundT } from "./PUpperBound";

export type PIntervalT<T extends ConstantableTermType> = PStruct<{
    PInterval: {
        from: PLowerBoundT<T>,
        to: PUpperBoundT<T>
    }
}> & ConstantableStructType

const _PInterval = pgenericStruct( a => {
    return {
        PInterval: {
            from: PLowerBound( a ).type,
            to: PUpperBound( a ).type
        }
    }
});

function PInterval<T extends ConstantableTermType>( tyArg: T ): PIntervalT<T>
{
    return _PInterval( tyArg ) as any;
}

export default PInterval;