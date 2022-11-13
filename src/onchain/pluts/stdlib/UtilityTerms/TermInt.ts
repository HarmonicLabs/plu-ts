import { padd, psub, pmult, pdiv, pquot, prem, pmod, peqInt, plessInt, plessEqInt, pgreaterInt, pgreaterEqInt } from "../Builtins"
import ObjectUtils from "../../../../utils/ObjectUtils"
import PInt from "../../PTypes/PInt"
import Term from "../../Term"
import TermBool from "./TermBool"
import { TermFn } from "../../PTypes/PFn/PLam"
import PBool from "../../PTypes/PBool"

type TermInt = Term<PInt> & {
    
    readonly addTerm:       TermFn<[PInt], PInt>
    readonly add:           ( other: Term<PInt> ) => TermInt

    readonly subTerm:       TermFn<[PInt], PInt>
    readonly sub:           ( other: Term<PInt> ) => TermInt

    readonly multTerm:      TermFn<[PInt], PInt>
    readonly mult:          ( other: Term<PInt> ) => TermInt

    readonly divTerm:       TermFn<[PInt], PInt>
    readonly div:           ( other: Term<PInt> ) => TermInt

    readonly quotTerm:      TermFn<[PInt], PInt>
    readonly quot:          ( other: Term<PInt> ) => TermInt

    readonly remainderTerm: TermFn<[PInt], PInt>
    readonly remainder:     ( other: Term<PInt> ) => TermInt

    readonly modTerm:       TermFn<[PInt], PInt>
    readonly mod:           ( other: Term<PInt> ) => TermInt

    
    readonly eqTerm:    TermFn<[PInt], PBool>
    readonly eq:        ( other: Term<PInt> ) => TermBool
        
    readonly ltTerm:    TermFn<[PInt], PBool>
    readonly lt:        ( other: Term<PInt> ) => TermBool
        
    readonly ltEqTerm:  TermFn<[PInt], PBool>
    readonly ltEq:      ( other: Term<PInt> ) => TermBool
        
    readonly gtTerm:    TermFn<[PInt], PBool>
    readonly gt:        ( other: Term<PInt> ) => TermBool
        
    readonly gtEqTerm:  TermFn<[PInt], PBool>
    readonly gtEq:      ( other: Term<PInt> ) => TermBool
        
};

export default TermInt;

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
        ( other: Term<PInt> ): TermInt => padd.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "subTerm",
        psub.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "sub",
        ( other: Term<PInt> ): TermInt => psub.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "multTerm",
        pmult.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mult",
        ( other: Term<PInt> ): TermInt => pmult.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "divTerm",
        pdiv.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "div",
        ( other: Term<PInt> ): TermInt => pdiv.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "quotTerm",
        pquot.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "quot",
        ( other: Term<PInt> ): TermInt => pquot.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "remainderTerm",
        prem.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "remainder",
        ( other: Term<PInt> ): TermInt => prem.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "modTerm",
        pmod.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mod",
        ( other: Term<PInt> ): TermInt => pmod.$( term ).$( other )
    );


    ObjectUtils.defineReadOnlyProperty(
        term,
        "eqTerm",
        peqInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: Term<PInt> ): TermBool => peqInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltTerm",
        plessInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "lt",
        ( other: Term<PInt> ): TermBool => plessInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEqTerm",
        plessEqInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: Term<PInt> ): TermBool => plessEqInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtTerm",
        pgreaterInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gt",
        ( other: Term<PInt> ): TermBool => pgreaterInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEqTerm",
        pgreaterEqInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: Term<PInt> ): TermBool => pgreaterEqInt.$( term ).$( other )
    );


    return term as any;
}

