import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PInt, TermFn, PBool } from "../../../PTypes";
import { Term } from "../../../Term";
import { psub, pmult, pdiv, pquot, prem, pmod } from "../../builtins/int";
import { peqInt, pgreaterEqInt, pgreaterInt, plessEqInt, plessInt } from "../../builtins/int/intBinOpToBool";
import { padd } from "../../builtins/int/padd";
import { PappArg } from "../../pappArg";
import { TermBool } from "./TermBool";
import { addBaseUtilityTerm, BaseUtilityTermExtension } from "./BaseUtilityTerm";

export type TermInt = Term<PInt> & BaseUtilityTermExtension & {
    
    readonly padd:       TermFn<[PInt], PInt>
    readonly add:           ( other: PappArg<PInt> ) => TermInt

    readonly psub:       TermFn<[PInt], PInt>
    readonly sub:           ( other: PappArg<PInt> ) => TermInt

    readonly pmult:      TermFn<[PInt], PInt>
    readonly mult:          ( other: PappArg<PInt> ) => TermInt

    readonly pdiv:       TermFn<[PInt], PInt>
    readonly div:           ( other: PappArg<PInt> ) => TermInt

    readonly pquot:      TermFn<[PInt], PInt>
    readonly quot:          ( other: PappArg<PInt> ) => TermInt

    readonly premainder: TermFn<[PInt], PInt>
    readonly remainder:     ( other: PappArg<PInt> ) => TermInt

    readonly pmod:       TermFn<[PInt], PInt>
    readonly mod:           ( other: PappArg<PInt> ) => TermInt

    
    readonly peq:    TermFn<[PInt], PBool>
    readonly eq:        ( other: PappArg<PInt> ) => TermBool
        
    readonly plt:    TermFn<[PInt], PBool>
    readonly lt:        ( other: PappArg<PInt> ) => TermBool
        
    readonly pltEq:  TermFn<[PInt], PBool>
    readonly ltEq:      ( other: PappArg<PInt> ) => TermBool
        
    readonly pgt:    TermFn<[PInt], PBool>
    readonly gt:        ( other: PappArg<PInt> ) => TermBool
        
    readonly pgtEq:  TermFn<[PInt], PBool>
    readonly gtEq:      ( other: PappArg<PInt> ) => TermBool
        
};

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function addPIntMethods( term: Term<PInt> )
    : TermInt
{
    term = addBaseUtilityTerm( term );

    definePropertyIfNotPresent(
        term,
        "padd",
        {
            get: () => padd.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "add",
        ( other: PappArg<PInt> ): TermInt => padd.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "psub",
        {
            get: () => psub.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "sub",
        ( other: PappArg<PInt> ): TermInt => psub.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pmult",
        {
            get: () => pmult.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "mult",
        ( other: PappArg<PInt> ): TermInt => pmult.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pdiv",
        {
            get: () => pdiv.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "div",
        ( other: PappArg<PInt> ): TermInt => pdiv.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pquot",
        {
            get: () => pquot.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "quot",
        ( other: PappArg<PInt> ): TermInt => pquot.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "premainder",
        {
            get: () => prem.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "remainder",
        ( other: PappArg<PInt> ): TermInt => prem.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pmod",
        {
            get: () => pmod.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "mod",
        ( other: PappArg<PInt> ): TermInt => pmod.$( term ).$( other )
    );


    definePropertyIfNotPresent(
        term,
        "peq",
        {
            get: () => peqInt.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "eq",
        ( other: PappArg<PInt> ): TermBool => peqInt.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "plt",
        {
            get: () => plessInt.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "lt",
        ( other: PappArg<PInt> ): TermBool => plessInt.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pltEq",
        {
            get: () => plessEqInt.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: PappArg<PInt> ): TermBool => plessEqInt.$( term ).$( other )
    );

    definePropertyIfNotPresent(
        term,
        "pgt",
        {
            get: () => pgreaterInt.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "gt",
        ( other: PappArg<PInt> ): TermBool => plessInt.$( other ).$( term )
    );

    definePropertyIfNotPresent(
        term,
        "pgtEq",
        {
            get: () => pgreaterEqInt.$( term ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: PappArg<PInt> ): TermBool => plessEqInt.$( other ).$( term )
    );


    return term as any;
}

