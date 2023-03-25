import ObjectUtils from "../../../../../utils/ObjectUtils"
import type { PType } from "../../../PType"
import type { PBool, TermFn, PDelayed } from "../../../PTypes"
import type { PappArg } from "../../pappArg"
import { Term } from "../../../Term"
import { pBool } from "../bool/pBool"
import { por, pstrictOr, pand, pstrictAnd } from "../../builtins/bool"
import { delayed } from "../../../type_system/types"
import { IRDelayed } from "../../../../IR/IRNodes/IRDelayed"


export type TermBool = Term<PBool> & {

    readonly orTerm:            TermFn<[ PDelayed<PBool> ], PBool>
    readonly or:                ( other: PappArg<PBool> ) => TermBool

    readonly strictOrTerm:      TermFn<[ PBool ], PBool>
    readonly strictOr:          ( other: PappArg<PBool> ) => TermBool

    readonly andTerm:           TermFn<[ PDelayed<PBool> ], PBool>
    readonly and:               ( other: PappArg<PBool> ) => TermBool

    readonly strictAndTerm:     TermFn<[ PBool ], PBool>
    readonly strictAnd:         ( other: PappArg<PBool> ) => TermBool

}

// avoid circular dependency
// is nothing fancy anyway
function pdelay<PInstance extends PType>(toDelay: Term<PInstance>): Term<PDelayed<PInstance>>
{
    return new Term(
        delayed( toDelay.type ),
        (dbn) => {
            return new IRDelayed(
                toDelay.toIR( dbn )
            );
        }
    );
}

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function addPBoolMethods( term: Term<PBool> ): TermBool
{
    ObjectUtils.definePropertyIfNotPresent(
        term,
        "orTerm",
        {
            get: () => por.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "or",
        ( other: Term<PBool> | boolean ): TermBool =>
            por
            .$( term )
            .$( pdelay( 
                typeof other === "boolean" ? 
                pBool( other ) : other
            ))
    );

    ObjectUtils.definePropertyIfNotPresent(
        term,
        "strictOrTerm",
        {
            get: () => pstrictOr.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "strictOr",
        ( other: PappArg<PBool> ): TermBool => pstrictOr.$( term ).$( other )
    );


    ObjectUtils.definePropertyIfNotPresent(
        term,
        "andTerm",
        {
            get: () => pand.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "and",
        ( other: Term<PBool> | boolean ): TermBool => 
            pand
            .$( term )
            .$( pdelay( 
                typeof other === "boolean" ? 
                pBool( other ) : other
            ))
    );

    ObjectUtils.definePropertyIfNotPresent(
        term,
        "strictAndTerm",
        {
            get: () => pstrictAnd.$( term ),
            ...getterOnly
        }
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "strictAnd",
        ( other: PappArg<PBool> ): TermBool => pstrictAnd.$( term ).$( other )
    );

    return term as any;
}