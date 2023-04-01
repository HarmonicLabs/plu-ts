import ObjectUtils from "../../../../../utils/ObjectUtils"
import { PString, TermFn, PBool } from "../../../PTypes"
import { Term } from "../../../Term"
import { pappendStr, pencodeUtf8, peqStr } from "../../builtins/str"
import { PappArg } from "../../pappArg"
import { plet } from "../../plet"
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

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function addPStringMethods( term: Term<PString> ): TermStr
{
    ObjectUtils.definePropertyIfNotPresent(
        term,
        "utf8Encoded",
        {
            get: () => plet( pencodeUtf8.$( term ) ),
            ...getterOnly
        }
    );

    ObjectUtils.definePropertyIfNotPresent(
        term,
        "concatTerm",
        {
            get: () => plet( pappendStr.$( term ) ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "concat",
        ( other: PappArg<PString> ): TermStr => pappendStr.$( term ).$( other )
    );

    ObjectUtils.definePropertyIfNotPresent(
        term,
        "eqTerm",
        {
            get: () => plet( peqStr.$( term ) ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: PappArg<PString> ): TermBool => peqStr.$( term ).$( other )
    );

    return term as any;
}