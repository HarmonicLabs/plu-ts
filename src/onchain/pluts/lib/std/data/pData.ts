import { Data } from "../../../../../types/Data/Data";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { Term, data } from "../../../Term";
import { PData } from "../../../PTypes";

export function pData( dataElem: Data )
: Term<PData>
{
    return new Term(
        data,
        _dbn => UPLCConst.data( dataElem )
    );
}