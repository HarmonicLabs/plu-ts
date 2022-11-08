import { por, pand } from "../Builtins";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PBool from "../../PTypes/PBool";
import Term from "../../Term";
import { TermFn } from "../../PTypes/PFn/PLam";

type TermBool = Term<PBool> 
& {
    readonly orTerm:    TermFn<[PBool], PBool>
    readonly or:        ( other: Term<PBool> ) => TermBool

    readonly andTerm:   TermFn<[PBool], PBool>
    readonly and:       ( other: Term<PBool> ) => TermBool

}

export default TermBool;

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
        ( other: Term<PBool> ): TermBool => por.$( term ).$( other )
    );

    ObjectUtils.defineReadOnlyProperty(
        term,
        "andTerm",
        pand.$( term )
    );
    ObjectUtils.defineReadOnlyProperty(
        term,
        "and",
        ( other: Term<PBool> ): TermBool => pand.$( term ).$( other )
    );


    return term as any;
}