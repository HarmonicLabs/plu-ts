import { DataConstr } from "../../../../../types/Data/DataConstr";
import { HoistedUPLC } from "../../../../UPLC/UPLCTerms/HoistedUPLC";
import { genHoistedSourceUID } from "../../../../UPLC/UPLCTerms/HoistedUPLC/HoistedSourceUID/genHoistedSourceUID";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import type { PData } from "../../../PTypes";
import { Term } from "../../../Term";
import { data } from "../../../type_system/types";

const pmakeUnitDataUID = genHoistedSourceUID();
export const pmakeUnitData = () => new Term<PData>(
    data,
    _dbn => new HoistedUPLC(
        UPLCConst.data(
            new DataConstr( 0, [] )
        ),
        pmakeUnitDataUID
    )
);