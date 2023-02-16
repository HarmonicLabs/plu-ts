import ObjectUtils from "../../../../../utils/ObjectUtils"
import { PString, TermFn, PBool } from "../../../PTypes"
import { Term } from "../../../Term"
import { pappendStr, pencodeUtf8, peqStr } from "../../builtins/str"
import { PappArg } from "../../pappArg"
import { TermBS } from "./TermBS"
import { TermBool } from "./TermBool"


export type TermStr = Term<PString> & {
    readonly utf8Encoded: TermBS
    
    // pappendStr
    readonly concatTerm:    TermFn<[ PString ], PString>
    readonly concat:        ( other: PappArg<PString> ) => TermStr

    readonly eqTerm:    TermFn<[ PString ], PBool >
    readonly eq:        ( other: PappArg<PString> ) => TermBool
}

export function addPStringMethods( term: Term<PString> ): TermStr
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "utf8Encoded",
        pencodeUtf8.$( term )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "concatTerm",
        pappendStr.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "concat",
        ( other: PappArg<PString> ): TermStr => pappendStr.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "eqTerm",
        peqStr.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: PappArg<PString> ): TermBool => peqStr.$( term ).$( other )
    );

    return term as any;
}