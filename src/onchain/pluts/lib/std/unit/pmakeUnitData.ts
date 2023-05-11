import { DataConstr } from "../../../../../../../src/types/Data/DataConstr";
import { IRConst } from "../../../../../../../src/onchain/IR/IRNodes/IRConst";
import { IRHoisted } from "../../../../../../../src/onchain/IR/IRNodes/IRHoisted";
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