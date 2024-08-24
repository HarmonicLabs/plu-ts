import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils"
import { PString, TermFn, PBool } from "../../../PTypes"
import { Term } from "../../../Term"
import { pappendStr, pencodeUtf8, peqStr } from "../../builtins/str"
import { PappArg } from "../../pappArg"
import { plet } from "../../plet"
import { TermBS } from "./TermBS"
import { TermBool } from "./TermBool"
import { addBaseUtilityTerm, BaseUtilityTermExtension } from "./BaseUtilityTerm"


export type TermStr = Term<PString> & BaseUtilityTermExtension & {
    readonly utf8Encoded: TermBS
    
    // pappendStr
    readonly pconcat:    TermFn<[ PString ], PString>
    readonly concat:        ( other: PappArg<PString> ) => TermStr

    readonly peq:    TermFn<[ PString ], PBool >
    readonly eq:        ( other: PappArg<PString> ) => TermBool
}

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function addPStringMethods( term: Term<PString> ): TermStr
{
    term = addBaseUtilityTerm( term );

    definePropertyIfNotPresent(
        term,
        "utf8Encoded",
        {
            get: () => plet( pencodeUtf8.$( term ) ),
            ...getterOnly
        }
    );

    definePropertyIfNotPresent(
        term,
        "pconcat",
        {
            get: () => plet( pappendStr.$( term ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "concat",
        ( other: PappArg<PString> ): TermStr => pappendStr.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "peq",
        {
            get: () => plet( peqStr.$( term ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "eq",
        ( other: PappArg<PString> ): TermBool => peqStr.$( term ).$( other )
    );

    return term as any;
}