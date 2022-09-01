import { padd, psub, pmult, pdiv, pquot, prem, pmod, peqInt, plessInt, plessEqInt, pgreaterInt, pgreaterEqInt } from "./Builtins"
import ObjectUtils from "../../../utils/ObjectUtils"
import PInt from "../PTypes/PInt"
import Term from "../Term"
import TermBool, { addPBoolMethods } from "./TermBool"

type TermInt = Term<PInt>
& {
    add: ( other: Term<PInt> ) => TermInt
    sub: ( other: Term<PInt> ) => TermInt
    mult: ( other: Term<PInt> ) => TermInt
    div: ( other: Term<PInt> ) => TermInt
    quot: ( other: Term<PInt> ) => TermInt
    remainder: ( other: Term<PInt> ) => TermInt
    mod: ( other: Term<PInt> ) => TermInt

    eq: ( other: Term<PInt> ) => TermBool
    lt: ( other: Term<PInt> ) => TermBool
    ltEq: ( other: Term<PInt> ) => TermBool
    gt: ( other: Term<PInt> ) => TermBool
    gtEq: ( other: Term<PInt> ) => TermBool
};

export default TermInt;

export function addPIntMethods( term: Term<PInt> )
    : TermInt
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "add",
        ( other: Term<PInt> ) => addPIntMethods( padd.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "sub",
        ( other: Term<PInt> ) => addPIntMethods( psub.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mult",
        ( other: Term<PInt> ) => addPIntMethods( pmult.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "div",
        ( other: Term<PInt> ) => addPIntMethods( pdiv.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "quot",
        ( other: Term<PInt> ) => addPIntMethods( pquot.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "remainder",
        ( other: Term<PInt> ) => addPIntMethods( prem.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mod",
        ( other: Term<PInt> ) => addPIntMethods( pmod.$( term ).$( other ) )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: Term<PInt> ) => addPBoolMethods( peqInt.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "lt",
        ( other: Term<PInt> ) => addPBoolMethods( plessInt.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: Term<PInt> ) => addPBoolMethods( plessEqInt.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gt",
        ( other: Term<PInt> ) => addPBoolMethods( pgreaterInt.$( term ).$( other ) )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: Term<PInt> ) => addPBoolMethods( pgreaterEqInt.$( term ).$( other ) )
    );

    return term as any;
}

