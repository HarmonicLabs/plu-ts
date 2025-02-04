import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pmakeUnit } from "./pmakeUnit";
import { unit, data } from "../../../../type_system/types";

export const pUnitFromData = phoist(
    plam( data, unit )
    ( _ => pmakeUnit() )
)