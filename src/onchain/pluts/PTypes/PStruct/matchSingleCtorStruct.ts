import { data, lam, list, int, tyVar } from "../../Term/Type/base";
import { psndPair, punConstrData } from "../../lib/builtins";
import { papp } from "../../lib/papp";
import { pfn } from "../../lib/pfn";
import { phoist } from "../../lib/phoist";

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