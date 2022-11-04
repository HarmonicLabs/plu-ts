import { pappendStr, pencodeUtf8, peqStr } from "../Builtins";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PString from "../../PTypes/PString";
import Term from "../../Term";
import TermBS from "./TermBS";
import { TermFn } from "../../PTypes/PFn/PLam";
import PBool from "../../PTypes/PBool";

type TermStr = Term<PString> 
& {
    // pappendStr
    readonly concat: TermFn<[ PString ], PString>
    readonly utf8Encoded: TermBS

    readonly eq: TermFn<[ PString ], PBool >
}

export default TermStr;

export function addPStringMethods( term: Term<PString> ): TermStr
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "concat",
        pappendStr.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "toBytesUtf8",
        pencodeUtf8.$( term )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        peqStr.$( term )
    );

    return term as any;
}