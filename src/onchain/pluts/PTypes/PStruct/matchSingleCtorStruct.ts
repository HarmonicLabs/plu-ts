import { punConstrData } from "../../lib/builtins/data";
import { psndPairNoUnwrap } from "../../lib/builtins/pair/noUnwrap";
import { papp } from "../../lib/papp";
import { pfn } from "../../lib/pfn";
import { phoist } from "../../lib/phoist";
import { data, lam, list, int, TermType } from "../../type_system";

export const matchSingleCtorStruct = (( returnT: TermType ) =>  phoist(
    pfn([
        data,
        lam( list(data), returnT )
    ],  returnT)
    ((structData, continuation) => 
        // it makes no sense to extract the ctor index for datatype defined as single ctors
        // even from security point of view
        // an attacker can always change the data to match the ctor index expected 
        papp( continuation, psndPairNoUnwrap( int, list(data) ).$( punConstrData.$( structData ) ) )
    )
));