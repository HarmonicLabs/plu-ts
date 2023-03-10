import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import type { PUnit } from "../../../PTypes/PUnit";
import { Term } from "../../../Term";
import { unit } from "../../../type_system/types";

export const pmakeUnit = () => new Term<PUnit>(
    unit,
    _dbn => UPLCConst.unit
);