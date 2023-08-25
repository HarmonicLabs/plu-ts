import { bool, unit } from "../../../type_system";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { pBool } from "../bool";

/**
 we could use `mkNilData` builtin to check if we actually have units
 but we likely dont want the execution to fail by calling `peqUnit`
 so this is just a dummy function that always retuns true.
*/
export const peqUnit = phoist(
    pfn([ unit, unit ], bool )
    (( _u1, _u2 ) => pBool( true ) )
)