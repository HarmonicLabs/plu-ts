import { bool, data } from "../../../../type_system/types";
import { punConstrData } from "../../builtins/data";
import { phoist } from "../../phoist";
import { plam } from "../../plam";

export const pBoolFromData = phoist(
    plam( data, bool )
    (
        d => punConstrData.$( d ).fst.eq( 0 ),
        "pBoolFromData"
    )
)