import { por, pand } from "./Builtins";
import ObjectUtils from "../../../utils/ObjectUtils";
import PBool from "../PTypes/PBool";
import Term from "../Term";

type TermBool = Term<PBool> 
& {
    or: ( other: Term<PBool> ) => TermBool
    and: ( other: Term<PBool> ) => TermBool
}

export default TermBool;

export function addPBoolMethods( term: Term<PBool> ): TermBool
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "or",
        ( other: Term<PBool> ): TermBool => por.$( term ).$( other )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "and",
        ( other: Term<PBool> ): TermBool => pand.$( term ).$( other )
    );

    return term as any;
}