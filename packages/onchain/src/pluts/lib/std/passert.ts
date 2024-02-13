import { bool, str, unit } from "../../type_system/types";
import { pif } from "../builtins/bool";
import { ptraceError } from "../builtins/ptrace";
import { perror } from "../perror";
import { pfn } from "../pfn";
import { phoist } from "../phoist";
import { pmakeUnit } from "./unit/pmakeUnit";

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