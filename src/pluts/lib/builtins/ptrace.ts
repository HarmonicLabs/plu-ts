import { IRNative } from "../../../IR/IRNodes/IRNative";
import type { TermFn, PString } from "../../PTypes";
import { Term } from "../../Term";
import { TermType, ToPType, fn, str, bool, delayed } from "../../../type_system";
import { pdelay } from "../pdelay";
import { perror } from "../perror";
import { pfn } from "../pfn";
import { pforce } from "../pforce";
import { phoist } from "../phoist";
import { plam } from "../plam";
import { pBool } from "../std/bool/pBool";
import { addApplications } from "./addApplications";
import { pif } from "./bool";


export function ptrace<ReturnT extends TermType>( returnT: ReturnT )
    : TermFn<[ PString, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    return addApplications<[ PString, ToPType<ReturnT> ], ToPType<ReturnT>>(
        new Term(
            fn([ str, returnT ], returnT )  as any,
            _dbn => IRNative.trace
        )
    );
}