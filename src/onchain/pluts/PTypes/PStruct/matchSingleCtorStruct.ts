import { psndPair, punConstrData } from "../../stdlib/Builtins";
import { phoist, pfn, papp } from "../../Syntax/syntax";
import { data, lam, list, int, tyVar } from "../../Term/Type/base";

export const matchSingleCtorStruct = (( returnT ) =>  phoist(
    pfn([
        data,
        lam( list(data), returnT )
    ],  returnT)
    ((structData, continuation) => 
        // it makes no sense to extract the ctor index for datatype defined as single ctors
        // even from security point of view
        // an attacker can always change the data to match the ctor index expected 
        papp( continuation, psndPair( int, list(data) ).$( punConstrData.$( structData ) ) )
    )
))( tyVar("matchSingleCtorStruct_returnT") );