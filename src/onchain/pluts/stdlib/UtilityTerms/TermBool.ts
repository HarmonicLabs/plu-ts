import { por, pand } from "../Builtins";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PBool from "../../PTypes/PBool";
import Term from "../../Term";
import { TermFn } from "../../PTypes/PFn/PLam";

type TermBool = Term<PBool> 
& {
    readonly or:  TermFn<[PBool], PBool>
    readonly and: TermFn<[PBool], PBool>
}

export default TermBool;

export function addPBoolMethods( term: Term<PBool> ): TermBool
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "or",
        por.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "and",
        pand.$( term )
    );

    return term as any;
}