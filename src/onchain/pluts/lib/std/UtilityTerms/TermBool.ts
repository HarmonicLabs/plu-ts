import ObjectUtils from "../../../../../utils/ObjectUtils"
import { Delay } from "../../../../UPLC/UPLCTerms/Delay"
import { PType } from "../../../PType"
import type { PBool, TermFn, PDelayed } from "../../../PTypes"
import { Term, delayed } from "../../../Term"
import { por, pstrictOr, pand, pstrictAnd } from "../../builtins"
import { PappArg } from "../../pappArg"
import { pBool } from "../bool/pBool"


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
            return new Delay(
                toDelay.toUPLC( dbn )
            );
        }
    );
}

export function addPBoolMethods( term: Term<PBool> ): TermBool
{
    ObjectUtils.defineReadOnlyProperty(
        term,
        "orTerm",
        por.$( term )
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

    ObjectUtils.defineReadOnlyProperty(
        term,
        "strictOrTerm",
        pstrictOr.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "strictOr",
        ( other: PappArg<PBool> ): TermBool => pstrictOr.$( term ).$( other )
    );


    ObjectUtils.defineReadOnlyProperty(
        term,
        "andTerm",
        pand.$( term )
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

    ObjectUtils.defineReadOnlyProperty(
        term,
        "strictAndTerm",
        pstrictAnd.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "strictAnd",
        ( other: PappArg<PBool> ): TermBool => pstrictAnd.$( term ).$( other )
    );

    return term as any;
}