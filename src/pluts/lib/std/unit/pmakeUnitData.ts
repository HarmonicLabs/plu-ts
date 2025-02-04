import { DataConstr } from "@harmoniclabs/plutus-data";
import type { PData } from "../../../PTypes";
import { Term } from "../../../Term";
import { data } from "../../../../type_system/types";
import { IRHoisted } from "../../../../IR/IRNodes/IRHoisted";
import { IRConst } from "../../../../IR/IRNodes/IRConst";

export const pmakeUnitData = () => new Term<PData>(
    data,
    _dbn => new IRHoisted(
        IRConst.data(
            new DataConstr( 0, [] )
        )
    )
);