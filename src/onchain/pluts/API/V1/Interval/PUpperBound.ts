import { pgenericStruct, PStruct } from "../../../PTypes/PStruct";
import { bool, ConstantableTermType, PrimType } from "../../../Term/Type";
import PExtended, { PExtendedT } from "./PExtended";

export type PUpperBoundT<T extends ConstantableTermType> = PStruct<{
    PUpperBound: {
        bound: PExtendedT<T>,
        inclusive: [ PrimType.Bool ] 
    }
}>

const _PUpperBound = pgenericStruct( a => {
    return {
        PUpperBound: {
            bound: PExtended( a ).type,
            inclusive: bool 
        }
    }
});

function PUpperBound<T extends ConstantableTermType>( tyArg: T ): PUpperBoundT<T>
{
    return _PUpperBound( tyArg ) as any;
}

export default PUpperBound;