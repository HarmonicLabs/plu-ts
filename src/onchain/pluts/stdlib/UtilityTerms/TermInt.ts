import ObjectUtils from "../../../../utils/ObjectUtils"

import { padd, psub, pmult, pdiv, pquot, prem, pmod, peqInt, plessInt, plessEqInt, pgreaterInt, pgreaterEqInt } from "../Builtins"
import { PInt } from "../../PTypes/PInt"
import { Term } from "../../Term"
import { TermBool } from "./TermBool"
import { TermFn } from "../../PTypes/PFn/PFn"
import { PBool } from "../../PTypes/PBool"
import { PappArg } from "../../Syntax/pappArg"

export type TermInt = Term<PInt> & {
    
    readonly addTerm:       TermFn<[PInt], PInt>
    readonly add:           ( other: PappArg<PInt> ) => TermInt

    readonly subTerm:       TermFn<[PInt], PInt>
    readonly sub:           ( other: PappArg<PInt> ) => TermInt

    readonly multTerm:      TermFn<[PInt], PInt>
    readonly mult:          ( other: PappArg<PInt> ) => TermInt

    readonly divTerm:       TermFn<[PInt], PInt>
    readonly div:           ( other: PappArg<PInt> ) => TermInt

    readonly quotTerm:      TermFn<[PInt], PInt>
    readonly quot:          ( other: PappArg<PInt> ) => TermInt

    readonly remainderTerm: TermFn<[PInt], PInt>
    readonly remainder:     ( other: PappArg<PInt> ) => TermInt

    readonly modTerm:       TermFn<[PInt], PInt>
    readonly mod:           ( other: PappArg<PInt> ) => TermInt

    
    readonly eqTerm:    TermFn<[PInt], PBool>
    readonly eq:        ( other: PappArg<PInt> ) => TermBool
        
    readonly ltTerm:    TermFn<[PInt], PBool>
    readonly lt:        ( other: PappArg<PInt> ) => TermBool
        
    readonly ltEqTerm:  TermFn<[PInt], PBool>
    readonly ltEq:      ( other: PappArg<PInt> ) => TermBool
        
    readonly gtTerm:    TermFn<[PInt], PBool>
    readonly gt:        ( other: PappArg<PInt> ) => TermBool
        
    readonly gtEqTerm:  TermFn<[PInt], PBool>
    readonly gtEq:      ( other: PappArg<PInt> ) => TermBool
        
};

export function addPIntMethods( term: Term<PInt> )
    : TermInt
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "addTerm",
        padd.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "add",
        ( other: PappArg<PInt> ): TermInt => padd.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "subTerm",
        psub.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "sub",
        ( other: PappArg<PInt> ): TermInt => psub.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "multTerm",
        pmult.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mult",
        ( other: PappArg<PInt> ): TermInt => pmult.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "divTerm",
        pdiv.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "div",
        ( other: PappArg<PInt> ): TermInt => pdiv.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "quotTerm",
        pquot.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "quot",
        ( other: PappArg<PInt> ): TermInt => pquot.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "remainderTerm",
        prem.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "remainder",
        ( other: PappArg<PInt> ): TermInt => prem.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "modTerm",
        pmod.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mod",
        ( other: PappArg<PInt> ): TermInt => pmod.$( term ).$( other )
    );


    ObjectUtils.defineReadOnlyProperty(
        term,
        "eqTerm",
        peqInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: PappArg<PInt> ): TermBool => peqInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltTerm",
        plessInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "lt",
        ( other: PappArg<PInt> ): TermBool => plessInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEqTerm",
        plessEqInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: PappArg<PInt> ): TermBool => plessEqInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtTerm",
        pgreaterInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gt",
        ( other: PappArg<PInt> ): TermBool => pgreaterInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEqTerm",
        pgreaterEqInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: PappArg<PInt> ): TermBool => pgreaterEqInt.$( term ).$( other )
    );


    return term as any;
}

