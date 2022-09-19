import { pappendStr, pencodeUtf8, peqStr } from "../Builtins";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PString from "../../PTypes/PString";
import Term from "../../Term";
import TermBool from "./TermBool";
import TermBS from "./TermBS";

type TermStr = Term<PString> 
& {
    // pappendStr
    concat: ( other: Term<PString> ) => TermStr
    toBytesUtf8: () => TermBS

    eq: ( other: Term<PString> ) => TermBool
}

export default TermStr;

export function addPStringMethods( term: Term<PString> ): TermStr
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "concat",
        ( other: Term<PString> ): TermStr => pappendStr.$( term ).$( other )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "toBytesUtf8",
        (): TermBS => pencodeUtf8.$( term )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: Term<PString> ): TermBool => peqStr.$( term ).$( other )
    );

    return term as any;
}