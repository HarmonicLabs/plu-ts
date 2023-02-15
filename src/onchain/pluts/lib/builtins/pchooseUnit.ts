import { Builtin } from "../../../UPLC/UPLCTerms/Builtin";
import { TermFn, PUnit } from "../../PTypes";
import { Term } from "../../Term";
import { TermType, ToPType, tyVar, fn, unit } from "../../type_system";
import { addApplications } from "./addApplications";

export function pchooseUnit<ReturnT extends TermType>( returnT: ReturnT )
    : TermFn<[ PUnit, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    return addApplications<[ PUnit, ToPType<ReturnT> ], ToPType<ReturnT>>(
        new Term(
            fn([ unit, returnT ], returnT ) as any,
            _dbn => Builtin.chooseUnit,
        )
    );
}
