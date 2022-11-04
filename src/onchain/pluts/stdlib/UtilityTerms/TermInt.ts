import { padd, psub, pmult, pdiv, pquot, prem, pmod, peqInt, plessInt, plessEqInt, pgreaterInt, pgreaterEqInt } from "../Builtins"
import ObjectUtils from "../../../../utils/ObjectUtils"
import PInt from "../../PTypes/PInt"
import Term from "../../Term"
import TermBool from "./TermBool"
import { TermFn } from "../../PTypes/PFn/PLam"
import PBool from "../../PTypes/PBool"

type TermInt = Term<PInt>
& {
    readonly add:       TermFn<[PInt], PInt>
    readonly sub:       TermFn<[PInt], PInt>
    readonly mult:      TermFn<[PInt], PInt>
    readonly div:       TermFn<[PInt], PInt>
    readonly quot:      TermFn<[PInt], PInt>
    readonly remainder: TermFn<[PInt], PInt>
    readonly mod:       TermFn<[PInt], PInt>

    readonly eq:    TermFn<[PInt], PBool>
    readonly lt:    TermFn<[PInt], PBool>
    readonly ltEq:  TermFn<[PInt], PBool>
    readonly gt:    TermFn<[PInt], PBool>
    readonly gtEq:  TermFn<[PInt], PBool>
};

export default TermInt;

export function addPIntMethods( term: Term<PInt> )
    : TermInt
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "add",
        padd.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "sub",
        psub.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mult",
        pmult.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "div",
        pdiv.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "quot",
        pquot.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "remainder",
        prem.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mod",
        pmod.$( term )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        peqInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "lt",
        plessInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEq",
        plessEqInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gt",
        pgreaterInt.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEq",
        pgreaterEqInt.$( term )
    );

    return term as any;
}

