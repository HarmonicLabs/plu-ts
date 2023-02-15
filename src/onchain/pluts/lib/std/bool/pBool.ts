import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import type { PBool } from "../../../PTypes/PBool";
import { Term } from "../../../Term";
import { bool } from "../../../type_system";
import { TermBool, addPBoolMethods } from "../UtilityTerms";

export function pBool( b: boolean ): TermBool
{
    return addPBoolMethods(
        new Term<PBool>(
            bool,
            _dbn => UPLCConst.bool( b ),
            true
        )
    );
}