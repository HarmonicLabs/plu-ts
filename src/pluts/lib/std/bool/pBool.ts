import { IRConst } from "../../../../IR/IRNodes/IRConst";
import type { PBool } from "../../../PTypes/PBool";
import { Term } from "../../../Term";
import { bool } from "../../../../type_system";
import { TermBool, addPBoolMethods } from "../UtilityTerms/TermBool";

export function pBool( b: boolean ): TermBool
{
    return addPBoolMethods(
        new Term<PBool>(
            bool,
            _dbn => IRConst.bool( b ),
            true
        )
    );
}