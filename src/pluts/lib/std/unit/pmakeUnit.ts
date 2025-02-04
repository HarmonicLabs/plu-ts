import { IRConst } from "../../../../IR/IRNodes/IRConst";
import type { PUnit } from "../../../PTypes/PUnit";
import { Term } from "../../../Term";
import { unit } from "../../../../type_system/types";

export const pmakeUnit = () => new Term<PUnit>(
    unit,
    _dbn => IRConst.unit,
    true // isConstant
);