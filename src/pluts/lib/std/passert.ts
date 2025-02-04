import { PBool } from "../../PTypes/PBool";
import { PDelayed } from "../../PTypes/PDelayed";
import { TermFn } from "../../PTypes/PFn/PFn";
import { bool, delayed, str, TermType, unit } from "../../../type_system/types";
import { pif, pstrictIf } from "../builtins/bool";
import { pdelay } from "../pdelay";
import { perror } from "../perror";
import { pfn } from "../pfn";
import { pforce } from "../pforce";
import { phoist } from "../phoist";
import { ptraceError } from "./traces";
import { pmakeUnit } from "./unit/pmakeUnit";
import { ToPType } from "../../../type_system/ts-pluts-conversion";

export const passert = phoist(
    pfn([ bool ], unit)
    ( condition => pif( unit ).$( condition ).then( pmakeUnit() ).else( perror( unit ) ) )
);

export const passertOrTrace = phoist(
    pfn([ str, bool ], unit)
    ( (msg, condition) => 
        pif( unit ).$( condition )
        .then( pmakeUnit() )
        .else( ptraceError( unit ).$( msg ) )
    )
);

export const passertAndContinue = <T extends TermType>( 
    resultType: T 
): TermFn<[ PBool, PDelayed<ToPType<T>>], ToPType<T>> => phoist(
    pfn([ bool, delayed( resultType ) ], resultType )
    (( condition, continuation ) =>
        pforce(
            pstrictIf( delayed( resultType ) )
            .$( condition )
            .$( continuation )
            .$( pdelay( perror( resultType ) ) )
        )
    ) as any
);