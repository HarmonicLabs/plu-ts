import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import type { PUnit } from "../../../PTypes/PUnit";
import { Term, Type } from "../../../Term";

export const pmakeUnit = () => new Term<PUnit>(
    Type.Unit,
    _dbn => UPLCConst.unit
);