import { DataConstr } from "@harmoniclabs/plutus-data"
import { IRHoisted } from "../IRNodes/IRHoisted"
import { IRConst } from "../IRNodes/IRConst"


const constr1_empty_name = Symbol("constr1_empty")
export const hoisted_constr1_empty = new IRHoisted(
    constr1_empty_name,
    IRConst.data( new DataConstr( 1, [] ) )
);