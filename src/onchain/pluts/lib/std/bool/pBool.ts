import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import type { PBool } from "../../../PTypes/PBool";
import { Term, Type } from "../../../Term";
import { TermBool, addPBoolMethods } from "../UtilityTerms";

export function pBool( bool: boolean ): TermBool
{
    return addPBoolMethods(
        new Term<PBool>(
            Type.Bool,
            _dbn => UPLCConst.bool( bool ),
            true
        )
    );
}