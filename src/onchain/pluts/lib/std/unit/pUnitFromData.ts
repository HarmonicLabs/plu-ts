import { data, unit } from "../../../Term/Type";
import { pif, punConstrData } from "../../builtins";
import { perror } from "../../perror";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pmakeUnit } from "./pmakeUnit";

export const pUnitFromData = phoist(
    plam( data, unit )
    ( data =>
        pif( unit )
        .$(
            punConstrData.$( data ).fst.eq( 0 )
        )
        .$( pmakeUnit() )
        .$( perror( unit ) )
    )
)