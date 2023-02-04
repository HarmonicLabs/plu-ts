import { bool, data } from "../../../Term/Type";
import { punConstrData } from "../../builtins";
import { phoist } from "../../phoist";
import { plam } from "../../plam";

export const pBoolFromData = phoist(
    plam( data, bool )
    ( d => punConstrData.$( d ).fst.eq( 0 ) )
)