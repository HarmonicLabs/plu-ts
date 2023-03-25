import { DataConstr } from "../../../../../types/Data/DataConstr";
import { IRConst } from "../../../../IR/IRNodes/IRConst";
import { IRHoisted } from "../../../../IR/IRNodes/IRHoisted";
import type { PData } from "../../../PTypes";
import { Term } from "../../../Term";
import { data } from "../../../type_system/types";

export const pmakeUnitData = () => new Term<PData>(
    data,
    _dbn => new IRHoisted(
        IRConst.data(
            new DataConstr( 0, [] )
        )
    )
);