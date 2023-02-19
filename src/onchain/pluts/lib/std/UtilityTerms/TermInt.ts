import ObjectUtils from "../../../../../utils/ObjectUtils";
import { PInt, TermFn, PBool } from "../../../PTypes";
import { Term } from "../../../Term";
import { psub, pmult, pdiv, pquot, prem, pmod } from "../../builtins/int/";
import { peqInt, pgreaterEqInt, pgreaterInt, plessEqInt, plessInt } from "../../builtins/int/intBinOpToBool";
import { padd } from "../../builtins/int/padd";
import { PappArg } from "../../pappArg";
import { TermBool } from "./TermBool";


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

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function addPIntMethods( term: Term<PInt> )
    : TermInt
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "addTerm",
        {
            get: () => padd.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "add",
        ( other: PappArg<PInt> ): TermInt => padd.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "subTerm",
        {
            get: () => psub.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "sub",
        ( other: PappArg<PInt> ): TermInt => psub.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "multTerm",
        {
            get: () => pmult.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mult",
        ( other: PappArg<PInt> ): TermInt => pmult.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "divTerm",
        {
            get: () => pdiv.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "div",
        ( other: PappArg<PInt> ): TermInt => pdiv.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "quotTerm",
        {
            get: () => pquot.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "quot",
        ( other: PappArg<PInt> ): TermInt => pquot.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "remainderTerm",
        {
            get: () => prem.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "remainder",
        ( other: PappArg<PInt> ): TermInt => prem.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "modTerm",
        {
            get: () => pmod.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "mod",
        ( other: PappArg<PInt> ): TermInt => pmod.$( term ).$( other )
    );


    ObjectUtils.defineReadOnlyProperty(
        term,
        "eqTerm",
        {
            get: () => peqInt.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "eq",
        ( other: PappArg<PInt> ): TermBool => peqInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltTerm",
        {
            get: () => plessInt.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "lt",
        ( other: PappArg<PInt> ): TermBool => plessInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEqTerm",
        {
            get: () => plessEqInt.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "ltEq",
        ( other: PappArg<PInt> ): TermBool => plessEqInt.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtTerm",
        {
            get: () => pgreaterInt.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gt",
        ( other: PappArg<PInt> ): TermBool => plessInt.$( other ).$( term )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEqTerm",
        {
            get: () => pgreaterEqInt.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "gtEq",
        ( other: PappArg<PInt> ): TermBool => plessEqInt.$( other ).$( term )
    );


    return term as any;
}

