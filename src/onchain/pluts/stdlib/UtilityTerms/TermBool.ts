import { por, pand } from "../Builtins";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PBool from "../../PTypes/PBool";
import Term from "../../Term";
import { TermFn } from "../../PTypes/PFn/PLam";
import Delay from "../../../UPLC/UPLCTerms/Delay";
import PType from "../../PType";
import PDelayed from "../../PTypes/PDelayed";
import { delayed } from "../../Term/Type/base";

type TermBool = Term<PBool> & {
    
    readonly orTerm:    TermFn<[ PDelayed<PBool> ], PBool>
    readonly or:        ( other: Term<PBool> ) => TermBool

    readonly andTerm:   TermFn<[ PDelayed<PBool> ], PBool>
    readonly and:       ( other: Term<PBool> ) => TermBool

}

export default TermBool;

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
        ( other: Term<PBool> ): TermBool => por.$( term ).$( pdelay( other ) )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "andTerm",
        pand.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "and",
        ( other: Term<PBool> ): TermBool => pand.$( term ).$( pdelay( other ) )
    );


    return term as any;
}