import { DataConstr } from "@harmoniclabs/plutus-data"
import { IRHoisted } from "../IRNodes/IRHoisted"
import { IRConst } from "../IRNodes/IRConst"

export const hoisted_constr1_empty = new IRHoisted(
    IRConst.data( new DataConstr( 1, [] ) )
);