import { pgenericStruct, PStruct } from "../../../PTypes/PStruct";
import { bool, ConstantableTermType, PrimType } from "../../../Term/Type";
import PExtended, { PExtendedT } from "./PExtended";

export type PLowerBoundT<T extends ConstantableTermType> = PStruct<{
    PLowerBound: {
        bound: PExtendedT<T>,
        inclusive: [ PrimType.Bool ] 
    }
}>

const _PLowerBound = pgenericStruct( a => {
    return {
        PLowerBound: {
            bound: PExtended( a ).type,
            inclusive: bool 
        }
    }
});

function PLowerBound<T extends ConstantableTermType>( tyArg: T ): PLowerBoundT<T>
{
    return _PLowerBound( tyArg ) as any;
}

export default PLowerBound;