import { DataConstr } from "../../../../../types/Data/DataConstr";
import { HoistedUPLC } from "../../../../UPLC/UPLCTerms/HoistedUPLC";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import type { PData } from "../../../PTypes";
import { Term, data } from "../../../Term";

export const pmakeUnitData = () => new Term<PData>(
    data,
    _dbn => new HoistedUPLC(
        UPLCConst.data(
            new DataConstr( 0, [] )
        )
    )
);