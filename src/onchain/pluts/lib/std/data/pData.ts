import { Data } from "../../../../../types/Data/Data";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { Term } from "../../../Term";
import { PData } from "../../../PTypes";
import { data } from "../../../type_system/types";

export function pData( dataElem: Data )
: Term<PData>
{
    return new Term(
        data,
        _dbn => UPLCConst.data( dataElem ),
        true // isConstant
    );
}