import { pgenericStruct, PStruct } from "../../../PTypes/PStruct";
import { ConstantableTermType } from "../../../Term/Type";
import PLowerBound from "./PLowerBound";
import PUpperBound from "./PUpperBound";

export type PIntervalT<T extends ConstantableTermType> = PStruct<{
    PInterval: {
        from: T,
        to: T
    }
}>

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